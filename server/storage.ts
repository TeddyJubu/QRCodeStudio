import { 
  users, 
  qrCodes, 
  templates, 
  userPreferences,
  type User, 
  type InsertUser,
  type QrCode,
  type InsertQrCode,
  type UpdateQrCode,
  type Template,
  type InsertTemplate,
  type UpdateTemplate,
  type UserPreferences,
  type InsertUserPreferences,
  type UpdateUserPreferences
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, or, sql } from "drizzle-orm";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // QR Code methods
  createQrCode(userId: string, qrCode: InsertQrCode): Promise<QrCode>;
  getQrCodesByUser(userId: string): Promise<QrCode[]>;
  getQrCode(id: string, userId: string): Promise<QrCode | undefined>;
  getQrCodeByShortUrl(shortUrl: string): Promise<QrCode | undefined>;
  updateQrCode(id: string, userId: string, updates: UpdateQrCode): Promise<QrCode | undefined>;
  deleteQrCode(id: string, userId: string): Promise<boolean>;

  // Template methods
  createTemplate(userId: string, template: InsertTemplate): Promise<Template>;
  getTemplatesByUser(userId: string): Promise<Template[]>;
  getPublicTemplates(): Promise<Template[]>;
  getTemplate(id: string): Promise<Template | undefined>;
  getTemplateForUser(id: string, userId: string): Promise<Template | undefined>;
  updateTemplate(id: string, userId: string, updates: UpdateTemplate): Promise<Template | undefined>;
  deleteTemplate(id: string, userId: string): Promise<boolean>;
  incrementTemplateUsage(id: string): Promise<void>;

  // User Preferences methods
  getUserPreferences(userId: string): Promise<UserPreferences | undefined>;
  createUserPreferences(userId: string, preferences: InsertUserPreferences): Promise<UserPreferences>;
  updateUserPreferences(userId: string, updates: UpdateUserPreferences): Promise<UserPreferences | undefined>;
}

export class DatabaseStorage implements IStorage {
  // User methods
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

  // QR Code methods
  async createQrCode(userId: string, qrCode: InsertQrCode): Promise<QrCode> {
    const [newQrCode] = await db
      .insert(qrCodes)
      .values({
        ...qrCode,
        userId,
        updatedAt: new Date()
      })
      .returning();
    return newQrCode;
  }

  async getQrCodesByUser(userId: string): Promise<QrCode[]> {
    return await db
      .select()
      .from(qrCodes)
      .where(eq(qrCodes.userId, userId))
      .orderBy(desc(qrCodes.updatedAt));
  }

  async getQrCode(id: string, userId: string): Promise<QrCode | undefined> {
    const [qrCode] = await db
      .select()
      .from(qrCodes)
      .where(and(eq(qrCodes.id, id), eq(qrCodes.userId, userId)));
    return qrCode || undefined;
  }

  async getQrCodeByShortUrl(shortUrl: string): Promise<QrCode | undefined> {
    const [qrCode] = await db
      .select()
      .from(qrCodes)
      .where(and(eq(qrCodes.shortUrl, shortUrl), eq(qrCodes.isDynamic, true)));
    return qrCode || undefined;
  }

  async updateQrCode(id: string, userId: string, updates: UpdateQrCode): Promise<QrCode | undefined> {
    const [updatedQrCode] = await db
      .update(qrCodes)
      .set({
        ...updates,
        updatedAt: new Date()
      })
      .where(and(eq(qrCodes.id, id), eq(qrCodes.userId, userId)))
      .returning();
    return updatedQrCode || undefined;
  }

  async deleteQrCode(id: string, userId: string): Promise<boolean> {
    const result = await db
      .delete(qrCodes)
      .where(and(eq(qrCodes.id, id), eq(qrCodes.userId, userId)))
      .returning();
    return result.length > 0;
  }

  // Template methods
  async createTemplate(userId: string, template: InsertTemplate): Promise<Template> {
    const [newTemplate] = await db
      .insert(templates)
      .values({
        ...template,
        userId,
        updatedAt: new Date()
      })
      .returning();
    return newTemplate;
  }

  async getTemplatesByUser(userId: string): Promise<Template[]> {
    return await db
      .select()
      .from(templates)
      .where(eq(templates.userId, userId))
      .orderBy(desc(templates.updatedAt));
  }

  async getPublicTemplates(): Promise<Template[]> {
    return await db
      .select()
      .from(templates)
      .where(eq(templates.isPublic, true))
      .orderBy(desc(templates.usageCount));
  }

  async getTemplate(id: string): Promise<Template | undefined> {
    const [template] = await db.select().from(templates).where(eq(templates.id, id));
    return template || undefined;
  }

  async getTemplateForUser(id: string, userId: string): Promise<Template | undefined> {
    const [template] = await db
      .select()
      .from(templates)
      .where(
        and(
          eq(templates.id, id),
          or(eq(templates.isPublic, true), eq(templates.userId, userId))
        )
      );
    return template || undefined;
  }

  async updateTemplate(id: string, userId: string, updates: UpdateTemplate): Promise<Template | undefined> {
    const [updatedTemplate] = await db
      .update(templates)
      .set({
        ...updates,
        updatedAt: new Date()
      })
      .where(and(eq(templates.id, id), eq(templates.userId, userId)))
      .returning();
    return updatedTemplate || undefined;
  }

  async deleteTemplate(id: string, userId: string): Promise<boolean> {
    const result = await db
      .delete(templates)
      .where(and(eq(templates.id, id), eq(templates.userId, userId)))
      .returning();
    return result.length > 0;
  }

  async incrementTemplateUsage(id: string): Promise<void> {
    await db
      .update(templates)
      .set({
        usageCount: sql`${templates.usageCount} + 1`,
        updatedAt: new Date()
      })
      .where(eq(templates.id, id));
  }

  // User Preferences methods
  async getUserPreferences(userId: string): Promise<UserPreferences | undefined> {
    const [preferences] = await db
      .select()
      .from(userPreferences)
      .where(eq(userPreferences.userId, userId));
    return preferences || undefined;
  }

  async createUserPreferences(userId: string, preferences: InsertUserPreferences): Promise<UserPreferences> {
    const [newPreferences] = await db
      .insert(userPreferences)
      .values({
        ...preferences,
        userId,
        updatedAt: new Date()
      })
      .returning();
    return newPreferences;
  }

  async updateUserPreferences(userId: string, updates: UpdateUserPreferences): Promise<UserPreferences | undefined> {
    const [updatedPreferences] = await db
      .update(userPreferences)
      .set({
        ...updates,
        updatedAt: new Date()
      })
      .where(eq(userPreferences.userId, userId))
      .returning();
    return updatedPreferences || undefined;
  }
}

export const storage = new DatabaseStorage();
