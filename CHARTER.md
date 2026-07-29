---
service_chittyid: "TBD-pending-canonical-mint"
service_name: "chittymonitor"
canonical_uri: "chittycanon://core/services/chittymonitor"
pentad_version: "1.0.0"
tier: 3
last_reviewed: "2026-07-29"
status: "active"
pentad_complete: false
pentad_blockers: ["service_chittyid pending canonical mint"]
---

# chittymonitor — CHARTER

## Mission

chittymonitor is the **application monitoring and health dashboard** for the ChittyOS
ecosystem. It provides real-time visibility into service health, deployed application
status, CI/CD pipeline events, and package operations across all ChittyOS-connected
runtimes (Replit, GitHub Actions, Vercel, Cloudflare Workers).

## Domain & Deployment

| Property          | Value                                 |
|-------------------|---------------------------------------|
| Production domain | `monitor.chitty.cc`                   |
| Worker name       | `chittymonitor`                       |
| Platform          | Cloudflare Workers + Durable Objects  |
| Tier              | 3 — Operational / Observability       |
| Runtime           | CF Agents SDK · Hono · SQLite DO      |
| Cron schedule     | Every 5 minutes (`*/5 * * * *`)       |
| Tail consumer     | `chittytrack`                         |

## Scope

### In-scope

1. **Ecosystem health sweeps** — Every 5 minutes, ping all `*.chitty.cc` services at
   `/health` and record latency + status in DO SQLite.  Current service list (23):
   `id`, `auth`, `connect`, `api`, `registry`, `schema`, `mcp`, `finance`, `command`,
   `register`, `cert`, `beacon`, `evidence`, `score`, `dispute`, `router`, `monitor`,
   `trust`, `discovery`, `intel`, `cases`, `portal`, `dashboard`.

2. **Application beacon tracking** — Receive `POST /track` heartbeats from running
   ChittyOS-aware apps (chittypm, chittyflow agents), upsert `apps` table, record
   lifecycle events.

3. **CI/CD workflow ingestion** — Accept workflow run records from chittyflow via
   `POST /api/chittyflow/workflows`, store in `ci_workflows` table with status/duration.

4. **Package operation recording** — Accept package install events from chittypm via
   `POST /api/chittypm/sync`, persist to `packages` table.

5. **GitHub webhook handling** *(offloaded from chittyconnect)* — Receive
   `POST /webhook/github` push and PR events; trigger CF Workers Builds; report GitHub commit status back.
   chittyconnect sheds this responsibility to reduce its surface area; chittyconnect itself stays live.
   See CHITTY.md §Webhook Spec.

6. **chittybeacon absorption** *(migration target)* — `beacon.chitty.cc` currently
   handles `/health`, `/status`, `/check` as a standalone worker. These capabilities
   migrate to chittymonitor. See CHITTY.md §Beacon Migration.

### Out-of-scope

- Credential storage or rotation — handled by **chittysecrets**.
- Identity / JWT issuance — handled by **chittyauth** / **chittyid**.
- Log aggregation or tail consumer processing — handled by **chittytrack**.
- AI anomaly detection logic — handled by **chittyintel** (consumer of chittymonitor
  data via API, not colocated here).

## Governance

- **Owner**: ChittyOS Platform Engineering
- **Consumers**: chittyintel (health data), chittytrack (tail logs), chittyflow (workflow
  push), chittypm (package events), any developer querying `monitor.chitty.cc/api/*`
- **SLA target**: Health sweep completes within 30 s of cron trigger; `/health` responds
  < 100 ms p99.
- **Data retention**: health_checks rows older than 7 days are pruned on each sweep.
- **Incident escalation**: Tail consumer `chittytrack` receives all Worker errors.
  Alerts routed via chittytrack → chittyintel anomaly scoring.

## Dependencies

| Dependency         | Direction | Purpose                                      |
|--------------------|-----------|----------------------------------------------|
| `chittytrack`      | outbound  | Tail consumer for Worker log/error ingestion |
| `chittyauth`       | inbound   | Service-token validation on write endpoints  |
| `chittysecrets`    | provision | Secrets at deploy time (replaces 1Password)  |
| `*.chitty.cc`      | outbound  | Health-check fetch targets                   |
| GitHub API         | outbound  | Commit-status POST for webhook handler       |
| CF Workers Builds  | outbound  | Build trigger for webhook handler            |

## Migration Obligations

1. **chittyconnect credential offload** — `.chittyconnect.yml` references 1Password vault
   (`op://ChittyOS/chittymonitor-prod`). The 1Password credential plumbing inside
   chittyconnect is moving to **chittysecrets**; chittyconnect itself remains live as the
   orchestration spine of ChittyOS. This repo's `.chittyconnect.yml` `vault: 1password`
   entry must be updated to use chittysecrets once that migration lands. Tracked in F-039.

2. **chittybeacon deprecation** — `beacon.chitty.cc` to redirect (301) to
   `monitor.chitty.cc` after beacon endpoints are live here. Do not break beacon.chitty.cc
   until chittymonitor `/health`, `/status`, `/check` are verified in production.

## Changelog

| Date       | Version | Change                                          |
|------------|---------|-------------------------------------------------|
| 2026-05-26 | 0.1.0   | Stub created (F-039)                            |
| 2026-07-29 | 1.0.0   | Full Pentad authored; webhook + beacon specs added |
