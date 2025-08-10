import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import session from "express-session";
import { insertExchangeRateSchema, insertSiteSettingsSchema, insertUserSchema, updateUserBalanceSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Session middleware for admin authentication
  app.use(session({
    secret: process.env.SESSION_SECRET || 'cad-btc-exchange-secret',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 } // 24 hours
  }));

  // User registration
  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if username or email already exists
      const existingUser = await storage.getUserByUsername(userData.username);
      const existingEmail = await storage.getUserByEmail(userData.email);
      
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }
      
      if (existingEmail) {
        return res.status(400).json({ message: "Email already exists" });
      }

      const newUser = await storage.createUser(userData);
      
      (req.session as any).userId = newUser.id;
      (req.session as any).isAdmin = newUser.isAdmin;
      
      res.json({ 
        success: true, 
        user: { 
          id: newUser.id, 
          username: newUser.username, 
          email: newUser.email,
          cadBalance: newUser.cadBalance,
          btcBalance: newUser.btcBalance,
          isAdmin: newUser.isAdmin
        } 
      });
    } catch (error) {
      res.status(400).json({ message: "Registration failed" });
    }
  });

  // User login
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      const user = await storage.getUserByUsername(username);
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      (req.session as any).userId = user.id;
      (req.session as any).isAdmin = user.isAdmin;
      
      res.json({ 
        success: true, 
        user: { 
          id: user.id, 
          username: user.username, 
          email: user.email,
          cadBalance: user.cadBalance,
          btcBalance: user.btcBalance,
          isAdmin: user.isAdmin
        } 
      });
    } catch (error) {
      res.status(500).json({ message: "Login failed" });
    }
  });

  // Admin authentication routes (backwards compatibility)
  app.post("/api/admin/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      const user = await storage.getUserByUsername(username);
      if (!user || user.password !== password || !user.isAdmin) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      (req.session as any).userId = user.id;
      (req.session as any).isAdmin = user.isAdmin;
      
      res.json({ success: true, user: { id: user.id, username: user.username } });
    } catch (error) {
      res.status(500).json({ message: "Login failed" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed" });
      }
      res.json({ success: true });
    });
  });

  // Admin logout (backwards compatibility)
  app.post("/api/admin/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed" });
      }
      res.json({ success: true });
    });
  });

  app.get("/api/auth/user", async (req, res) => {
    try {
      const userId = (req.session as any)?.userId;
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }

      res.json({
        id: user.id,
        username: user.username,
        email: user.email,
        cadBalance: user.cadBalance,
        btcBalance: user.btcBalance,
        isAdmin: user.isAdmin,
        createdAt: user.createdAt
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  app.get("/api/admin/status", (req, res) => {
    const isAdmin = (req.session as any)?.isAdmin;
    res.json({ isAuthenticated: !!isAdmin });
  });

  // Exchange rate routes
  app.get("/api/rates/current", async (req, res) => {
    try {
      let rate = await storage.getCurrentExchangeRate();
      
      // If no rate exists or it's not a manual override, fetch from API
      if (!rate || (!rate.isManualOverride && shouldUpdateRate(rate))) {
        const apiRate = await fetchBTCCADRate();
        if (apiRate) {
          rate = await storage.updateExchangeRate(apiRate);
        }
      }
      
      res.json(rate);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch exchange rate" });
    }
  });

  app.post("/api/admin/rates/update", async (req, res) => {
    try {
      const isAdmin = (req.session as any)?.isAdmin;
      if (!isAdmin) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const rateData = insertExchangeRateSchema.parse(req.body);
      const updatedRate = await storage.updateExchangeRate({
        ...rateData,
        isManualOverride: true,
      });
      
      res.json(updatedRate);
    } catch (error) {
      res.status(500).json({ message: "Failed to update rate" });
    }
  });

  app.post("/api/admin/rates/reset", async (req, res) => {
    try {
      const isAdmin = (req.session as any)?.isAdmin;
      if (!isAdmin) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const apiRate = await fetchBTCCADRate();
      if (apiRate) {
        const updatedRate = await storage.updateExchangeRate({
          ...apiRate,
          isManualOverride: false,
        });
        res.json(updatedRate);
      } else {
        res.status(500).json({ message: "Failed to fetch API rate" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to reset rate" });
    }
  });

  // Site settings routes
  app.get("/api/settings", async (req, res) => {
    try {
      const settings = await storage.getSiteSettings();
      res.json(settings);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch settings" });
    }
  });

  app.post("/api/admin/settings", async (req, res) => {
    try {
      const isAdmin = (req.session as any)?.isAdmin;
      if (!isAdmin) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const settingsData = insertSiteSettingsSchema.parse(req.body);
      const updatedSettings = await storage.updateSiteSettings(settingsData);
      
      res.json(updatedSettings);
    } catch (error) {
      res.status(500).json({ message: "Failed to update settings" });
    }
  });

  // User management endpoints for admin
  app.get("/api/admin/users", async (req, res) => {
    try {
      const isAdmin = (req.session as any)?.isAdmin;
      if (!isAdmin) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.post("/api/admin/users/balance", async (req, res) => {
    try {
      const isAdmin = (req.session as any)?.isAdmin;
      if (!isAdmin) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const balanceData = updateUserBalanceSchema.parse(req.body);
      const updatedUser = await storage.updateUserBalance(balanceData);
      
      res.json(updatedUser);
    } catch (error) {
      res.status(500).json({ message: "Failed to update user balance" });
    }
  });

  // Statistics endpoint for admin dashboard
  app.get("/api/admin/stats", async (req, res) => {
    try {
      const isAdmin = (req.session as any)?.isAdmin;
      if (!isAdmin) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const users = await storage.getAllUsers();
      const stats = {
        totalExchanges: 1234,
        volume24h: "2400000",
        activeUsers: users.length,
        totalUsers: users.length,
        systemStatus: "online",
        uptime: "99.9%"
      };
      
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch statistics" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

async function fetchBTCCADRate() {
  try {
    const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=cad&include_24hr_change=true&include_24hr_vol=true');
    const data = await response.json();
    
    if (data.bitcoin) {
      const btc = data.bitcoin;
      return {
        btcCadRate: btc.cad.toString(),
        change24h: btc.cad_24h_change?.toString() || "0",
        high24h: (btc.cad * 1.02).toString(), // Approximate based on current rate
        low24h: (btc.cad * 0.98).toString(),
        volume24h: btc.cad_24h_vol?.toString() || "0",
        isManualOverride: false,
      };
    }
    return null;
  } catch (error) {
    console.error('Failed to fetch BTC/CAD rate:', error);
    return null;
  }
}

function shouldUpdateRate(rate: any): boolean {
  if (!rate.lastUpdated) return true;
  const lastUpdate = new Date(rate.lastUpdated);
  const now = new Date();
  const diffInSeconds = (now.getTime() - lastUpdate.getTime()) / 1000;
  return diffInSeconds > 30; // Update every 30 seconds
}
