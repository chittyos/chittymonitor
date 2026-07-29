---
service_chittyid: "TBD-pending-canonical-mint"
service_name: "chittymonitor"
canonical_uri: "chittycanon://core/services/chittymonitor"
pentad_version: "1.0.0"
tier: 3
last_reviewed: "2026-07-29"
---

# chittymonitor — CLAUDE

Agent instructions for working in this repository.

---

## What this service is

chittymonitor is a **Cloudflare Worker + Durable Object** service. It is NOT a
Node.js/Express app. The `server/` directory and `drizzle.config.ts` at the root are
**legacy artifacts from the original Replit prototype** and are not deployed.

**The deployed artifact is `worker/` only.**

All development work goes in `worker/src/`. Deploy via `cd worker && npx wrangler deploy`.

---

## Project layout

```
worker/
  src/
    index.ts      ← Hono router + ExportedHandler (fetch + scheduled)
    agent.ts      ← MonitorAgent Durable Object (all state + business logic)
    env.ts        ← Env interface (bindings)
  wrangler.jsonc  ← Worker config
  package.json    ← Worker deps (agents SDK, hono, wrangler)

client/           ← React dashboard (separate build, not part of worker deploy)
server/           ← LEGACY Express app — do not modify, do not add dependencies
shared/           ← LEGACY shared types — may be referenced by client only
```

---

## Development rules

### 1. State lives in the DO only

All persistent state goes through `MonitorAgent` methods. Do not add KV, R2, or
external database calls to `index.ts`. Route everything through
`env.MONITOR_AGENT.idFromName('singleton')` + method calls.

The MonitorAgent is a **singleton** — `idFromName('singleton')`. Do not create multiple
DO instances.

### 2. No crypto.randomUUID() or fetch() at module global scope

CF Workers restriction. All `crypto` and `fetch` calls must be inside request handlers,
`onStart()`, or method bodies.

### 3. Agents SDK pattern

```typescript
import { Agent } from 'agents';
// Agent methods are called via DO stub, not directly from index.ts synchronously.
// index.ts calls agent.methodName() — these are RPC calls via the DO stub.
```

Use `routeAgentRequest(request, env)` first in the fetch handler; fall through to Hono
only if it returns null.

### 4. Secrets via chittysecrets — NOT 1Password

The legacy `.chittyconnect.yml` references `vault: 1password`. **Ignore it.**
All secrets are now managed via **chittysecrets** and provisioned with
`wrangler secret put <KEY>`. Never hard-code secrets. Never read from `.env` files in
the worker path.

Required secrets for the webhook handler feature (not yet deployed):
- `GITHUB_WEBHOOK_SECRET`
- `GITHUB_APP_TOKEN`
- `CF_API_TOKEN`
- `CF_ACCOUNT_ID`

### 5. agents SDK version

The canonical minimum per AGENTS.md is `^0.16.2`. The current `package.json` pins
`^0.14.5`. **Before the next deploy, upgrade**:

```bash
cd worker
npm install agents@^0.16.2
```

Verify `routeAgentRequest` import still resolves and run `npm run typecheck` before
committing.

### 6. Health sweep concurrency

The sweep fans out to 23 services at concurrency=6. Do not increase to unlimited — CF
Workers has an in-flight `fetch()` cap that causes stalled responses to be cancelled
with `scriptThrewException`. Keep `CONCURRENCY = 6` or lower.

### 7. Wrangler config

- `compatibility_flags: ["nodejs_compat"]` — not `node_compat: true` (Wrangler v4+).
- `workers_dev: false` — production only, no `.workers.dev` subdomain.
- `tail_consumers: [{ "service": "chittytrack" }]` — do not remove.

---

## Adding a new endpoint

1. Add the Hono route in `index.ts`.
2. Add the business logic method in `agent.ts` (`MonitorAgent`).
3. If new state is needed, add `CREATE TABLE IF NOT EXISTS` in `onStart()`.
4. If new env bindings are needed, update `env.ts` **and** `wrangler.jsonc`.
5. Run `npm run typecheck` to verify.
6. Update `CHITTY.md` API Surface section.

---

## Deploying

```bash
cd worker
npm run typecheck      # must pass
npx wrangler deploy    # deploys to monitor.chitty.cc
```

CI/CD: GitHub push to `main` triggers CF Workers Builds automatically (configured in
Cloudflare dashboard for CHITTYOS/chittymonitor).

After deploy, verify:
```bash
curl https://monitor.chitty.cc/health
# → { "status": "ok", "service": "chittymonitor", "timestamp": "..." }

curl https://monitor.chitty.cc/api/health/latest
# → [ { "service": "...", "status": "ok", ... }, ... ]
```

---

## Webhook handler (upcoming feature)

See CHITTY.md §Webhook Handler Spec for the full specification.

Key points for implementation:
- Route: `POST /webhook/github`
- Validate `X-Hub-Signature-256` with `crypto.subtle` HMAC (see CHITTY.md for
  copy-paste implementation).
- On valid `push` event: look up repo in `webhook_configs` DO table, call CF Builds
  API, post `pending` commit status to GitHub.
- All GitHub API / CF API calls are best-effort — log failures, never return 5xx to
  GitHub (it will retry).

---

## Beacon absorption (upcoming feature)

See CHITTY.md §Beacon Absorption Spec.

Phase 1 (implement here): add `GET /status` and `GET /check` to `index.ts`.
Phase 3 (later): update chittybeacon Worker to 301-redirect to monitor.chitty.cc.

Do NOT modify chittybeacon until Phase 1 is verified in production.

---

## Common pitfalls

| Pitfall | Fix |
|---------|-----|
| Adding `await` to DO method calls in index.ts when methods are synchronous | Some methods (`trackApp`, `listApps`, etc.) return synchronously — don't add unnecessary `await` |
| Using `node:crypto` for HMAC | Use `crypto.subtle` Web Crypto API instead |
| Forgetting to drain response body in health sweep | Always call `resp.body?.cancel()` on non-ok responses to release connection slots |
| Modifying `server/` expecting it to affect `monitor.chitty.cc` | server/ is not deployed — changes there have zero effect on production |
