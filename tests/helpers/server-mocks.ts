import { vi } from 'vitest';
import { createMockQRCode, createMockTemplate, createMockUser } from './test-utils.tsx';

// Mock database responses
export const mockDatabase = {
  users: [createMockUser()],
  qrCodes: [createMockQRCode()],
  templates: [createMockTemplate()],
};

// Mock storage functions
export const mockStorage = {
  getUser: vi.fn((id: string) => Promise.resolve(mockDatabase.users.find(user => user.id === id))),
  createUser: vi.fn((userData: any) => Promise.resolve({ id: 'new-user-id', ...userData })),
  updateUser: vi.fn((id: string, updates: any) =>
    Promise.resolve({ ...mockDatabase.users[0], ...updates })
  ),
  getQRCode: vi.fn((id: string) => Promise.resolve(mockDatabase.qrCodes.find(qr => qr.id === id))),
  createQRCode: vi.fn((qrData: any) => Promise.resolve({ id: 'new-qr-id', ...qrData })),
  updateQRCode: vi.fn((id: string, updates: any) =>
    Promise.resolve({ ...mockDatabase.qrCodes[0], ...updates })
  ),
  deleteQRCode: vi.fn((id: string) => Promise.resolve(true)),
  getTemplate: vi.fn((id: string) =>
    Promise.resolve(mockDatabase.templates.find(template => template.id === id))
  ),
  createTemplate: vi.fn((templateData: any) =>
    Promise.resolve({ id: 'new-template-id', ...templateData })
  ),
  updateTemplate: vi.fn((id: string, updates: any) =>
    Promise.resolve({ ...mockDatabase.templates[0], ...updates })
  ),
  deleteTemplate: vi.fn((id: string) => Promise.resolve(true)),
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
