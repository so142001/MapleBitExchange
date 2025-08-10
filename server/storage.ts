import { type User, type InsertUser, type ExchangeRate, type InsertExchangeRate, type SiteSettings, type InsertSiteSettings, type UpdateUserBalance } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getAllUsers(): Promise<User[]>;
  updateUserBalance(userId: string, balances: { cadBalance?: number; btcBalance?: number }): Promise<User>;
  updateUserBalanceAdmin(data: UpdateUserBalance): Promise<User>;
  
  getCurrentRate(): Promise<ExchangeRate | undefined>;
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
      email: "admin@example.com",
      cadBalance: "10000.00",
      btcBalance: "0.50000000",
      isAdmin: true,
      createdAt: new Date(),
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

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { 
      ...insertUser, 
      id,
      cadBalance: "0.00",
      btcBalance: "0.00000000",
      isAdmin: false,
      createdAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async updateUserBalance(userId: string, balances: { cadBalance?: number; btcBalance?: number }): Promise<User> {
    const user = this.users.get(userId);
    if (!user) {
      throw new Error("User not found");
    }

    const updatedUser = {
      ...user,
      cadBalance: balances.cadBalance !== undefined ? balances.cadBalance.toString() : user.cadBalance,
      btcBalance: balances.btcBalance !== undefined ? balances.btcBalance.toString() : user.btcBalance,
    };

    this.users.set(userId, updatedUser);
    return updatedUser;
  }

  async updateUserBalanceAdmin(data: UpdateUserBalance): Promise<User> {
    const user = this.users.get(data.userId);
    if (!user) {
      throw new Error("User not found");
    }

    const updatedUser = {
      ...user,
      cadBalance: data.cadBalance ?? user.cadBalance,
      btcBalance: data.btcBalance ?? user.btcBalance,
    };

    this.users.set(data.userId, updatedUser);
    return updatedUser;
  }

  async getCurrentRate(): Promise<ExchangeRate | undefined> {
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
