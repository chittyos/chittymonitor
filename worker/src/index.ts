import { Hono } from 'hono';
import { cors } from 'hono/cors';
import type { Env } from './env';
import { MonitorAgent } from './agent';
import { routeAgentRequest } from 'agents';

export { MonitorAgent };

const app = new Hono<{ Bindings: Env }>();

app.use('*', cors());

// ── Health ──

app.get('/health', (c) =>
  c.json({ status: 'ok', service: 'chittymonitor', timestamp: new Date().toISOString() }),
);

// ── Helper: get agent stub ──

function getAgent(env: Env) {
  const id = env.MONITOR_AGENT.idFromName('singleton');
  return env.MONITOR_AGENT.get(id) as unknown as MonitorAgent;
}

// ── Beacon Tracking ──

app.post('/track', async (c) => {
  const data = await c.req.json();
  const agent = getAgent(c.env);
  const result = agent.trackApp(data);
  return c.json({ status: 'ok', app: result });
});

// ── Apps ──

app.get('/api/apps', async (c) => {
  const agent = getAgent(c.env);
  return c.json(agent.listApps());
});

app.get('/api/apps/:id', async (c) => {
  const agent = getAgent(c.env);
  const result = agent.getApp(c.req.param('id'));
  if (!result) return c.json({ error: 'Not found' }, 404);
  return c.json(result);
});

// ── Events ──

app.get('/api/events', async (c) => {
  const agent = getAgent(c.env);
  const limit = Number(c.req.query('limit') || '50');
  return c.json(agent.getRecentEvents(limit));
});

// ── Stats ──

app.get('/api/stats', async (c) => {
  const agent = getAgent(c.env);
  return c.json(agent.getStats());
});

// ── Packages ──

app.get('/api/packages', async (c) => {
  const agent = getAgent(c.env);
  return c.json(agent.listPackages());
});

app.get('/api/packages/stats', async (c) => {
  const agent = getAgent(c.env);
  return c.json(agent.getPackageStats());
});

app.get('/api/apps/:id/packages', async (c) => {
  const agent = getAgent(c.env);
  return c.json(agent.getAppPackages(c.req.param('id')));
});

app.post('/api/packages', async (c) => {
  const data = await c.req.json();
  const agent = getAgent(c.env);
  const pkg = agent.installPackage(data);
  return c.json(pkg);
});

app.post('/api/chittypm/sync', async (c) => {
  const { appId, packages: packageList } = await c.req.json();
  const agent = getAgent(c.env);
  const results = packageList.map((pkg: Record<string, unknown>) =>
    agent.installPackage({ ...pkg, appId, manager: 'chittypm' } as never),
  );
  return c.json({ synced: results.length, packages: results });
});

// ── CI Workflows ──

app.get('/api/workflows', async (c) => {
  const agent = getAgent(c.env);
  return c.json(agent.listCiWorkflows());
});

app.get('/api/workflows/stats', async (c) => {
  const agent = getAgent(c.env);
  return c.json(agent.getCiWorkflowStats());
});

app.post('/api/workflows', async (c) => {
  const data = await c.req.json();
  const agent = getAgent(c.env);
  return c.json(agent.createCiWorkflow(data), 201);
});

app.patch('/api/workflows/:id', async (c) => {
  const data = await c.req.json();
  const agent = getAgent(c.env);
  return c.json(agent.updateCiWorkflow(Number(c.req.param('id')), data));
});

app.post('/api/chittyflow/workflows', async (c) => {
  const { appId, workflows } = await c.req.json();
  const agent = getAgent(c.env);
  const created = workflows.map((wf: Record<string, unknown>) =>
    agent.createCiWorkflow({ ...wf, appId } as never),
  );
  return c.json({ synced: created.length, workflows: created });
});

// ── Health Monitoring ──

app.get('/api/health/latest', async (c) => {
  const agent = getAgent(c.env);
  return c.json(agent.getLatestHealth());
});

app.get('/api/health/sweep', async (c) => {
  const agent = getAgent(c.env);
  const results = await agent.runHealthSweep();
  return c.json(results);
});

app.get('/api/health/:service/history', async (c) => {
  const agent = getAgent(c.env);
  const limit = Number(c.req.query('limit') || '100');
  return c.json(agent.getServiceHistory(c.req.param('service'), limit));
});

// ── Export ──

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const agentResponse = await routeAgentRequest(request, env);
    if (agentResponse) return agentResponse;
    return app.fetch(request, env, ctx);
  },

  async scheduled(_controller: ScheduledController, env: Env, ctx: ExecutionContext): Promise<void> {
    const id = env.MONITOR_AGENT.idFromName('singleton');
    const agent = env.MONITOR_AGENT.get(id) as unknown as MonitorAgent;
    ctx.waitUntil(agent.runHealthSweep());
  },
} satisfies ExportedHandler<Env>;
