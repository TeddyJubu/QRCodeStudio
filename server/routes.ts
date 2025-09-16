import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertQrCodeSchema, 
  updateQrCodeSchema,
  insertTemplateSchema, 
  updateTemplateSchema,
  insertUserPreferencesSchema,
  updateUserPreferencesSchema
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // TODO: Replace with real authentication once implemented
  const getMockUserId = (): string => "demo-user-id";

  // QR Code routes
  app.get("/api/qr-codes", async (req, res) => {
    try {
      const userId = getMockUserId(); // TODO: Get from authentication
      const qrCodes = await storage.getQrCodesByUser(userId);
      res.json(qrCodes);
    } catch (error) {
      console.error("Error fetching QR codes:", error);
      res.status(500).json({ error: "Failed to fetch QR codes" });
    }
  });

  app.post("/api/qr-codes", async (req, res) => {
    try {
      const userId = getMockUserId(); // TODO: Get from authentication
      const qrCodeData = insertQrCodeSchema.parse(req.body);
      const qrCode = await storage.createQrCode(userId, qrCodeData);
      res.status(201).json(qrCode);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid data", details: error.errors });
      }
      console.error("Error creating QR code:", error);
      res.status(500).json({ error: "Failed to create QR code" });
    }
  });

  app.get("/api/qr-codes/:id", async (req, res) => {
    try {
      const userId = getMockUserId(); // TODO: Get from authentication
      const qrCode = await storage.getQrCode(req.params.id, userId);
      if (!qrCode) {
        return res.status(404).json({ error: "QR code not found" });
      }
      res.json(qrCode);
    } catch (error) {
      console.error("Error fetching QR code:", error);
      res.status(500).json({ error: "Failed to fetch QR code" });
    }
  });

  app.put("/api/qr-codes/:id", async (req, res) => {
    try {
      const userId = getMockUserId(); // TODO: Get from authentication
      const updates = updateQrCodeSchema.parse(req.body);
      const qrCode = await storage.updateQrCode(req.params.id, userId, updates);
      if (!qrCode) {
        return res.status(404).json({ error: "QR code not found" });
      }
      res.json(qrCode);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid data", details: error.errors });
      }
      console.error("Error updating QR code:", error);
      res.status(500).json({ error: "Failed to update QR code" });
    }
  });

  app.delete("/api/qr-codes/:id", async (req, res) => {
    try {
      const userId = getMockUserId(); // TODO: Get from authentication
      const success = await storage.deleteQrCode(req.params.id, userId);
      if (!success) {
        return res.status(404).json({ error: "QR code not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting QR code:", error);
      res.status(500).json({ error: "Failed to delete QR code" });
    }
  });

  // Template routes
  app.get("/api/templates", async (req, res) => {
    try {
      const isPublic = req.query.public === 'true';
      
      let templates;
      if (isPublic) {
        templates = await storage.getPublicTemplates();
      } else {
        const userId = getMockUserId(); // TODO: Get from authentication
        templates = await storage.getTemplatesByUser(userId);
      }
      
      res.json(templates);
    } catch (error) {
      console.error("Error fetching templates:", error);
      res.status(500).json({ error: "Failed to fetch templates" });
    }
  });

  app.post("/api/templates", async (req, res) => {
    try {
      const userId = getMockUserId(); // TODO: Get from authentication
      const templateData = insertTemplateSchema.parse(req.body);
      const template = await storage.createTemplate(userId, templateData);
      res.status(201).json(template);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid data", details: error.errors });
      }
      console.error("Error creating template:", error);
      res.status(500).json({ error: "Failed to create template" });
    }
  });

  app.get("/api/templates/:id", async (req, res) => {
    try {
      const userId = getMockUserId(); // TODO: Get from authentication
      const template = await storage.getTemplateForUser(req.params.id, userId);
      if (!template) {
        return res.status(404).json({ error: "Template not found" });
      }
      res.json(template);
    } catch (error) {
      console.error("Error fetching template:", error);
      res.status(500).json({ error: "Failed to fetch template" });
    }
  });

  app.post("/api/templates/:id/use", async (req, res) => {
    try {
      // Only allow incrementing usage for public templates or owned templates
      const userId = getMockUserId(); // TODO: Get from authentication
      const template = await storage.getTemplateForUser(req.params.id, userId);
      if (!template) {
        return res.status(404).json({ error: "Template not found" });
      }
      
      await storage.incrementTemplateUsage(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error incrementing template usage:", error);
      res.status(500).json({ error: "Failed to increment template usage" });
    }
  });

  app.put("/api/templates/:id", async (req, res) => {
    try {
      const userId = getMockUserId(); // TODO: Get from authentication
      const updates = updateTemplateSchema.parse(req.body);
      const template = await storage.updateTemplate(req.params.id, userId, updates);
      if (!template) {
        return res.status(404).json({ error: "Template not found" });
      }
      res.json(template);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid data", details: error.errors });
      }
      console.error("Error updating template:", error);
      res.status(500).json({ error: "Failed to update template" });
    }
  });

  app.delete("/api/templates/:id", async (req, res) => {
    try {
      const userId = getMockUserId(); // TODO: Get from authentication
      const success = await storage.deleteTemplate(req.params.id, userId);
      if (!success) {
        return res.status(404).json({ error: "Template not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting template:", error);
      res.status(500).json({ error: "Failed to delete template" });
    }
  });

  // User Preferences routes
  app.get("/api/preferences", async (req, res) => {
    try {
      const userId = getMockUserId(); // TODO: Get from authentication
      const preferences = await storage.getUserPreferences(userId);
      if (!preferences) {
        return res.status(404).json({ error: "User preferences not found" });
      }
      res.json(preferences);
    } catch (error) {
      console.error("Error fetching user preferences:", error);
      res.status(500).json({ error: "Failed to fetch user preferences" });
    }
  });

  app.post("/api/preferences", async (req, res) => {
    try {
      const userId = getMockUserId(); // TODO: Get from authentication
      const preferencesData = insertUserPreferencesSchema.parse(req.body);
      const preferences = await storage.createUserPreferences(userId, preferencesData);
      res.status(201).json(preferences);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid data", details: error.errors });
      }
      console.error("Error creating user preferences:", error);
      res.status(500).json({ error: "Failed to create user preferences" });
    }
  });

  app.put("/api/preferences", async (req, res) => {
    try {
      const userId = getMockUserId(); // TODO: Get from authentication
      const updates = updateUserPreferencesSchema.parse(req.body);
      const preferences = await storage.updateUserPreferences(userId, updates);
      if (!preferences) {
        return res.status(404).json({ error: "User preferences not found" });
      }
      res.json(preferences);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid data", details: error.errors });
      }
      console.error("Error updating user preferences:", error);
      res.status(500).json({ error: "Failed to update user preferences" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
