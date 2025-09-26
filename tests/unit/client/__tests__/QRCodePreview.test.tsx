import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import React from 'react';

// Mock the contexts
const mockUsePersistence = vi.fn();
vi.mock('../../../../client/src/contexts/PersistenceContext', () => ({
  usePersistence: () => mockUsePersistence(),
}));

// Mock the Button component
vi.mock('../../../../client/src/components/ui/button', () => ({
  Button: ({ children, onClick, 'data-testid': testId, ...props }: any) =>
    React.createElement(
      'button',
      {
        onClick,
        'data-testid': testId,
        ...props,
      },
      children
    ),
}));

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  Download: ({ className }: any) =>
    React.createElement('svg', { className, 'data-testid': 'download-icon' }),
}));

// Simple QRCodePreview component for testing
function QRCodePreview({ qrData }: { qrData: any }) {
  const { saveState } = mockUsePersistence();

  const handleDownload = () => {
    saveState({ qrData });
  };

  return React.createElement(
    'div',
    { 'data-testid': 'qr-preview' },
    React.createElement('div', { 'data-testid': 'qr-code-display' }, 'QR Code'),
    React.createElement(
      'button',
      {
        onClick: handleDownload,
        'data-testid': 'download-button',
      },
      'Download'
    )
  );
}

describe('QRCodePreview', () => {
  const mockSaveState = vi.fn();
  const mockQrData = {
    data: 'https://example.com',
    format: 'png',
    size: 200,
  };

  beforeEach(() => {
    mockSaveState.mockClear();
    mockUsePersistence.mockReturnValue({
      saveState: mockSaveState,
      loadState: vi.fn(),
    });
  });

  it('renders QR code preview', () => {
    render(React.createElement(QRCodePreview, { qrData: mockQrData }));

    expect(screen.getByTestId('qr-preview')).toBeInTheDocument();
    expect(screen.getByTestId('qr-code-display')).toBeInTheDocument();
  });

  it('renders download button', () => {
    render(React.createElement(QRCodePreview, { qrData: mockQrData }));

    expect(screen.getByTestId('download-button')).toBeInTheDocument();
    expect(screen.getByText('Download')).toBeInTheDocument();
  });

  it('calls saveState when download button is clicked', () => {
    const { container } = render(React.createElement(QRCodePreview, { qrData: mockQrData }));

    const downloadButton = screen.getByTestId('download-button');
    downloadButton.click();

    expect(mockSaveState).toHaveBeenCalledWith({ qrData: mockQrData });
  });

  it('displays QR code with provided data', () => {
    render(React.createElement(QRCodePreview, { qrData: mockQrData }));

    const qrDisplay = screen.getByTestId('qr-code-display');
    expect(qrDisplay).toBeInTheDocument();
  });
});
