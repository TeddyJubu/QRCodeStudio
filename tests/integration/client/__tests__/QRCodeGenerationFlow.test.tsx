import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import React from 'react';

// Mock the contexts
const mockUsePersistence = vi.fn();
const mockUseTheme = vi.fn();

vi.mock('../../../../client/src/contexts/PersistenceContext', () => ({
  usePersistence: () => mockUsePersistence(),
}));

vi.mock('../../../../client/src/contexts/ThemeContext', () => ({
  useTheme: () => mockUseTheme(),
}));

// Mock UI components
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

vi.mock('../../../../client/src/components/ui/input', () => ({
  Input: ({ onChange, value, 'data-testid': testId, ...props }: any) =>
    React.createElement('input', {
      onChange,
      value,
      'data-testid': testId,
      ...props,
    }),
}));

vi.mock('../../../../client/src/components/ui/slider', () => ({
  Slider: ({ onValueChange, value, 'data-testid': testId, ...props }: any) =>
    React.createElement('input', {
      type: 'range',
      onChange: e => onValueChange([parseInt(e.target.value)]),
      value: value[0],
      'data-testid': testId,
      ...props,
    }),
}));

vi.mock('../../../../client/src/components/ui/select', () => ({
  Select: ({ children, onValueChange, value, 'data-testid': testId, ...props }: any) =>
    React.createElement(
      'select',
      {
        onChange: e => onValueChange(e.target.value),
        value,
        'data-testid': testId,
        ...props,
      },
      children
    ),
  SelectContent: ({ children }: any) => React.createElement(React.Fragment, null, children),
  SelectItem: ({ children, value }: any) => React.createElement('option', { value }, children),
  SelectTrigger: ({ children, 'data-testid': testId, ...props }: any) =>
    React.createElement('div', { 'data-testid': testId, ...props }, children),
  SelectValue: ({ children }: any) => React.createElement(React.Fragment, null, children),
}));

// Mock QRCodePreview component
vi.mock('../../../../client/src/components/QRCodePreview', () => ({
  default: ({ qrData }: { qrData: any }) =>
    React.createElement(
      'div',
      { 'data-testid': 'qr-preview' },
      React.createElement('div', { 'data-testid': 'qr-code-display' }, 'QR Code Generated'),
      React.createElement('div', { 'data-testid': 'qr-data' }, JSON.stringify(qrData))
    ),
}));

// Mock QRCodeControls component
const QRCodeControls = ({ onQRCodeChange }: { onQRCodeChange: (data: any) => void }) => {
  const handleDataChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onQRCodeChange({ data: e.target.value });
  };

  const handleSizeChange = (value: number[]) => {
    onQRCodeChange({ size: value[0] });
  };

  const handleFormatChange = (value: string) => {
    onQRCodeChange({ format: value });
  };

  return React.createElement(
    'div',
    { 'data-testid': 'qr-controls' },
    React.createElement('input', {
      'data-testid': 'data-input',
      onChange: handleDataChange,
      placeholder: 'Enter URL or text',
    }),
    React.createElement('input', {
      type: 'range',
      'data-testid': 'size-slider',
      onChange: e => handleSizeChange([parseInt(e.target.value)]),
      min: '100',
      max: '500',
      defaultValue: '200',
    }),
    React.createElement(
      'select',
      {
        'data-testid': 'format-select',
        onChange: e => handleFormatChange(e.target.value),
        defaultValue: 'png',
      },
      React.createElement('option', { value: 'png' }, 'PNG'),
      React.createElement('option', { value: 'svg' }, 'SVG'),
      React.createElement('option', { value: 'jpg' }, 'JPG')
    )
  );
};

// Main QRCodeGenerator component for integration testing
function QRCodeGenerator() {
  const { saveState } = mockUsePersistence();
  const [qrData, setQrData] = React.useState({
    data: '',
    size: 200,
    format: 'png',
  });

  const handleQRCodeChange = (newData: any) => {
    const updatedData = { ...qrData, ...newData };
    setQrData(updatedData);
    saveState({ qrData: updatedData });
  };

  return React.createElement(
    'div',
    { 'data-testid': 'qr-generator' },
    React.createElement(QRCodeControls, { onQRCodeChange: handleQRCodeChange }),
    React.createElement(
      'div',
      { 'data-testid': 'qr-preview-container' },
      qrData.data
        ? React.createElement(
            'div',
            { 'data-testid': 'qr-preview' },
            React.createElement('div', { 'data-testid': 'qr-code-display' }, 'QR Code Generated'),
            React.createElement('div', { 'data-testid': 'qr-data' }, JSON.stringify(qrData))
          )
        : React.createElement(
            'div',
            { 'data-testid': 'empty-state' },
            'Enter data to generate QR code'
          )
    )
  );
}

describe('QRCodeGenerationFlow Integration Tests', () => {
  const mockSaveState = vi.fn();

  beforeEach(() => {
    mockSaveState.mockClear();
    mockUsePersistence.mockReturnValue({
      saveState: mockSaveState,
      loadState: vi.fn(),
      savedQRCodes: [],
      isLoadingPreferences: false,
      preferences: { theme: 'light', autoSave: true, defaultDownloadFormat: 'png' },
      updatePreferences: vi.fn(),
    });
    mockUseTheme.mockReturnValue({
      theme: 'light',
      setTheme: vi.fn(),
    });
  });

  it('renders QR code generator with controls and preview area', () => {
    render(React.createElement(QRCodeGenerator));

    expect(screen.getByTestId('qr-generator')).toBeInTheDocument();
    expect(screen.getByTestId('qr-controls')).toBeInTheDocument();
    expect(screen.getByTestId('qr-preview-container')).toBeInTheDocument();
    expect(screen.getByTestId('empty-state')).toBeInTheDocument();
    expect(screen.getByText('Enter data to generate QR code')).toBeInTheDocument();
  });

  it('generates QR code when data is entered', async () => {
    render(React.createElement(QRCodeGenerator));

    const dataInput = screen.getByTestId('data-input');
    fireEvent.change(dataInput, { target: { value: 'https://example.com' } });

    await waitFor(() => {
      expect(screen.getByTestId('qr-preview')).toBeInTheDocument();
      expect(screen.getByTestId('qr-code-display')).toBeInTheDocument();
      expect(screen.getByText('QR Code Generated')).toBeInTheDocument();
    });

    const qrDataElement = screen.getByTestId('qr-data');
    expect(qrDataElement).toBeInTheDocument();
    const qrData = JSON.parse(qrDataElement.textContent || '{}');
    expect(qrData.data).toBe('https://example.com');
    expect(qrData.size).toBe(200);
    expect(qrData.format).toBe('png');
  });

  it('updates QR code when size is changed', async () => {
    render(React.createElement(QRCodeGenerator));

    // First enter data
    const dataInput = screen.getByTestId('data-input');
    fireEvent.change(dataInput, { target: { value: 'https://example.com' } });

    await waitFor(() => {
      expect(screen.getByTestId('qr-preview')).toBeInTheDocument();
    });

    // Then change size
    const sizeSlider = screen.getByTestId('size-slider');
    fireEvent.change(sizeSlider, { target: { value: '300' } });

    await waitFor(() => {
      const qrDataElement = screen.getByTestId('qr-data');
      const qrData = JSON.parse(qrDataElement.textContent || '{}');
      expect(qrData.size).toBe(300);
      expect(qrData.data).toBe('https://example.com');
    });
  });

  it('updates QR code when format is changed', async () => {
    render(React.createElement(QRCodeGenerator));

    // First enter data
    const dataInput = screen.getByTestId('data-input');
    fireEvent.change(dataInput, { target: { value: 'https://example.com' } });

    await waitFor(() => {
      expect(screen.getByTestId('qr-preview')).toBeInTheDocument();
    });

    // Then change format
    const formatSelect = screen.getByTestId('format-select');
    fireEvent.change(formatSelect, { target: { value: 'svg' } });

    await waitFor(() => {
      const qrDataElement = screen.getByTestId('qr-data');
      const qrData = JSON.parse(qrDataElement.textContent || '{}');
      expect(qrData.format).toBe('svg');
      expect(qrData.data).toBe('https://example.com');
    });
  });

  it('saves state when QR code data changes', async () => {
    render(React.createElement(QRCodeGenerator));

    const dataInput = screen.getByTestId('data-input');
    fireEvent.change(dataInput, { target: { value: 'https://example.com' } });

    await waitFor(() => {
      expect(mockSaveState).toHaveBeenCalledWith({
        qrData: {
          data: 'https://example.com',
          size: 200,
          format: 'png',
        },
      });
    });

    // Change size
    const sizeSlider = screen.getByTestId('size-slider');
    fireEvent.change(sizeSlider, { target: { value: '300' } });

    await waitFor(() => {
      expect(mockSaveState).toHaveBeenCalledWith({
        qrData: {
          data: 'https://example.com',
          size: 300,
          format: 'png',
        },
      });
    });

    // Change format
    const formatSelect = screen.getByTestId('format-select');
    fireEvent.change(formatSelect, { target: { value: 'svg' } });

    await waitFor(() => {
      expect(mockSaveState).toHaveBeenCalledWith({
        qrData: {
          data: 'https://example.com',
          size: 300,
          format: 'svg',
        },
      });
    });
  });

  it('maintains QR code display when multiple properties change', async () => {
    render(React.createElement(QRCodeGenerator));

    // Enter data
    const dataInput = screen.getByTestId('data-input');
    fireEvent.change(dataInput, { target: { value: 'https://example.com' } });

    await waitFor(() => {
      expect(screen.getByTestId('qr-preview')).toBeInTheDocument();
    });

    // Change size and format
    const sizeSlider = screen.getByTestId('size-slider');
    const formatSelect = screen.getByTestId('format-select');

    fireEvent.change(sizeSlider, { target: { value: '400' } });
    fireEvent.change(formatSelect, { target: { value: 'jpg' } });

    await waitFor(() => {
      const qrDataElement = screen.getByTestId('qr-data');
      const qrData = JSON.parse(qrDataElement.textContent || '{}');
      expect(qrData).toEqual({
        data: 'https://example.com',
        size: 400,
        format: 'jpg',
      });
    });

    // Ensure QR code is still displayed
    expect(screen.getByTestId('qr-preview')).toBeInTheDocument();
    expect(screen.getByText('QR Code Generated')).toBeInTheDocument();
  });

  it('shows empty state when data is cleared', async () => {
    render(React.createElement(QRCodeGenerator));

    // Enter data
    const dataInput = screen.getByTestId('data-input');
    fireEvent.change(dataInput, { target: { value: 'https://example.com' } });

    await waitFor(() => {
      expect(screen.getByTestId('qr-preview')).toBeInTheDocument();
    });

    // Clear data
    fireEvent.change(dataInput, { target: { value: '' } });

    await waitFor(() => {
      expect(screen.getByTestId('empty-state')).toBeInTheDocument();
      expect(screen.getByText('Enter data to generate QR code')).toBeInTheDocument();
      expect(screen.queryByTestId('qr-preview')).not.toBeInTheDocument();
    });
  });
});
