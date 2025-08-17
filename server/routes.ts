import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertAppSchema, insertAppEventSchema } from "@shared/schema";
import { z } from "zod";

const trackingSchema = z.object({
  id: z.string(),
  name: z.string(),
  version: z.string(),
  platform: z.string(),
  environment: z.string().optional(),
  hostname: z.string().optional(),
  node_version: z.string().optional(),
  os: z.string().optional(),
  has_claude_code: z.boolean().optional(),
  has_git: z.boolean().optional(),
  git: z.object({
    branch: z.string(),
    commit: z.string(),
    remote: z.string(),
  }).optional(),
  replit: z.object({
    id: z.string(),
    slug: z.string(),
    owner: z.string(),
    url: z.string(),
  }).optional(),
  github: z.object({
    repository: z.string(),
    workflow: z.string().optional(),
    run_id: z.string().optional(),
    actor: z.string().optional(),
  }).optional(),
  vercel: z.object({
    url: z.string(),
    env: z.string(),
    region: z.string(),
  }).optional(),
  event: z.string(),
  timestamp: z.string(),
  uptime: z.number().optional(),
  started_at: z.string().optional(),
  pid: z.number().optional(),
});

export async function registerRoutes(app: Express): Promise<Server> {
  // CORS middleware for beacon tracking
  app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
      res.writeHead(200);
      res.end();
      return;
    }
    next();
  });

  // Beacon tracking endpoint
  app.post('/track', async (req, res) => {
    try {
      const data = trackingSchema.parse(req.body);
      
      // Create or update app
      const appData = {
        id: data.id,
        userId: 'system', // TODO: Associate with actual user when ChittyID is connected
        name: data.name,
        version: data.version,
        platform: data.platform,
        environment: data.environment || 'production',
        hostname: data.hostname,
        nodeVersion: data.node_version,
        os: data.os,
        hasClaudeCode: data.has_claude_code || false,
        hasGit: data.has_git || false,
        gitInfo: data.git,
        platformInfo: {
          replit: data.replit,
          github: data.github,
          vercel: data.vercel,
        },
        status: data.event === 'shutdown' ? 'offline' : 'online',
        startedAt: new Date(data.started_at || data.timestamp),
        lastSeen: new Date(data.timestamp),
      };

      await storage.upsertApp(appData);

      // Record event
      const eventData = {
        appId: data.id,
        event: data.event,
        timestamp: new Date(data.timestamp),
        data: {
          uptime: data.uptime,
          pid: data.pid,
        },
      };

      await storage.createAppEvent(eventData);

      res.json({ status: 'ok' });
    } catch (error) {
      console.error('Tracking error:', error);
      res.status(400).json({ error: 'Invalid tracking data' });
    }
  });

  // API routes
  app.get('/api/apps', async (req, res) => {
    try {
      const apps = await storage.getApps();
      res.json(apps);
    } catch (error) {
      console.error('Error fetching apps:', error);
      res.status(500).json({ error: 'Failed to fetch apps' });
    }
  });

  app.get('/api/apps/:id', async (req, res) => {
    try {
      const app = await storage.getApp(req.params.id);
      if (!app) {
        return res.status(404).json({ error: 'App not found' });
      }
      res.json(app);
    } catch (error) {
      console.error('Error fetching app:', error);
      res.status(500).json({ error: 'Failed to fetch app' });
    }
  });

  app.get('/api/events', async (req, res) => {
    try {
      const events = await storage.getRecentEvents(50);
      res.json(events);
    } catch (error) {
      console.error('Error fetching events:', error);
      res.status(500).json({ error: 'Failed to fetch events' });
    }
  });

  app.get('/api/stats', async (req, res) => {
    try {
      const stats = await storage.getStats();
      res.json(stats);
    } catch (error) {
      console.error('Error fetching stats:', error);
      res.status(500).json({ error: 'Failed to fetch stats' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
