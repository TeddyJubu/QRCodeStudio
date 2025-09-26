import type { Express } from 'express';
import { createServer, type Server } from 'http';
import { storage, type IStorage } from './storage';
import { qrCodeCache } from './cache';
import {
  insertQrCodeSchema,
  updateQrCodeSchema,
  insertTemplateSchema,
  updateTemplateSchema,
  insertUserPreferencesSchema,
  updateUserPreferencesSchema,
} from '@shared/schema';
import { z } from 'zod';

// Helper function to generate a unique short URL slug
async function generateShortUrl(storageInstance: IStorage): Promise<string> {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

  // Try up to 10 times to find a unique short URL
  for (let attempts = 0; attempts < 10; attempts++) {
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    // Check if this shortUrl is already taken
    const existingQrCode = await storageInstance.getQrCodeByShortUrl(result);
    if (!existingQrCode) {
      return result;
    }
  }

  throw new Error('Failed to generate unique short URL after 10 attempts');
}

export async function registerRoutes(app: Express): Promise<Server> {
  // TODO: Replace with real authentication once implemented
  const getMockUserId = (): string => 'demo-user-id';

  // Preview redirect URL generation for dynamic QRs
  app.post('/api/qr-codes/preview-redirect', async (req, res) => {
    try {
      const { destinationUrl } = req.body;

      if (!destinationUrl || typeof destinationUrl !== 'string') {
        return res.status(400).json({ error: 'destinationUrl is required' });
      }

      // Generate a temporary redirect URL for preview purposes
      const shortUrl = await generateShortUrl(storage);
      const redirectUrl = `${req.protocol}://${req.get('host')}/r/${shortUrl}`;

      res.json({
        redirectUrl,
        shortUrl,
        destinationUrl,
      });
    } catch (error) {
      console.error('Error generating preview redirect:', error);
      res.status(500).json({ error: 'Failed to generate preview redirect' });
    }
  });

  // Dynamic QR Code redirect route
  app.get('/r/:shortUrl', async (req, res) => {
    try {
      const shortUrl = req.params.shortUrl;
      const qrCode = await storage.getQrCodeByShortUrl(shortUrl);

      if (!qrCode || !qrCode.isDynamic || !qrCode.destinationUrl) {
        return res.status(404).json({ error: 'QR code not found or invalid' });
      }

      // Redirect to the destination URL
      res.redirect(302, qrCode.destinationUrl);
    } catch (error) {
      console.error('Error handling redirect:', error);
      res.status(500).json({ error: 'Failed to process redirect' });
    }
  });

  // QR Code routes
  app.get('/api/qr-codes', async (req, res) => {
    try {
      const userId = getMockUserId(); // TODO: Get from authentication
      const qrCodes = await storage.getQrCodesByUser(userId);
      res.json(qrCodes);
    } catch (error) {
      console.error('Error fetching QR codes:', error);
      res.status(500).json({ error: 'Failed to fetch QR codes' });
    }
  });

  app.post('/api/qr-codes', async (req, res) => {
    try {
      const userId = getMockUserId(); // TODO: Get from authentication
      const qrCodeData = insertQrCodeSchema.parse(req.body);

      // Check cache for existing QR code with same data
      const cacheKey = {
        data: qrCodeData.data,
        size: (qrCodeData.options as any)?.size,
        fgColor: (qrCodeData.options as any)?.fgColor,
        bgColor: (qrCodeData.options as any)?.bgColor,
        includeImage: (qrCodeData.options as any)?.includeImage,
        isDynamic: qrCodeData.isDynamic,
      };

      const cachedQrCode = qrCodeCache.get(cacheKey);
      if (cachedQrCode) {
        // Return cached QR code with new ID and timestamp
        const cachedCopy = {
          ...cachedQrCode,
          id: undefined, // Let storage generate new ID
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        const qrCode = await storage.createQrCode(userId, cachedCopy as any);
        return res.status(201).json(qrCode);
      }

      // Handle dynamic QR codes
      if (qrCodeData.isDynamic) {
        // Generate a unique short URL slug
        const shortUrl = await generateShortUrl(storage);

        // Build the full redirect URL that will be encoded in the QR
        const redirectUrl = `${req.protocol}://${req.get('host')}/r/${shortUrl}`;

        // For dynamic QRs, create a clean object with the redirect URL as data
        const dynamicQrCodeData = {
          ...qrCodeData,
          data: redirectUrl, // QR code contains redirect URL
        };

        // Pass the shortUrl separately to storage
        const qrCode = await storage.createQrCode(userId, dynamicQrCodeData, shortUrl);

        // Cache the generated QR code
        qrCodeCache.set(cacheKey, qrCode);

        res.status(201).json(qrCode);
      } else {
        // Static QR code - use data as provided
        const qrCode = await storage.createQrCode(userId, qrCodeData);

        // Cache the generated QR code
        qrCodeCache.set(cacheKey, qrCode);

        res.status(201).json(qrCode);
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid data', details: error.errors });
      }
      console.error('Error creating QR code:', error);
      res.status(500).json({ error: 'Failed to create QR code' });
    }
  });

  app.get('/api/qr-codes/:id', async (req, res) => {
    try {
      const userId = getMockUserId(); // TODO: Get from authentication
      const qrCode = await storage.getQrCode(req.params.id, userId);
      if (!qrCode) {
        return res.status(404).json({ error: 'QR code not found' });
      }
      res.json(qrCode);
    } catch (error) {
      console.error('Error fetching QR code:', error);
      res.status(500).json({ error: 'Failed to fetch QR code' });
    }
  });

  app.put('/api/qr-codes/:id', async (req, res) => {
    try {
      const userId = getMockUserId(); // TODO: Get from authentication
      const updates = updateQrCodeSchema.parse(req.body);
      const qrCode = await storage.updateQrCode(req.params.id, userId, updates);
      if (!qrCode) {
        return res.status(404).json({ error: 'QR code not found' });
      }
      res.json(qrCode);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid data', details: error.errors });
      }
      console.error('Error updating QR code:', error);
      res.status(500).json({ error: 'Failed to update QR code' });
    }
  });

  app.delete('/api/qr-codes/:id', async (req, res) => {
    try {
      const userId = getMockUserId(); // TODO: Get from authentication
      const success = await storage.deleteQrCode(req.params.id, userId);
      if (!success) {
        return res.status(404).json({ error: 'QR code not found' });
      }
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting QR code:', error);
      res.status(500).json({ error: 'Failed to delete QR code' });
    }
  });

  // Template routes
  app.get('/api/templates', async (req, res) => {
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
      console.error('Error fetching templates:', error);
      res.status(500).json({ error: 'Failed to fetch templates' });
    }
  });

  app.post('/api/templates', async (req, res) => {
    try {
      const userId = getMockUserId(); // TODO: Get from authentication
      const templateData = insertTemplateSchema.parse(req.body);
      const template = await storage.createTemplate(userId, templateData);
      res.status(201).json(template);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid data', details: error.errors });
      }
      console.error('Error creating template:', error);
      res.status(500).json({ error: 'Failed to create template' });
    }
  });

  app.get('/api/templates/:id', async (req, res) => {
    try {
      const userId = getMockUserId(); // TODO: Get from authentication
      const template = await storage.getTemplateForUser(req.params.id, userId);
      if (!template) {
        return res.status(404).json({ error: 'Template not found' });
      }
      res.json(template);
    } catch (error) {
      console.error('Error fetching template:', error);
      res.status(500).json({ error: 'Failed to fetch template' });
    }
  });

  app.post('/api/templates/:id/use', async (req, res) => {
    try {
      // Only allow incrementing usage for public templates or owned templates
      const userId = getMockUserId(); // TODO: Get from authentication
      const template = await storage.getTemplateForUser(req.params.id, userId);
      if (!template) {
        return res.status(404).json({ error: 'Template not found' });
      }

      await storage.incrementTemplateUsage(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error('Error incrementing template usage:', error);
      res.status(500).json({ error: 'Failed to increment template usage' });
    }
  });

  app.put('/api/templates/:id', async (req, res) => {
    try {
      const userId = getMockUserId(); // TODO: Get from authentication
      const updates = updateTemplateSchema.parse(req.body);
      const template = await storage.updateTemplate(req.params.id, userId, updates);
      if (!template) {
        return res.status(404).json({ error: 'Template not found' });
      }
      res.json(template);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid data', details: error.errors });
      }
      console.error('Error updating template:', error);
      res.status(500).json({ error: 'Failed to update template' });
    }
  });

  app.delete('/api/templates/:id', async (req, res) => {
    try {
      const userId = getMockUserId(); // TODO: Get from authentication
      const success = await storage.deleteTemplate(req.params.id, userId);
      if (!success) {
        return res.status(404).json({ error: 'Template not found' });
      }
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting template:', error);
      res.status(500).json({ error: 'Failed to delete template' });
    }
  });

  // User Preferences routes
  app.get('/api/preferences', async (req, res) => {
    try {
      const userId = getMockUserId(); // TODO: Get from authentication
      const preferences = await storage.getUserPreferences(userId);
      if (!preferences) {
        return res.status(404).json({ error: 'User preferences not found' });
      }
      res.json(preferences);
    } catch (error) {
      console.error('Error fetching user preferences:', error);
      res.status(500).json({ error: 'Failed to fetch user preferences' });
    }
  });

  app.post('/api/preferences', async (req, res) => {
    try {
      const userId = getMockUserId(); // TODO: Get from authentication
      const preferencesData = insertUserPreferencesSchema.parse(req.body);
      const preferences = await storage.createUserPreferences(userId, preferencesData);
      res.status(201).json(preferences);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid data', details: error.errors });
      }
      console.error('Error creating user preferences:', error);
      res.status(500).json({ error: 'Failed to create user preferences' });
    }
  });

  app.put('/api/preferences', async (req, res) => {
    try {
      const userId = getMockUserId(); // TODO: Get from authentication
      const updates = updateUserPreferencesSchema.parse(req.body);
      const preferences = await storage.updateUserPreferences(userId, updates);
      if (!preferences) {
        return res.status(404).json({ error: 'User preferences not found' });
      }
      res.json(preferences);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid data', details: error.errors });
      }
      console.error('Error updating user preferences:', error);
      res.status(500).json({ error: 'Failed to update user preferences' });
    }
  });

  // Cache statistics endpoint
  app.get('/api/cache/stats', async (req, res) => {
    try {
      const stats = qrCodeCache.getStats();
      res.json({
        ...stats,
        message: 'QR Code caching statistics',
        config: {
          maxSize: 50,
          ttl: '10 minutes',
        },
      });
    } catch (error) {
      console.error('Error fetching cache stats:', error);
      res.status(500).json({ error: 'Failed to fetch cache statistics' });
    }
  });

  // Cache management endpoint
  app.post('/api/cache/clear', async (req, res) => {
    try {
      qrCodeCache.clear();
      res.json({ message: 'Cache cleared successfully' });
    } catch (error) {
      console.error('Error clearing cache:', error);
      res.status(500).json({ error: 'Failed to clear cache' });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
