---
service_chittyid: "TBD-pending-canonical-mint"
service_name: "chittymonitor"
canonical_uri: "chittycanon://core/services/chittymonitor"
pentad_version: "1.0.0"
tier: 3
last_reviewed: "2026-07-30"
next_review_due: "2026-10-30"
---

# chittymonitor — Security

## 1. Threat surface

**Exposed endpoints (`monitor.chitty.cc`):**
- `GET /health` — liveness (public per SOP-051)
- `GET /api/health/latest` — last sweep results (public, read-only)
- `GET /api/health/:service` — per-service history (public, read-only)
- `POST /track` — app heartbeat ingestion (requires `CHITTY_AUTH_SERVICE_TOKEN`)
- `POST /api/chittyflow/workflows` — CI/CD record ingestion (requires `CHITTY_AUTH_SERVICE_TOKEN`)
- `POST /webhook/github` — GitHub push webhook (requires `GITHUB_WEBHOOK_SECRET` HMAC validation)
- `GET /status` — ecosystem summary (public)
- `POST /check` — trigger health sweep (requires `CHITTY_AUTH_SERVICE_TOKEN`)

**Cron surface:**
- Scheduled `*/5 * * * *` sweep — outbound fetch to 23 `*.chitty.cc` services at `/health`
- Cron is not externally triggerable

**Trust boundaries:**
- Public → chittymonitor (read-only endpoints, no auth)
- chittyflow → chittymonitor (write endpoints, service token)
- GitHub → chittymonitor (webhook, HMAC-validated)
- chittymonitor → `*.chitty.cc` services (outbound health sweep, read-only)
- chittymonitor → GitHub API (commit status writes, `GITHUB_APP_TOKEN`)
- chittymonitor → CF Builds API (trigger deploys, `CF_API_TOKEN`)

## 2. Authentication & authorization

- **Write endpoint auth**: `Authorization: Bearer <CHITTY_AUTH_SERVICE_TOKEN>` — validated inline
- **Webhook auth**: `X-Hub-Signature-256` HMAC-SHA256 verified against `GITHUB_WEBHOOK_SECRET` using `crypto.subtle` (Web Crypto API)
- **Read endpoints**: unauthenticated — health data is non-sensitive
- **Outbound**: service tokens for GitHub and CF APIs stored in CF Secrets Store

| Endpoint | Auth required | Method |
|---|---|---|
| `POST /track` | Yes | Bearer `CHITTY_AUTH_SERVICE_TOKEN` |
| `POST /api/chittyflow/workflows` | Yes | Bearer `CHITTY_AUTH_SERVICE_TOKEN` |
| `POST /webhook/github` | Yes | HMAC-SHA256 `GITHUB_WEBHOOK_SECRET` |
| `POST /check` | Yes | Bearer `CHITTY_AUTH_SERVICE_TOKEN` |
| `GET /health`, `/api/health/*`, `/status` | No | — |

## 3. Data classifications

- **Service health results**: PUBLIC — latency, status, timestamp per service
- **App beacon data**: INTERNAL — app names, runtime versions, package lists
- **CI/CD workflow records**: INTERNAL — repo, branch, commit SHA, build status
- **Webhook configs table**: PRIVILEGED — maps repos to CF Worker scripts (controls what gets deployed)
- **GitHub/CF tokens**: SECRET — stored in CF Secrets Store only, never logged

## 4. Secrets held

| Secret | Purpose | Storage | Rotation | Last rotated |
|---|---|---|---|---|
| `CHITTY_AUTH_SERVICE_TOKEN` | Authenticate inbound write calls | CF Secrets Store | 90-day | 2026-07-29 |
| `GITHUB_WEBHOOK_SECRET` | Validate GitHub push webhooks | CF Secrets Store | 90-day | TBD |
| `GITHUB_APP_TOKEN` | Post commit statuses to GitHub | CF Secrets Store | 90-day | TBD |
| `CF_API_TOKEN` | Trigger CF Workers Builds | CF Secrets Store | 90-day | TBD |
| `CF_ACCOUNT_ID` | Scopes CF API calls | CF Secrets Store | N/A | TBD |

Rotation policy per SOP-080. Never stored in `.env`, never committed.

## 5. Key risks

| Risk | Mitigation |
|---|---|
| Webhook replay attack | `X-Hub-Signature-256` validation on every request; reject unsigned; persist GitHub delivery IDs (`X-GitHub-Delivery` header) and reject duplicate/replayed IDs (TODO: implement replay protection in webhook handler) |
| Sweep poisoning (malicious `/health` response) | Only `status` field extracted via `resp.json()`; raw response bodies not stored; no `eval` |
| `webhook_configs` table tampered → wrong repo deployed | Writes require `CHITTY_AUTH_SERVICE_TOKEN`; table maps repo → script name only (no arbitrary code) |
| CF token over-scoped | `CF_API_TOKEN` scoped to `Workers Builds:Edit` only — no KV/R2/D1 access |
| Sweep concurrency abuse | `CONCURRENCY = 6` hard cap — can't be externally adjusted |
| DO SQLite data loss | SQLite is ephemeral on DO eviction; health data is reconstructible (re-sweep), 7-day retention only |

## 6. Incident path

- **Detection**: chittymonitor monitors itself via `/health`; CF analytics on 5xx spike
- **Triage**: ChittyOps L1
- **Escalation**:
  - L1: ChittyOps oncall
  - L2: ChittyFoundation governance council
- **Critical incident** (webhook_configs tampered, wrong deploy triggered): revoke `CHITTY_AUTH_SERVICE_TOKEN` immediately to disable configuration writes; revoke `CF_API_TOKEN` to halt deploys; audit CF Builds history

## 7. Audit logging

- **Webhook received** → logged to DO SQLite `events` table with repo, sha, delivery ID
- **Build triggered** → logged with CF version ID
- **Sweep results** → `health_checks` table (7-day retention)
- **Token validation failures** → logged; 3 failures/min triggers alert (future)
- Tail consumer: `chittytrack` receives all requests; sensitive data (Bearer tokens, GitHub webhook signatures/bodies, `Authorization` headers) should be redacted before forwarding; log retention period and access controls TODO: document
