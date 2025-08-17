import { sql, relations } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, boolean, integer, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  chittyId: text("chitty_id").unique(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  avatar: text("avatar"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const apps = pgTable("apps", {
  id: varchar("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  name: text("name").notNull(),
  version: text("version").notNull(),
  platform: text("platform").notNull(),
  environment: text("environment"),
  hostname: text("hostname"),
  nodeVersion: text("node_version"),
  os: text("os"),
  hasClaudeCode: boolean("has_claude_code").default(false),
  hasGit: boolean("has_git").default(false),
  gitInfo: jsonb("git_info"),
  platformInfo: jsonb("platform_info"),
  status: text("status").notNull().default("offline"), // online, offline, error
  startedAt: timestamp("started_at").notNull(),
  lastSeen: timestamp("last_seen").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const appEvents = pgTable("app_events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  appId: varchar("app_id").references(() => apps.id).notNull(),
  event: text("event").notNull(), // startup, shutdown, heartbeat
  timestamp: timestamp("timestamp").notNull(),
  data: jsonb("data"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
  apps: many(apps),
}));

export const appsRelations = relations(apps, ({ one, many }) => ({
  user: one(users, {
    fields: [apps.userId],
    references: [users.id],
  }),
  events: many(appEvents),
}));

export const appEventsRelations = relations(appEvents, ({ one }) => ({
  app: one(apps, {
    fields: [appEvents.appId],
    references: [apps.id],
  }),
}));

export const insertUserSchema = createInsertSchema(users).pick({
  chittyId: true,
  username: true,
  email: true,
  name: true,
  avatar: true,
});

export const insertAppSchema = createInsertSchema(apps).omit({
  createdAt: true,
  updatedAt: true,
});

export const insertAppEventSchema = createInsertSchema(appEvents).omit({
  id: true,
  createdAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertApp = z.infer<typeof insertAppSchema>;
export type App = typeof apps.$inferSelect;
export type InsertAppEvent = z.infer<typeof insertAppEventSchema>;
export type AppEvent = typeof appEvents.$inferSelect;
