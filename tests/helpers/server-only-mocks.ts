import { vi } from 'vitest';

// Mock database responses (server-only, no React dependencies)
export const mockDatabase = {
  users: [
    {
      id: 'test-user-id',
      username: 'testuser',
      email: 'test@example.com',
      preferences: {
        theme: 'light',
        defaultQRSize: 200,
        defaultFormat: 'png',
        autoSave: true,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],
  qrCodes: [
    {
      id: 'test-qr-id',
      name: 'Test QR Code',
      data: 'https://example.com',
      format: 'png',
      size: 200,
      fgColor: '#000000',
      bgColor: '#ffffff',
      level: 'M',
      includeMargin: true,
      image: '',
      imageOptions: {
        hideBackgroundDots: true,
        imageSize: 0.4,
        margin: 0,
      },
      dotsOptions: {
        type: 'square',
        color: '#000000',
      },
      backgroundOptions: {
        round: true,
        color: '#ffffff',
      },
      cornersSquareOptions: {
        type: 'square',
        color: '#000000',
      },
      cornersDotOptions: {
        type: 'square',
        color: '#000000',
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],
  templates: [
    {
      id: 'test-template-id',
      name: 'Test Template',
      description: 'A test template',
      category: 'general',
      data: {
        format: 'png',
        size: 200,
        fgColor: '#000000',
        bgColor: '#ffffff',
        level: 'M',
        includeMargin: true,
      },
      isPublic: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],
};

// Mock Express request/response objects
export const createMockRequest = (overrides = {}) => ({
  body: {},
  params: {},
  query: {},
  headers: {},
  user: null,
  session: {},
  ...overrides,
});

export const createMockResponse = () => {
  const res: any = {};
  res.status = vi.fn().mockReturnThis();
  res.json = vi.fn().mockReturnThis();
  res.send = vi.fn().mockReturnThis();
  res.end = vi.fn().mockReturnThis();
  res.setHeader = vi.fn().mockReturnThis();
  return res;
};

export const createMockNext = () => vi.fn();
