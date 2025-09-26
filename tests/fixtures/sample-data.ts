// Sample data for testing
export const sampleQRCodeData = {
  basic: {
    data: 'https://example.com',
    format: 'png',
    size: 200,
    fgColor: '#000000',
    bgColor: '#ffffff',
    level: 'M',
    includeMargin: true,
  },
  withImage: {
    data: 'https://example.com',
    format: 'png',
    size: 300,
    fgColor: '#2563eb',
    bgColor: '#ffffff',
    level: 'H',
    includeMargin: true,
    image:
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
    imageOptions: {
      hideBackgroundDots: true,
      imageSize: 0.4,
      margin: 0,
    },
  },
  styled: {
    data: 'https://example.com',
    format: 'svg',
    size: 250,
    fgColor: '#dc2626',
    bgColor: '#fef3c7',
    level: 'Q',
    includeMargin: false,
    dotsOptions: {
      type: 'rounded',
      color: '#dc2626',
    },
    backgroundOptions: {
      round: true,
      color: '#fef3c7',
    },
    cornersSquareOptions: {
      type: 'dot',
      color: '#dc2626',
    },
    cornersDotOptions: {
      type: 'dot',
      color: '#dc2626',
    },
  },
};

export const sampleTemplateData = {
  url: {
    name: 'URL Template',
    description: 'Quick URL QR code template',
    category: 'url',
    data: {
      format: 'png',
      size: 200,
      fgColor: '#000000',
      bgColor: '#ffffff',
      level: 'M',
      includeMargin: true,
    },
    isPublic: true,
  },
  wifi: {
    name: 'WiFi Template',
    description: 'WiFi network sharing template',
    category: 'wifi',
    data: {
      format: 'svg',
      size: 250,
      fgColor: '#1f2937',
      bgColor: '#f3f4f6',
      level: 'H',
      includeMargin: true,
    },
    isPublic: true,
  },
  contact: {
    name: 'Contact Template',
    description: 'vCard contact information template',
    category: 'contact',
    data: {
      format: 'png',
      size: 300,
      fgColor: '#059669',
      bgColor: '#ecfdf5',
      level: 'Q',
      includeMargin: false,
    },
    isPublic: false,
  },
};

export const sampleUserData = {
  basic: {
    username: 'testuser',
    email: 'test@example.com',
    preferences: {
      theme: 'light',
      defaultQRSize: 200,
      defaultFormat: 'png',
      autoSave: true,
    },
  },
  withHistory: {
    username: 'historyuser',
    email: 'history@example.com',
    preferences: {
      theme: 'dark',
      defaultQRSize: 250,
      defaultFormat: 'svg',
      autoSave: false,
    },
  },
  admin: {
    username: 'admin',
    email: 'admin@example.com',
    preferences: {
      theme: 'system',
      defaultQRSize: 300,
      defaultFormat: 'png',
      autoSave: true,
    },
  },
};

export const sampleApiResponses = {
  qrCode: {
    success: {
      id: 'qr-123',
      name: 'Test QR Code',
      data: 'https://example.com',
      format: 'png',
      size: 200,
      fgColor: '#000000',
      bgColor: '#ffffff',
      level: 'M',
      includeMargin: true,
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    },
    error: {
      error: 'Invalid QR code data',
      message: 'The provided data is not valid for QR code generation',
    },
  },
  template: {
    success: {
      id: 'template-123',
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
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    },
    error: {
      error: 'Template not found',
      message: 'The requested template does not exist',
    },
  },
  user: {
    success: {
      id: 'user-123',
      username: 'testuser',
      email: 'test@example.com',
      preferences: {
        theme: 'light',
        defaultQRSize: 200,
        defaultFormat: 'png',
        autoSave: true,
      },
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    },
    error: {
      error: 'Authentication failed',
      message: 'Invalid username or password',
    },
  },
};
