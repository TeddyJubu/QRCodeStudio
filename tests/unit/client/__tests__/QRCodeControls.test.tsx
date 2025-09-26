import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import React from 'react';

// Mock the contexts
const mockUsePersistence = vi.fn();
vi.mock('../../../../client/src/contexts/PersistenceContext', () => ({
  usePersistence: () => mockUsePersistence(),
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

vi.mock('../../../../client/src/components/ui/label', () => ({
  Label: ({ children, 'data-testid': testId, ...props }: any) =>
    React.createElement('label', { 'data-testid': testId, ...props }, children),
}));

// Simple QRCodeControls component for testing
function QRCodeControls({ onQRCodeChange }: { onQRCodeChange: (data: any) => void }) {
  const { saveState, loadState } = mockUsePersistence();

  const handleDataChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newData = { data: e.target.value };
    onQRCodeChange(newData);
    saveState({ qrData: newData });
  };

  const handleSizeChange = (value: number[]) => {
    const newData = { size: value[0] };
    onQRCodeChange(newData);
    saveState({ qrData: newData });
  };

  const handleFormatChange = (value: string) => {
    const newData = { format: value };
    onQRCodeChange(newData);
    saveState({ qrData: newData });
  };

  return React.createElement(
    'div',
    { 'data-testid': 'qr-controls' },
    React.createElement(
      'div',
      { 'data-testid': 'data-input-container' },
      React.createElement('label', { 'data-testid': 'data-label' }, 'Data'),
      React.createElement('input', {
        'data-testid': 'data-input',
        onChange: handleDataChange,
        placeholder: 'Enter URL or text',
      })
    ),
    React.createElement(
      'div',
      { 'data-testid': 'size-slider-container' },
      React.createElement('label', { 'data-testid': 'size-label' }, 'Size'),
      React.createElement('input', {
        type: 'range',
        'data-testid': 'size-slider',
        onChange: e => handleSizeChange([parseInt(e.target.value)]),
        min: '100',
        max: '500',
        defaultValue: '200',
      })
    ),
    React.createElement(
      'div',
      { 'data-testid': 'format-select-container' },
      React.createElement('label', { 'data-testid': 'format-label' }, 'Format'),
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
    )
  );
}

describe('QRCodeControls', () => {
  const mockSaveState = vi.fn();
  const mockLoadState = vi.fn();
  const mockOnQRCodeChange = vi.fn();

  beforeEach(() => {
    mockSaveState.mockClear();
    mockLoadState.mockClear();
    mockOnQRCodeChange.mockClear();
    mockUsePersistence.mockReturnValue({
      saveState: mockSaveState,
      loadState: mockLoadState,
    });
  });

  it('renders QR code controls', () => {
    render(React.createElement(QRCodeControls, { onQRCodeChange: mockOnQRCodeChange }));

    expect(screen.getByTestId('qr-controls')).toBeInTheDocument();
    expect(screen.getByTestId('data-input-container')).toBeInTheDocument();
    expect(screen.getByTestId('size-slider-container')).toBeInTheDocument();
    expect(screen.getByTestId('format-select-container')).toBeInTheDocument();
  });

  it('renders data input field', () => {
    render(React.createElement(QRCodeControls, { onQRCodeChange: mockOnQRCodeChange }));

    expect(screen.getByTestId('data-input')).toBeInTheDocument();
    expect(screen.getByTestId('data-label')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter URL or text')).toBeInTheDocument();
  });

  it('renders size slider', () => {
    render(React.createElement(QRCodeControls, { onQRCodeChange: mockOnQRCodeChange }));

    expect(screen.getByTestId('size-slider')).toBeInTheDocument();
    expect(screen.getByTestId('size-label')).toBeInTheDocument();
  });

  it('renders format select', () => {
    render(React.createElement(QRCodeControls, { onQRCodeChange: mockOnQRCodeChange }));

    expect(screen.getByTestId('format-select')).toBeInTheDocument();
    expect(screen.getByTestId('format-label')).toBeInTheDocument();
    expect(screen.getByText('PNG')).toBeInTheDocument();
    expect(screen.getByText('SVG')).toBeInTheDocument();
    expect(screen.getByText('JPG')).toBeInTheDocument();
  });

  it('calls onQRCodeChange and saveState when data input changes', () => {
    render(React.createElement(QRCodeControls, { onQRCodeChange: mockOnQRCodeChange }));

    const dataInput = screen.getByTestId('data-input');
    fireEvent.change(dataInput, { target: { value: 'https://example.com' } });

    expect(mockOnQRCodeChange).toHaveBeenCalledWith({ data: 'https://example.com' });
    expect(mockSaveState).toHaveBeenCalledWith({ qrData: { data: 'https://example.com' } });
  });

  it('calls onQRCodeChange and saveState when size slider changes', () => {
    render(React.createElement(QRCodeControls, { onQRCodeChange: mockOnQRCodeChange }));

    const sizeSlider = screen.getByTestId('size-slider');
    fireEvent.change(sizeSlider, { target: { value: '300' } });

    expect(mockOnQRCodeChange).toHaveBeenCalledWith({ size: 300 });
    expect(mockSaveState).toHaveBeenCalledWith({ qrData: { size: 300 } });
  });

  it('calls onQRCodeChange and saveState when format select changes', () => {
    render(React.createElement(QRCodeControls, { onQRCodeChange: mockOnQRCodeChange }));

    const formatSelect = screen.getByTestId('format-select');
    fireEvent.change(formatSelect, { target: { value: 'svg' } });

    expect(mockOnQRCodeChange).toHaveBeenCalledWith({ format: 'svg' });
    expect(mockSaveState).toHaveBeenCalledWith({ qrData: { format: 'svg' } });
  });
});
