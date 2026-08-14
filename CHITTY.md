---
service_chittyid: "TBD-pending-canonical-mint"
service_name: "chittymonitor"
canonical_uri: "chittycanon://core/services/chittymonitor"
pentad_version: "1.0.0"
tier: 3
last_reviewed: "2026-07-29"
---

# chittymonitor — CHITTY

Technical specification for the chittymonitor Worker. Covers API surface, data model,
webhook handler scope, and the chittybeacon absorption migration.

---

## Runtime Architecture

```
monitor.chitty.cc
       │
       ▼
  Hono router (CF Worker)
       │
       ├── routeAgentRequest()   ← Agents SDK DO routing
       │         │
       │         ▼
       │   MonitorAgent (Durable Object, SQLite-backed)
       │   ┌──────────────────────────────────────────┐
       │   │  tables: apps, events, packages,         │
       │   │          ci_workflows, health_checks      │
       │   └──────────────────────────────────────────┘
       │
       └── Hono routes  (REST API over DO stub)

Cron: */5 * * * *  →  GET /api/health/sweep  (self-fetch)
Tail consumer: chittytrack
```

**Key constraint**: All state lives in the DO's SQLite instance (`MonitorAgent`).
No external database. No Neon. No Drizzle. The `server/` and root `drizzle.config.ts`
are legacy from the original Express/Neon architecture and are **not used by the
worker**. Do not re-introduce a Neon dependency into the worker path.

---

## Environment Bindings

### `wrangler.jsonc` bindings (current)

| Binding            | Type              | Value / Notes                        |
|--------------------|-------------------|--------------------------------------|
| `MONITOR_AGENT`    | Durable Object    | `MonitorAgent` class, SQLite         |
| `SERVICE_NAME`     | var               | `"chittymonitor"`                    |
| `CHITTY_AUTH_SERVICE_TOKEN` | secret | Service-to-service auth token — provision via **chittysecrets**, NOT 1Password |

### Secrets to add (webhook handler)

| Secret                  | Purpose                                       |
|-------------------------|-----------------------------------------------|
| `GITHUB_WEBHOOK_SECRET` | HMAC-SHA256 validation of GitHub payloads     |
| `GITHUB_APP_TOKEN`      | GitHub API token for posting commit statuses  |
| `CF_API_TOKEN`          | Cloudflare API token scoped to Workers Builds trigger |
| `CF_ACCOUNT_ID`         | Cloudflare account ID for Workers Builds API  |

Provision all secrets via `wrangler secret put <KEY>` using tokens from **chittysecrets**
(not `.chittyconnect.yml` / 1Password; 1Password plumbing inside chittyconnect is moving to chittysecrets).

---

## API Surface

### Health

```
GET /health
→ { status: "ok", service: "chittymonitor", timestamp: ISO8601 }
```

No auth required. Used by ecosystem health sweeps and uptime checks.

---

### Beacon Tracking

```
POST /track
Body: TrackingData (see Data Model)
→ { status: "ok", app: AppRecord }
```

Upserts the `apps` table and inserts an `events` row. Called by chittypm, chittyflow,
and any ChittyOS-aware runtime on startup, heartbeat, and shutdown.

---

### Apps

```
GET  /api/apps               → AppRecord[]
GET  /api/apps/:id           → AppRecord | 404
```

---

### Events

```
GET  /api/events?limit=N     → EventRecord[]  (default 50, max by query)
```

---

### Stats

```
GET  /api/stats
→ { totalApps, activeApps, claudeApps, avgUptime, platformDistribution[] }
```

---

### Packages

```
GET  /api/packages                    → PackageRecord[]
GET  /api/packages/stats              → PackageStatsResult
GET  /api/apps/:id/packages           → PackageRecord[]
POST /api/packages                    → PackageRecord
POST /api/chittypm/sync               Body: { appId, packages[] }
                                      → { synced: N, packages: [] }
```

---

### CI Workflows

```
GET  /api/workflows                   → WorkflowRecord[]
GET  /api/workflows/stats             → WorkflowStatsResult
POST /api/workflows                   → WorkflowRecord (201)
PATCH /api/workflows/:id              Body: { status?, duration? }
POST /api/chittyflow/workflows        Body: { appId, workflows[] }
                                      → { synced: N, workflows: [] }
```

---

### Health Monitoring

```
GET  /api/health/latest               → HealthResult[]  (latest per service)
GET  /api/health/sweep                → HealthResult[]  (triggers sweep)
GET  /api/health/:service/history     → HealthResult[]  (last 100)
```

The sweep fan-out runs at concurrency=6 to stay within the Workers in-flight `fetch()`
limit. Results are written to `health_checks` and rows older than 7 days are pruned.

---

## Webhook Handler Spec — `POST /webhook/github`

### Background

chittyconnect previously bundled a GitHub webhook receiver alongside its 1Password
credential pipeline. As chittyconnect sheds that credential weight (1Password →
chittysecrets) and reduces surface area, the webhook handler is offloaded here.
chittyconnect itself stays live as the context, session, orchestration, and memory
spine of ChittyOS — this is purely a responsibility handoff, not a decommission.

### Endpoint

```
POST /webhook/github
Headers:
  X-Hub-Signature-256: sha256=<HMAC of body with GITHUB_WEBHOOK_SECRET>
  X-GitHub-Event:      push | pull_request | ...
  X-GitHub-Delivery:   <UUID>
Content-Type: application/json
```

### Accepted Event Types

| GitHub Event     | Action        | What chittymonitor does                            |
|------------------|---------------|----------------------------------------------------|
| `push`           | any           | Records workflow row (trigger=push, branch, commit); triggers CF Workers Build |
| `pull_request`   | `opened`      | Records workflow row (trigger=pr_open); posts `pending` commit status to GitHub |
| `pull_request`   | `synchronize` | Same as opened                                     |
| `pull_request`   | `closed` + merged | Records completion; posts `success` commit status |
| `ping`           | n/a           | Returns `{ ok: true, hook: hookId }`, no-op        |

All other event types → `200 { ignored: true }`.

### Validation

```typescript
async function verifyGitHubSignature(req: Request, secret: string): Promise<boolean> {
  const sig = req.headers.get('X-Hub-Signature-256');
  if (!sig) return false;
  const body = await req.arrayBuffer();
  const key = await crypto.subtle.importKey(
    'raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  );
  const mac = await crypto.subtle.sign('HMAC', key, body);
  const hex = 'sha256=' + Array.from(new Uint8Array(mac)).map(b => b.toString(16).padStart(2, '0')).join('');
  return hex === sig;
}
```

`crypto.subtle` is available in CF Workers with `nodejs_compat`. Do NOT use Node's
`crypto.createHmac` directly — import via the Web Crypto API as shown above.

### CF Workers Builds Trigger

On `push` to a branch that matches a configured pattern (default: `main`), call the
Cloudflare Workers Builds API:

```
POST https://api.cloudflare.com/client/v4/accounts/{CF_ACCOUNT_ID}/workers/scripts/{script_name}/builds
Authorization: Bearer {CF_API_TOKEN}
Content-Type: application/json
Body: { "branch": "<branch>", "commit_hash": "<sha>" }
```

The `script_name` is resolved by matching the pushed repository slug against a
lookup table stored in the DO (see `webhook_configs` table below — to be added in
the implementation commit).

### GitHub Commit Status

Post commit status via:

```
POST https://api.github.com/repos/{owner}/{repo}/statuses/{sha}
Authorization: Bearer {GITHUB_APP_TOKEN}
Content-Type: application/json
Body: {
  "state": "pending" | "success" | "failure" | "error",
  "target_url": "https://monitor.chitty.cc/api/workflows/{id}",
  "description": "ChittyOS Workers Build triggered",
  "context": "chittymonitor/build"
}
```

### New DO Table: `webhook_configs`

```sql
CREATE TABLE IF NOT EXISTS webhook_configs (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  repo_slug   TEXT NOT NULL UNIQUE,  -- e.g. "CHITTYOS/chittymonitor"
  script_name TEXT NOT NULL,         -- CF Workers script name
  branch_pattern TEXT DEFAULT 'main',
  enabled     INTEGER DEFAULT 1,
  created_at  TEXT DEFAULT (datetime('now')),
  updated_at  TEXT DEFAULT (datetime('now'))
);
```

Management endpoints (auth-gated, `CHITTY_AUTH_SERVICE_TOKEN` required):

```
GET  /api/webhooks/configs            → WebhookConfig[]
POST /api/webhooks/configs            Body: { repoSlug, scriptName, branchPattern? }
DELETE /api/webhooks/configs/:id
```

### Error Handling

- Invalid signature → `403 { error: "invalid signature" }` immediately, no processing.
- Unresolvable repo → `200 { ignored: true, reason: "no config for repo" }` (no 4xx —
  GitHub retries on non-2xx).
- CF Builds API failure → log error via `console.error`, record workflow row with
  `status=failed`, post `error` commit status, return `200`.
- GitHub status API failure → log warning, do not fail the webhook (best-effort).

---

## Beacon Absorption Spec — chittybeacon → chittymonitor

### Current State

`beacon.chitty.cc` is a live, independent CF Worker with endpoints:

| Endpoint    | Behaviour                                          |
|-------------|----------------------------------------------------|
| `/health`   | Returns service health (simple JSON)               |
| `/status`   | Returns ecosystem status aggregate                 |
| `/check`    | Accepts a target URL, returns reachability result  |

### Migration Plan

**Phase 1 — Implement in chittymonitor** (this sprint)

Add the following routes to `worker/src/index.ts`, backed by existing MonitorAgent data:

```
GET /status
→ Reads latest health_checks from DO, returns aggregate:
  { overall: "ok"|"degraded"|"down", services: HealthResult[], checked_at: ISO8601 }

GET /check?url=<encoded-url>
→ Fetches the given URL (timeout 5 s), returns:
  { url, reachable: bool, status_code: int|null, response_ms: int, checked_at: ISO8601 }
  Auth: none. Rate-limit: 10 req/min per IP (use CF rate-limit rule, not Worker logic).

GET /health   ← already exists — no change needed
```

chittymonitor's existing `/health` already satisfies the beacon `/health` contract.

**Phase 2 — Verify parity** (pre-cutover)

Run both endpoints in parallel for ≥ 48 hours. Compare responses from
`beacon.chitty.cc/status` vs `monitor.chitty.cc/status`. Diff must be zero for 2
consecutive sweeps.

**Phase 3 — Redirect chittybeacon** (post-verification)

Update the `chittybeacon` CF Worker to respond with a 301 redirect for each path:

```
GET beacon.chitty.cc/health  → 301 https://monitor.chitty.cc/health
GET beacon.chitty.cc/status  → 301 https://monitor.chitty.cc/status
GET beacon.chitty.cc/check   → 301 https://monitor.chitty.cc/check (preserve query string)
```

**Do NOT decommission the chittybeacon Worker** until redirect has been live for ≥
30 days and no direct callers remain (verify via chittytrack analytics).

**Phase 4 — Decommission** (future sprint)

Remove chittybeacon Worker. Update registry. Update AGENTS.md service list to remove
`beacon` as a health-check target (it will now be `monitor`-internal).

### Impact on Agent Health Sweep

The MonitorAgent `SERVICES` constant currently includes `'beacon'`. After Phase 3,
the `beacon` entry should remain (it now redirects and still validates reachability).
After Phase 4, remove `'beacon'` from the list.

---

## Data Model Summary

All tables live in MonitorAgent's DO SQLite storage.

| Table            | Primary Purpose                                        |
|------------------|--------------------------------------------------------|
| `apps`           | Registered/tracked ChittyOS apps (upserted by /track) |
| `events`         | Lifecycle events per app (heartbeat, shutdown, etc.)   |
| `packages`       | Package install records per app                        |
| `ci_workflows`   | CI/CD workflow run records                             |
| `health_checks`  | Per-service health sweep results (7-day retention)     |
| `webhook_configs`| Repo → CF Worker script mapping (added in webhook PR)  |

---

## Known Technical Debt

| Item | Severity | Notes |
|------|----------|-------|
| `agents` SDK at `^0.14.5` | High | AGENTS.md canonical minimum is `^0.16.2`; upgrade before next deploy |
| `.chittyconnect.yml` references 1Password | High | Blocked on chittysecrets migration; remove `vault: 1password` entry once secrets moved |
| `CHITTY_AUTH_SERVICE_TOKEN` env — no validation middleware in index.ts | Medium | Write endpoints (/api/packages, /api/workflows, /webhook/github) should validate this token |
| `server/` directory (Express/Neon legacy) | Low | Not referenced by worker; safe to archive/delete when convenient |
| `drizzle.config.ts` at root | Low | Legacy artifact; not used by worker pipeline |
