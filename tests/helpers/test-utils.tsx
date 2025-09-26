import { render, RenderOptions } from '@testing-library/react';
import { ReactElement } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { PersistenceProvider } from '@/contexts/PersistenceContext';

// Create a custom render function that includes providers
const customRender = (ui: ReactElement, options?: Omit<RenderOptions, 'wrapper'>) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
    return (
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <PersistenceProvider>{children}</PersistenceProvider>
        </ThemeProvider>
      </QueryClientProvider>
    );
  };

  return render(ui, { wrapper: AllTheProviders, ...options });
};

// Re-export everything
export * from '@testing-library/react';

// Override render method
export { customRender as render };

// Mock functions
export const createMockQRCode = (overrides = {}) => ({
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
  ...overrides,
});

export const createMockTemplate = (overrides = {}) => ({
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
  ...overrides,
});

export const createMockUser = (overrides = {}) => ({
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
  ...overrides,
});
