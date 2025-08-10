import { sql } from "drizzle-orm";
import { pgTable, text, varchar, decimal, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const exchangeRates = pgTable("exchange_rates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  btcCadRate: decimal("btc_cad_rate", { precision: 15, scale: 8 }).notNull(),
  change24h: decimal("change_24h", { precision: 10, scale: 4 }),
  high24h: decimal("high_24h", { precision: 15, scale: 8 }),
  low24h: decimal("low_24h", { precision: 15, scale: 8 }),
  volume24h: decimal("volume_24h", { precision: 20, scale: 8 }),
  lastUpdated: timestamp("last_updated").defaultNow(),
  isManualOverride: boolean("is_manual_override").default(false),
});

export const siteSettings = pgTable("site_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  processingFeePercent: decimal("processing_fee_percent", { precision: 5, scale: 3 }).default("0.5"),
  minTransactionCad: decimal("min_transaction_cad", { precision: 10, scale: 2 }).default("10.00"),
  maxTransactionCad: decimal("max_transaction_cad", { precision: 15, scale: 2 }).default("50000.00"),
  rateUpdateIntervalSeconds: text("rate_update_interval_seconds").default("30"),
  autoRateUpdatesEnabled: boolean("auto_rate_updates_enabled").default(true),
  maintenanceMode: boolean("maintenance_mode").default(false),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertExchangeRateSchema = createInsertSchema(exchangeRates).omit({
  id: true,
  lastUpdated: true,
});

export const insertSiteSettingsSchema = createInsertSchema(siteSettings).omit({
  id: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type ExchangeRate = typeof exchangeRates.$inferSelect;
export type InsertExchangeRate = z.infer<typeof insertExchangeRateSchema>;
export type SiteSettings = typeof siteSettings.$inferSelect;
export type InsertSiteSettings = z.infer<typeof insertSiteSettingsSchema>;
