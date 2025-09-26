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
  type UpdateUserPreferences,
} from '@shared/schema';

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // QR Code methods
  createQrCode(userId: string, qrCode: InsertQrCode, shortUrl?: string): Promise<QrCode>;
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
  updateTemplate(
    id: string,
    userId: string,
    updates: UpdateTemplate
  ): Promise<Template | undefined>;
  deleteTemplate(id: string, userId: string): Promise<boolean>;
  incrementTemplateUsage(id: string): Promise<void>;

  // User Preferences methods
  getUserPreferences(userId: string): Promise<UserPreferences | undefined>;
  createUserPreferences(
    userId: string,
    preferences: InsertUserPreferences
  ): Promise<UserPreferences>;
  updateUserPreferences(
    userId: string,
    updates: UpdateUserPreferences
  ): Promise<UserPreferences | undefined>;
}

// Mock storage implementation for testing
class MockStorage implements IStorage {
  private mockUsers: User[] = [];
  private mockQrCodes: QrCode[] = [];
  private mockTemplates: Template[] = [];
  private mockUserPreferences: UserPreferences[] = [];

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    return this.mockUsers.find(user => user.id === id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return this.mockUsers.find(user => user.username === username);
  }

  async createUser(user: InsertUser): Promise<User> {
    const newUser: User = {
      id: `user-${Date.now()}`,
      username: user.username,
      password: user.password,
      createdAt: new Date(),
    };
    this.mockUsers.push(newUser);
    return newUser;
  }

  // QR Code methods
  async createQrCode(userId: string, qrCode: InsertQrCode, shortUrl?: string): Promise<QrCode> {
    const newQrCode: QrCode = {
      id: `qr-${Date.now()}`,
      userId,
      data: qrCode.data,
      format: qrCode.format,
      size: qrCode.size,
      color: qrCode.color,
      backgroundColor: qrCode.backgroundColor,
      isDynamic: qrCode.isDynamic || false,
      destinationUrl: qrCode.destinationUrl,
      shortUrl: shortUrl,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.mockQrCodes.push(newQrCode);
    return newQrCode;
  }

  async getQrCodesByUser(userId: string): Promise<QrCode[]> {
    return this.mockQrCodes.filter(qr => qr.userId === userId);
  }

  async getQrCode(id: string, userId: string): Promise<QrCode | undefined> {
    return this.mockQrCodes.find(qr => qr.id === id && qr.userId === userId);
  }

  async getQrCodeByShortUrl(shortUrl: string): Promise<QrCode | undefined> {
    return this.mockQrCodes.find(qr => qr.shortUrl === shortUrl);
  }

  async updateQrCode(
    id: string,
    userId: string,
    updates: UpdateQrCode
  ): Promise<QrCode | undefined> {
    const qrIndex = this.mockQrCodes.findIndex(qr => qr.id === id && qr.userId === userId);
    if (qrIndex === -1) return undefined;

    this.mockQrCodes[qrIndex] = {
      ...this.mockQrCodes[qrIndex],
      ...updates,
      updatedAt: new Date(),
    };
    return this.mockQrCodes[qrIndex];
  }

  async deleteQrCode(id: string, userId: string): Promise<boolean> {
    const qrIndex = this.mockQrCodes.findIndex(qr => qr.id === id && qr.userId === userId);
    if (qrIndex === -1) return false;

    this.mockQrCodes.splice(qrIndex, 1);
    return true;
  }

  // Template methods
  async createTemplate(userId: string, template: InsertTemplate): Promise<Template> {
    const newTemplate: Template = {
      id: `template-${Date.now()}`,
      userId,
      name: template.name,
      description: template.description,
      category: template.category,
      data: template.data,
      format: template.format,
      size: template.size,
      color: template.color,
      backgroundColor: template.backgroundColor,
      isPublic: template.isPublic || false,
      usageCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.mockTemplates.push(newTemplate);
    return newTemplate;
  }

  async getTemplatesByUser(userId: string): Promise<Template[]> {
    return this.mockTemplates.filter(template => template.userId === userId);
  }

  async getPublicTemplates(): Promise<Template[]> {
    return this.mockTemplates.filter(template => template.isPublic);
  }

  async getTemplate(id: string): Promise<Template | undefined> {
    return this.mockTemplates.find(template => template.id === id);
  }

  async getTemplateForUser(id: string, userId: string): Promise<Template | undefined> {
    return this.mockTemplates.find(
      template => template.id === id && (template.userId === userId || template.isPublic)
    );
  }

  async updateTemplate(
    id: string,
    userId: string,
    updates: UpdateTemplate
  ): Promise<Template | undefined> {
    const templateIndex = this.mockTemplates.findIndex(
      template => template.id === id && template.userId === userId
    );
    if (templateIndex === -1) return undefined;

    this.mockTemplates[templateIndex] = {
      ...this.mockTemplates[templateIndex],
      ...updates,
      updatedAt: new Date(),
    };
    return this.mockTemplates[templateIndex];
  }

  async deleteTemplate(id: string, userId: string): Promise<boolean> {
    const templateIndex = this.mockTemplates.findIndex(
      template => template.id === id && template.userId === userId
    );
    if (templateIndex === -1) return false;

    this.mockTemplates.splice(templateIndex, 1);
    return true;
  }

  async incrementTemplateUsage(id: string): Promise<void> {
    const template = this.mockTemplates.find(template => template.id === id);
    if (template) {
      template.usageCount = (template.usageCount || 0) + 1;
    }
  }

  // User Preferences methods
  async getUserPreferences(userId: string): Promise<UserPreferences | undefined> {
    return this.mockUserPreferences.find(pref => pref.userId === userId);
  }

  async createUserPreferences(
    userId: string,
    preferences: InsertUserPreferences
  ): Promise<UserPreferences> {
    const newPreferences: UserPreferences = {
      id: `pref-${Date.now()}`,
      userId,
      theme: preferences.theme,
      autoSave: preferences.autoSave,
      defaultDownloadFormat: preferences.defaultDownloadFormat,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.mockUserPreferences.push(newPreferences);
    return newPreferences;
  }

  async updateUserPreferences(
    userId: string,
    updates: UpdateUserPreferences
  ): Promise<UserPreferences | undefined> {
    const prefIndex = this.mockUserPreferences.findIndex(pref => pref.userId === userId);
    if (prefIndex === -1) return undefined;

    this.mockUserPreferences[prefIndex] = {
      ...this.mockUserPreferences[prefIndex],
      ...updates,
      updatedAt: new Date(),
    };
    return this.mockUserPreferences[prefIndex];
  }
}

export const storage = new MockStorage();
