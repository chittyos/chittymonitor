import { users, apps, appEvents, packages, type User, type InsertUser, type App, type InsertApp, type AppEvent, type InsertAppEvent, type Package, type InsertPackage } from "@shared/schema";
import { db } from "./db";
import { eq, desc, count, sql } from "drizzle-orm";

interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(insertUser: InsertUser): Promise<User>;
  
  // App methods
  getApps(): Promise<App[]>;
  getApp(id: string): Promise<App | undefined>;
  upsertApp(appData: InsertApp): Promise<App>;
  
  // Event methods
  createAppEvent(eventData: InsertAppEvent): Promise<AppEvent>;
  getRecentEvents(limit: number): Promise<AppEvent[]>;
  
  // Package methods
  getPackages(): Promise<Package[]>;
  getAppPackages(appId: string): Promise<Package[]>;
  installPackage(packageData: InsertPackage): Promise<Package>;
  updatePackage(id: string, updates: Partial<InsertPackage>): Promise<Package>;
  uninstallPackage(id: string): Promise<void>;
  getPackageStats(): Promise<{
    totalPackages: number;
    packagesByManager: { manager: string; count: number; percentage: number; }[];
    recentInstalls: Package[];
  }>;
  
  // Stats methods
  getStats(): Promise<{
    totalApps: number;
    activeApps: number;
    claudeApps: number;
    avgUptime: number;
    platformDistribution: {
      platform: string;
      count: number;
      percentage: number;
    }[];
  }>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async getApps(): Promise<App[]> {
    return await db.select().from(apps).orderBy(desc(apps.lastSeen));
  }

  async getApp(id: string): Promise<App | undefined> {
    const [app] = await db.select().from(apps).where(eq(apps.id, id));
    return app || undefined;
  }

  async upsertApp(appData: InsertApp): Promise<App> {
    const existing = await this.getApp(appData.id);
    
    if (existing) {
      const [updated] = await db
        .update(apps)
        .set({
          ...appData,
          updatedAt: new Date(),
        })
        .where(eq(apps.id, appData.id))
        .returning();
      return updated;
    } else {
      const [created] = await db
        .insert(apps)
        .values(appData)
        .returning();
      return created;
    }
  }

  async createAppEvent(eventData: InsertAppEvent): Promise<AppEvent> {
    const [event] = await db
      .insert(appEvents)
      .values(eventData)
      .returning();
    return event;
  }

  async getRecentEvents(limit: number): Promise<AppEvent[]> {
    return await db
      .select()
      .from(appEvents)
      .orderBy(desc(appEvents.timestamp))
      .limit(limit);
  }

  async getStats(): Promise<{
    totalApps: number;
    activeApps: number;
    claudeApps: number;
    avgUptime: number;
    platformDistribution: {
      platform: string;
      count: number;
      percentage: number;
    }[];
  }> {
    const totalAppsResult = await db
      .select({ count: count() })
      .from(apps);
    
    const activeAppsResult = await db
      .select({ count: count() })
      .from(apps)
      .where(eq(apps.status, 'online'));
    
    const claudeAppsResult = await db
      .select({ count: count() })
      .from(apps)
      .where(eq(apps.hasClaudeCode, true));
    
    const platformDistResult = await db
      .select({
        platform: apps.platform,
        count: count()
      })
      .from(apps)
      .groupBy(apps.platform);

    const totalApps = totalAppsResult[0]?.count || 0;
    const activeApps = activeAppsResult[0]?.count || 0;
    const claudeApps = claudeAppsResult[0]?.count || 0;

    const platformDistribution = platformDistResult.map(p => ({
      platform: p.platform,
      count: Number(p.count),
      percentage: totalApps > 0 ? (Number(p.count) / totalApps) * 100 : 0
    }));

    return {
      totalApps: Number(totalApps),
      activeApps: Number(activeApps),
      claudeApps: Number(claudeApps),
      avgUptime: activeApps > 0 ? (activeApps / totalApps) * 100 : 0,
      platformDistribution
    };
  }

  // Package management methods
  async getPackages(): Promise<Package[]> {
    return await db
      .select()
      .from(packages)
      .orderBy(desc(packages.installedAt));
  }

  async getAppPackages(appId: string): Promise<Package[]> {
    return await db
      .select()
      .from(packages)
      .where(eq(packages.appId, appId))
      .orderBy(desc(packages.installedAt));
  }

  async installPackage(packageData: InsertPackage): Promise<Package> {
    const [pkg] = await db
      .insert(packages)
      .values({
        ...packageData,
        installedAt: new Date(),
      })
      .returning();
    return pkg;
  }

  async updatePackage(id: string, updates: Partial<InsertPackage>): Promise<Package> {
    const [pkg] = await db
      .update(packages)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(packages.id, id))
      .returning();
    return pkg;
  }

  async uninstallPackage(id: string): Promise<void> {
    await db
      .delete(packages)
      .where(eq(packages.id, id));
  }

  async getPackageStats(): Promise<{
    totalPackages: number;
    packagesByManager: { manager: string; count: number; percentage: number; }[];
    recentInstalls: Package[];
  }> {
    const totalPackagesResult = await db
      .select({ count: count() })
      .from(packages);

    const managerDistResult = await db
      .select({
        manager: packages.manager,
        count: count()
      })
      .from(packages)
      .groupBy(packages.manager);

    const recentInstalls = await db
      .select()
      .from(packages)
      .orderBy(desc(packages.installedAt))
      .limit(10);

    const totalPackages = Number(totalPackagesResult[0]?.count || 0);

    const packagesByManager = managerDistResult.map(p => ({
      manager: p.manager,
      count: Number(p.count),
      percentage: totalPackages > 0 ? (Number(p.count) / totalPackages) * 100 : 0
    }));

    return {
      totalPackages,
      packagesByManager,
      recentInstalls
    };
  }
}

export const storage = new DatabaseStorage();