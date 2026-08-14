---
service_chittyid: "TBD-pending-canonical-mint"
service_name: "chittymonitor"
canonical_uri: "chittycanon://core/services/chittymonitor"
pentad_version: "1.0.0"
tier: 3
last_reviewed: "2026-07-30"
---

# chittymonitor — Agents

How AI agents may interact with chittymonitor.

## 1. Architecture

chittymonitor is a **Cloudflare Worker + Durable Object** service. The deployed artifact is `worker/` only. The `server/` directory is a legacy Replit prototype — do not modify.

| Component | Role |
|---|---|
| `worker/src/index.ts` | Hono router + `ExportedHandler` (`fetch` + `scheduled`) |
| `worker/src/agent.ts` | `MonitorAgent` Durable Object — singleton, all state + business logic |
| `worker/src/env.ts` | `Env` interface (bindings) |

**DO is singleton**: always `env.MONITOR_AGENT.idFromName('singleton')`. Never create multiple instances.

## 2. Eligible operations by tier

| Operation | Endpoint | Auth | Agent tier | Status |
|---|---|---|---|---|
| Read ecosystem health | `GET /api/health/latest` | none | any | deployed |
| Read per-service history | `GET /api/health/:service/history` | none | any | deployed |
| Trigger health sweep | `GET /api/health/sweep` | none | any | deployed |
| Register app heartbeat | `POST /track` | Bearer token | trusted | deployed |
| Ingest CI/CD record | `POST /api/chittyflow/workflows` | Bearer token | trusted | deployed |
| Read ecosystem summary | `GET /status` | none | any | planned |
| Trigger health sweep (auth) | `POST /check` | Bearer token | trusted | planned |
| Receive GitHub webhook | `POST /webhook/github` | HMAC | github-app only | planned |

## 3. Data model

All state lives in `MonitorAgent` DO SQLite. Agents may query via the public read endpoints — no direct DB access.

| Table | Content | Retention |
|---|---|---|
| `apps` | Registered apps + metadata | Indefinite |
| `events` | App lifecycle events (heartbeat, shutdown) | 30-day |
| `packages` | Package install records per app | 30-day |
| `ci_workflows` | CI/CD run records | 30-day |
| `health_checks` | Per-service sweep results | 7-day |
| `webhook_configs` | Repo → CF Worker script mapping | Indefinite |

## 4. Build & deploy commands

```bash
cd worker
npm run typecheck      # must pass before deploy
npx wrangler deploy    # deploys to monitor.chitty.cc
```

CI/CD: GitHub push to `main` triggers CF Workers Builds automatically.

Post-deploy verification:
```bash
curl https://monitor.chitty.cc/health
# → { "status": "ok", "service": "chittymonitor", ... }

curl https://monitor.chitty.cc/api/health/latest
# → [ { "service": "...", "status": "ok", "latency_ms": ... }, ... ]
```

## 5. Key constraints for agents working in this repo

1. **State only through MonitorAgent** — no KV/R2/external DB in `index.ts`. Route all state through `env.MONITOR_AGENT`.
2. **No `crypto.randomUUID()` or `fetch()` at module global scope** — CF Workers restriction. All calls inside handlers or `onStart()`.
3. **Sweep concurrency cap** — `CONCURRENCY = 6`. Do not raise it.
4. **Secrets via chittysecrets** — not 1Password, not `.env`. Provision with `wrangler secret put`.
5. **agents SDK** — minimum `^0.16.2`. Current version: `^0.19.0`.
6. **Wrangler config** — `compatibility_flags: ["nodejs_compat"]` (not `node_compat: true`). `workers_dev: false`. Tail consumer `chittytrack` must remain.

## 6. Upcoming features (not yet deployed)

### Webhook handler (`POST /webhook/github`)
- Validate `X-Hub-Signature-256` with `crypto.subtle` HMAC
- Look up repo in `webhook_configs` DO table
- Call CF Builds API → trigger build
- Post `pending` commit status to GitHub
- All GH/CF calls best-effort — log failures, never return 5xx to GitHub

### Beacon absorption
- Add `GET /status` and `POST /check` to `index.ts` (mirrors chittybeacon API)
- Phase 3 (future): update chittybeacon to 301-redirect to `monitor.chitty.cc`
- Do NOT modify chittybeacon until Phase 1 verified in production

## 7. Disallowed actions

- Direct writes to DO SQLite outside `MonitorAgent` methods
- Adding external DB calls (Neon, R2, KV) to `index.ts`
- Modifying `server/` directory (not deployed)
- Raising `CONCURRENCY` above 6
- Storing secrets in code or env files committed to git
- Deploying without passing `npm run typecheck`

## 8. Adding a new endpoint (checklist)

1. Add Hono route in `index.ts`
2. Add business logic method in `agent.ts`
3. If new state: add `CREATE TABLE IF NOT EXISTS` in `onStart()`
4. If new bindings: update `env.ts` **and** `wrangler.jsonc`
5. Run `npm run typecheck`
6. Update `CHITTY.md` API Surface section
