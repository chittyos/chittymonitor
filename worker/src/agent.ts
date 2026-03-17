import { Agent } from 'agents';
import type { Env } from './env';

/** Services to health-check on cron */
const SERVICES = [
  'id', 'auth', 'connect', 'api', 'registry', 'schema', 'mcp',
  'finance', 'command', 'register', 'cert', 'beacon', 'evidence',
  'score', 'dispute', 'router', 'monitor', 'trust', 'discovery',
  'intel', 'cases', 'portal', 'dashboard',
] as const;

interface AppRecord {
  id: string;
  name: string;
  version: string;
  platform: string;
  environment: string;
  hostname: string | null;
  node_version: string | null;
  os: string | null;
  has_claude_code: number;
  has_git: number;
  git_info: string | null;
  platform_info: string | null;
  status: string;
  started_at: string;
  last_seen: string;
}

interface HealthResult {
  service: string;
  status: string;
  response_ms: number;
  checked_at: string;
  error: string | null;
}

interface TrackingData {
  id: string;
  name: string;
  version: string;
  platform: string;
  environment?: string;
  hostname?: string;
  node_version?: string;
  os?: string;
  has_claude_code?: boolean;
  has_git?: boolean;
  git?: Record<string, string>;
  replit?: Record<string, string>;
  github?: Record<string, string>;
  vercel?: Record<string, string>;
  event: string;
  timestamp: string;
  started_at?: string;
  uptime?: number;
  pid?: number;
}

interface PackageData {
  appId: string;
  name: string;
  version: string;
  manager: string;
  description?: string | null;
  homepage?: string | null;
  repository?: string | null;
  license?: string | null;
  dependencies?: unknown;
  devDependencies?: unknown;
  size?: number | null;
}

interface WorkflowData {
  appId: string;
  name: string;
  type: string;
  status: string;
  trigger?: string | null;
  branch?: string | null;
  commit?: string | null;
  duration?: number | null;
  startedAt?: string | null;
  metadata?: unknown;
}

/**
 * MonitorAgent — Durable Object Agent for ChittyOS ecosystem monitoring.
 *
 * Replaces the Express/Drizzle/Neon full-stack app with a single
 * Cloudflare Worker + SQLite-backed Durable Object.
 */
export class MonitorAgent extends Agent<Env> {
  async onStart(): Promise<void> {
    this.sql`CREATE TABLE IF NOT EXISTS apps (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      version TEXT NOT NULL,
      platform TEXT NOT NULL,
      environment TEXT DEFAULT 'production',
      hostname TEXT,
      node_version TEXT,
      os TEXT,
      has_claude_code INTEGER DEFAULT 0,
      has_git INTEGER DEFAULT 0,
      git_info TEXT,
      platform_info TEXT,
      status TEXT NOT NULL DEFAULT 'offline',
      started_at TEXT NOT NULL,
      last_seen TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    )`;

    this.sql`CREATE TABLE IF NOT EXISTS events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      app_id TEXT NOT NULL,
      event TEXT NOT NULL,
      timestamp TEXT NOT NULL,
      data TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    )`;

    this.sql`CREATE TABLE IF NOT EXISTS packages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      app_id TEXT NOT NULL,
      name TEXT NOT NULL,
      version TEXT NOT NULL,
      manager TEXT NOT NULL,
      description TEXT,
      homepage TEXT,
      repository TEXT,
      license TEXT,
      dependencies TEXT,
      dev_dependencies TEXT,
      size INTEGER,
      download_count INTEGER DEFAULT 0,
      last_updated TEXT,
      installed_at TEXT DEFAULT (datetime('now')),
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    )`;

    this.sql`CREATE TABLE IF NOT EXISTS ci_workflows (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      app_id TEXT NOT NULL,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      status TEXT NOT NULL,
      trigger_source TEXT,
      branch TEXT,
      commit_hash TEXT,
      duration INTEGER,
      started_at TEXT,
      completed_at TEXT,
      metadata TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    )`;

    this.sql`CREATE TABLE IF NOT EXISTS health_checks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      service TEXT NOT NULL,
      status TEXT NOT NULL,
      response_ms INTEGER NOT NULL,
      checked_at TEXT NOT NULL,
      error TEXT
    )`;

    this.sql`CREATE INDEX IF NOT EXISTS idx_events_app_id ON events(app_id)`;
    this.sql`CREATE INDEX IF NOT EXISTS idx_events_timestamp ON events(timestamp)`;
    this.sql`CREATE INDEX IF NOT EXISTS idx_packages_app_id ON packages(app_id)`;
    this.sql`CREATE INDEX IF NOT EXISTS idx_ci_workflows_app_id ON ci_workflows(app_id)`;
    this.sql`CREATE INDEX IF NOT EXISTS idx_health_service ON health_checks(service, checked_at)`;
  }

  // ── Beacon Tracking ──

  trackApp(data: TrackingData): AppRecord {
    const { id } = data;
    const now = new Date().toISOString();
    const env = data.environment ?? 'production';
    const gitInfo = data.git ? JSON.stringify(data.git) : null;
    const platformInfo = JSON.stringify({ replit: data.replit, github: data.github, vercel: data.vercel });
    const status = data.event === 'shutdown' ? 'offline' : 'online';
    const startedAt = data.started_at ?? data.timestamp;

    this.sql`INSERT INTO apps (id, name, version, platform, environment, hostname, node_version, os, has_claude_code, has_git, git_info, platform_info, status, started_at, last_seen, updated_at)
      VALUES (${id}, ${data.name}, ${data.version}, ${data.platform}, ${env}, ${data.hostname ?? null}, ${data.node_version ?? null}, ${data.os ?? null}, ${data.has_claude_code ? 1 : 0}, ${data.has_git ? 1 : 0}, ${gitInfo}, ${platformInfo}, ${status}, ${startedAt}, ${data.timestamp}, ${now})
      ON CONFLICT(id) DO UPDATE SET
        name = excluded.name, version = excluded.version, platform = excluded.platform,
        environment = excluded.environment, hostname = excluded.hostname,
        node_version = excluded.node_version, os = excluded.os,
        has_claude_code = excluded.has_claude_code, has_git = excluded.has_git,
        git_info = excluded.git_info, platform_info = excluded.platform_info,
        status = excluded.status, last_seen = excluded.last_seen, updated_at = ${now}`;

    const eventData = JSON.stringify({ uptime: data.uptime, pid: data.pid });
    this.sql`INSERT INTO events (app_id, event, timestamp, data) VALUES (${id}, ${data.event}, ${data.timestamp}, ${eventData})`;

    const [app] = this.sql<AppRecord>`SELECT * FROM apps WHERE id = ${id}`;
    return app;
  }

  // ── Apps ──

  listApps(): AppRecord[] {
    return this.sql<AppRecord>`SELECT * FROM apps ORDER BY last_seen DESC`;
  }

  getApp(id: string): AppRecord | undefined {
    const [app] = this.sql<AppRecord>`SELECT * FROM apps WHERE id = ${id}`;
    return app;
  }

  // ── Events ──

  getRecentEvents(limit: number) {
    return this.sql`SELECT * FROM events ORDER BY timestamp DESC LIMIT ${limit}`;
  }

  // ── Packages ──

  listPackages() {
    return this.sql`SELECT * FROM packages ORDER BY installed_at DESC`;
  }

  getAppPackages(appId: string) {
    return this.sql`SELECT * FROM packages WHERE app_id = ${appId} ORDER BY installed_at DESC`;
  }

  installPackage(data: PackageData) {
    const deps = data.dependencies ? JSON.stringify(data.dependencies) : null;
    const devDeps = data.devDependencies ? JSON.stringify(data.devDependencies) : null;
    this.sql`INSERT INTO packages (app_id, name, version, manager, description, homepage, repository, license, dependencies, dev_dependencies, size)
      VALUES (${data.appId}, ${data.name}, ${data.version}, ${data.manager}, ${data.description ?? null}, ${data.homepage ?? null}, ${data.repository ?? null}, ${data.license ?? null}, ${deps}, ${devDeps}, ${data.size ?? null})`;

    const eventData = JSON.stringify({ package: data.name, version: data.version, manager: data.manager });
    this.sql`INSERT INTO events (app_id, event, timestamp, data)
      VALUES (${data.appId}, 'package_install', ${new Date().toISOString()}, ${eventData})`;

    return this.sql`SELECT * FROM packages WHERE rowid = last_insert_rowid()`;
  }

  getPackageStats() {
    const [{ total }] = this.sql<{ total: number }>`SELECT COUNT(*) as total FROM packages`;
    const byManager = this.sql<{ manager: string; count: number }>`SELECT manager, COUNT(*) as count FROM packages GROUP BY manager`;
    const recent = this.sql`SELECT * FROM packages ORDER BY installed_at DESC LIMIT 10`;
    return {
      totalPackages: total,
      packagesByManager: byManager.map((r) => ({ ...r, percentage: total > 0 ? (r.count / total) * 100 : 0 })),
      recentInstalls: recent,
    };
  }

  // ── CI Workflows ──

  listCiWorkflows() {
    return this.sql`SELECT * FROM ci_workflows ORDER BY created_at DESC`;
  }

  createCiWorkflow(data: WorkflowData) {
    const now = new Date().toISOString();
    const startedAt = data.status === 'running' ? now : (data.startedAt ?? null);
    const completedAt = data.status === 'success' || data.status === 'failed' ? now : null;
    const metadata = data.metadata ? JSON.stringify(data.metadata) : null;
    this.sql`INSERT INTO ci_workflows (app_id, name, type, status, trigger_source, branch, commit_hash, duration, started_at, completed_at, metadata)
      VALUES (${data.appId}, ${data.name}, ${data.type}, ${data.status}, ${data.trigger ?? null}, ${data.branch ?? null}, ${data.commit ?? null}, ${data.duration ?? null}, ${startedAt}, ${completedAt}, ${metadata})`;
    return this.sql`SELECT * FROM ci_workflows WHERE rowid = last_insert_rowid()`;
  }

  updateCiWorkflow(id: number, updates: { status?: string; duration?: number }) {
    const now = new Date().toISOString();
    if (updates.status) {
      this.sql`UPDATE ci_workflows SET status = ${updates.status}, updated_at = ${now} WHERE id = ${id}`;
    }
    if (updates.duration) {
      this.sql`UPDATE ci_workflows SET duration = ${updates.duration}, completed_at = ${now}, updated_at = ${now} WHERE id = ${id}`;
    }
    return this.sql`SELECT * FROM ci_workflows WHERE id = ${id}`;
  }

  getCiWorkflowStats() {
    const [{ total }] = this.sql<{ total: number }>`SELECT COUNT(*) as total FROM ci_workflows`;
    const byStatus = this.sql<{ status: string; count: number }>`SELECT status, COUNT(*) as count FROM ci_workflows GROUP BY status`;
    const byType = this.sql<{ type: string; count: number }>`SELECT type, COUNT(*) as count FROM ci_workflows GROUP BY type`;
    const recent = this.sql`SELECT * FROM ci_workflows ORDER BY created_at DESC LIMIT 10`;
    return {
      totalWorkflows: total,
      workflowsByStatus: byStatus.map((r) => ({ ...r, percentage: total > 0 ? Math.round((r.count / total) * 100) : 0 })),
      workflowsByType: byType.map((r) => ({ ...r, percentage: total > 0 ? Math.round((r.count / total) * 100) : 0 })),
      recentWorkflows: recent,
    };
  }

  // ── Stats ──

  getStats() {
    const [{ total }] = this.sql<{ total: number }>`SELECT COUNT(*) as total FROM apps`;
    const [{ active }] = this.sql<{ active: number }>`SELECT COUNT(*) as active FROM apps WHERE status = 'online'`;
    const [{ claude }] = this.sql<{ claude: number }>`SELECT COUNT(*) as claude FROM apps WHERE has_claude_code = 1`;
    const platformDist = this.sql<{ platform: string; count: number }>`SELECT platform, COUNT(*) as count FROM apps GROUP BY platform`;
    return {
      totalApps: total,
      activeApps: active,
      claudeApps: claude,
      avgUptime: total > 0 ? (active / total) * 100 : 0,
      platformDistribution: platformDist.map((r) => ({ ...r, percentage: total > 0 ? (r.count / total) * 100 : 0 })),
    };
  }

  // ── Health Sweep ──

  async runHealthSweep(): Promise<HealthResult[]> {
    const results: HealthResult[] = [];
    const now = new Date().toISOString();

    const checks = SERVICES.map(async (svc): Promise<HealthResult> => {
      const start = Date.now();
      try {
        const resp = await fetch(`https://${svc}.chitty.cc/health`, { signal: AbortSignal.timeout(5000) });
        const ms = Date.now() - start;
        let status = 'down';
        if (resp.ok) {
          try {
            const body = await resp.json() as Record<string, unknown>;
            const nested = body.data as Record<string, unknown> | undefined;
            status = String(body.status ?? nested?.status ?? 'unknown').toLowerCase();
            if (status === 'healthy') status = 'ok';
          } catch {
            status = 'ok';
          }
        } else {
          status = `http_${resp.status}`;
        }
        return { service: svc, status, response_ms: ms, checked_at: now, error: null };
      } catch (err: unknown) {
        const ms = Date.now() - start;
        return { service: svc, status: 'down', response_ms: ms, checked_at: now, error: String(err) };
      }
    });

    const settled = await Promise.allSettled(checks);
    for (const r of settled) {
      const result = r.status === 'fulfilled'
        ? r.value
        : { service: 'unknown', status: 'error', response_ms: 0, checked_at: now, error: String((r as PromiseRejectedResult).reason) };
      results.push(result);
      this.sql`INSERT INTO health_checks (service, status, response_ms, checked_at, error)
        VALUES (${result.service}, ${result.status}, ${result.response_ms}, ${result.checked_at}, ${result.error})`;
    }

    this.sql`DELETE FROM health_checks WHERE checked_at < datetime('now', '-7 days')`;

    return results;
  }

  getLatestHealth(): HealthResult[] {
    return this.sql<HealthResult>`
      SELECT h.* FROM health_checks h
      INNER JOIN (SELECT service, MAX(checked_at) as max_at FROM health_checks GROUP BY service) latest
      ON h.service = latest.service AND h.checked_at = latest.max_at
      ORDER BY h.service`;
  }

  getServiceHistory(service: string, limit = 100) {
    return this.sql`SELECT * FROM health_checks WHERE service = ${service} ORDER BY checked_at DESC LIMIT ${limit}`;
  }
}
