import { type User, type InsertUser, type ExchangeRate, type InsertExchangeRate, type SiteSettings, type InsertSiteSettings } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getCurrentExchangeRate(): Promise<ExchangeRate | undefined>;
  updateExchangeRate(rate: InsertExchangeRate): Promise<ExchangeRate>;
  
  getSiteSettings(): Promise<SiteSettings | undefined>;
  updateSiteSettings(settings: InsertSiteSettings): Promise<SiteSettings>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private exchangeRate: ExchangeRate | undefined;
  private siteSettings: SiteSettings | undefined;

  constructor() {
    this.users = new Map();
    this.initializeDefaultData();
  }

  private initializeDefaultData() {
    // Create default admin user
    const adminId = randomUUID();
    const adminUser: User = {
      id: adminId,
      username: "admin",
      password: "admin123", // In production, this should be hashed
    };
    this.users.set(adminId, adminUser);

    // Initialize default site settings
    this.siteSettings = {
      id: randomUUID(),
      processingFeePercent: "0.5",
      minTransactionCad: "10.00",
      maxTransactionCad: "50000.00",
      rateUpdateIntervalSeconds: "30",
      autoRateUpdatesEnabled: true,
      maintenanceMode: false,
    };
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getCurrentExchangeRate(): Promise<ExchangeRate | undefined> {
    return this.exchangeRate;
  }

  async updateExchangeRate(rate: InsertExchangeRate): Promise<ExchangeRate> {
    const id = this.exchangeRate?.id || randomUUID();
    const updatedRate: ExchangeRate = {
      ...rate,
      id,
      lastUpdated: new Date(),
    };
    this.exchangeRate = updatedRate;
    return updatedRate;
  }

  async getSiteSettings(): Promise<SiteSettings | undefined> {
    return this.siteSettings;
  }

  async updateSiteSettings(settings: InsertSiteSettings): Promise<SiteSettings> {
    if (this.siteSettings) {
      this.siteSettings = { ...this.siteSettings, ...settings };
    } else {
      this.siteSettings = { ...settings, id: randomUUID() };
    }
    return this.siteSettings;
  }
}

export const storage = new MemStorage();
