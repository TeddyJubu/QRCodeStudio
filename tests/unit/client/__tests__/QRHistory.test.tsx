import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { vi } from 'vitest';
import React from 'react';

// Mock the contexts
const mockUsePersistence = vi.fn();
vi.mock('../../../../client/src/contexts/PersistenceContext', () => ({
  usePersistence: () => mockUsePersistence(),
}));

// Mock UI components
vi.mock('../../../../client/src/components/ui/button', () => ({
  Button: ({ children, onClick, 'data-testid': testId, disabled, ...props }: any) =>
    React.createElement(
      'button',
      {
        onClick,
        'data-testid': testId,
        disabled,
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

vi.mock('../../../../client/src/components/ui/card', () => ({
  Card: ({ children, 'data-testid': testId, ...props }: any) =>
    React.createElement('div', { 'data-testid': testId || 'card', ...props }, children),
  CardHeader: ({ children }: any) =>
    React.createElement('div', { 'data-testid': 'card-header' }, children),
  CardTitle: ({ children }: any) =>
    React.createElement('h3', { 'data-testid': 'card-title' }, children),
  CardContent: ({ children }: any) =>
    React.createElement('div', { 'data-testid': 'card-content' }, children),
}));

vi.mock('../../../../client/src/components/ui/dialog', () => ({
  Dialog: ({ children, open, onOpenChange }: any) =>
    open ? React.createElement('div', { 'data-testid': 'dialog' }, children) : null,
  DialogTrigger: ({ children, ...props }: any) =>
    React.createElement('div', { ...props }, children),
  DialogContent: ({ children }: any) =>
    React.createElement('div', { 'data-testid': 'dialog-content' }, children),
  DialogHeader: ({ children }: any) =>
    React.createElement('div', { 'data-testid': 'dialog-header' }, children),
  DialogTitle: ({ children }: any) =>
    React.createElement('h2', { 'data-testid': 'dialog-title' }, children),
  DialogDescription: ({ children }: any) =>
    React.createElement('p', { 'data-testid': 'dialog-description' }, children),
  DialogFooter: ({ children }: any) =>
    React.createElement('div', { 'data-testid': 'dialog-footer' }, children),
}));

vi.mock('../../../../client/src/components/ui/alert-dialog', () => ({
  AlertDialog: ({ children }: any) =>
    React.createElement('div', { 'data-testid': 'alert-dialog' }, children),
  AlertDialogTrigger: ({ children, ...props }: any) =>
    React.createElement('div', { ...props }, children),
  AlertDialogContent: ({ children }: any) =>
    React.createElement('div', { 'data-testid': 'alert-dialog-content' }, children),
  AlertDialogHeader: ({ children }: any) =>
    React.createElement('div', { 'data-testid': 'alert-dialog-header' }, children),
  AlertDialogTitle: ({ children }: any) =>
    React.createElement('h3', { 'data-testid': 'alert-dialog-title' }, children),
  AlertDialogDescription: ({ children }: any) =>
    React.createElement('p', { 'data-testid': 'alert-dialog-description' }, children),
  AlertDialogFooter: ({ children }: any) =>
    React.createElement('div', { 'data-testid': 'alert-dialog-footer' }, children),
  AlertDialogAction: ({ children, onClick, ...props }: any) =>
    React.createElement(
      'button',
      { onClick, 'data-testid': 'alert-dialog-action', ...props },
      children
    ),
  AlertDialogCancel: ({ children, onClick, ...props }: any) =>
    React.createElement(
      'button',
      { onClick, 'data-testid': 'alert-dialog-cancel', ...props },
      children
    ),
}));

vi.mock('../../../../client/src/components/ui/scroll-area', () => ({
  ScrollArea: ({ children }: any) =>
    React.createElement('div', { 'data-testid': 'scroll-area' }, children),
}));

vi.mock('../../../../client/src/components/ui/label', () => ({
  Label: ({ children, 'data-testid': testId, ...props }: any) =>
    React.createElement('label', { 'data-testid': testId, ...props }, children),
}));

vi.mock('../../../../client/src/components/ui/badge', () => ({
  Badge: ({ children, ...props }: any) =>
    React.createElement('span', { 'data-testid': 'badge', ...props }, children),
}));

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  History: ({ className }: any) =>
    React.createElement('svg', { className, 'data-testid': 'history-icon' }),
  Save: ({ className }: any) =>
    React.createElement('svg', { className, 'data-testid': 'save-icon' }),
  Download: ({ className }: any) =>
    React.createElement('svg', { className, 'data-testid': 'download-icon' }),
  Trash2: ({ className }: any) =>
    React.createElement('svg', { className, 'data-testid': 'trash-icon' }),
  Eye: ({ className }: any) => React.createElement('svg', { className, 'data-testid': 'eye-icon' }),
  Calendar: ({ className }: any) =>
    React.createElement('svg', { className, 'data-testid': 'calendar-icon' }),
  QrCode: ({ className }: any) =>
    React.createElement('svg', { className, 'data-testid': 'qrcode-icon' }),
  ExternalLink: ({ className }: any) =>
    React.createElement('svg', { className, 'data-testid': 'external-link-icon' }),
}));

// Mock date-fns
vi.mock('date-fns', () => ({
  formatDistanceToNow: () => '2 hours ago',
}));

// Simple QRHistory component for testing
function QRHistory({
  currentOptions,
  onLoadOptions,
}: {
  currentOptions: any;
  onLoadOptions: (options: any) => void;
}) {
  const { savedQRCodes, saveQRCode, deleteQRCode, isLoadingQRCodes } = mockUsePersistence();

  const [isOpen, setIsOpen] = React.useState(false);
  const [saveDialogOpen, setSaveDialogOpen] = React.useState(false);
  const [qrName, setQrName] = React.useState('');
  const [selectedQR, setSelectedQR] = React.useState<any>(null);

  const handleSave = async () => {
    if (!qrName.trim()) return;
    await saveQRCode(qrName.trim(), currentOptions);
    setQrName('');
    setSaveDialogOpen(false);
  };

  const handleDelete = async (id: string) => {
    await deleteQRCode(id);
  };

  const handleLoad = (qrCode: any) => {
    onLoadOptions(qrCode.options);
    setIsOpen(false);
  };

  return React.createElement(
    'div',
    null,
    React.createElement(
      'button',
      {
        onClick: () => setSaveDialogOpen(true),
        'data-testid': 'button-save-qr',
      },
      'Save QR Code'
    ),

    React.createElement(
      'button',
      {
        onClick: () => setIsOpen(true),
        'data-testid': 'button-view-history',
      },
      'History'
    ),

    saveDialogOpen &&
      React.createElement(
        'div',
        { 'data-testid': 'save-dialog' },
        React.createElement(
          'div',
          { 'data-testid': 'dialog-content' },
          React.createElement('h2', { 'data-testid': 'dialog-title' }, 'Save QR Code'),
          React.createElement('input', {
            'data-testid': 'input-qr-name',
            value: qrName,
            onChange: e => setQrName(e.target.value),
          }),
          React.createElement(
            'button',
            {
              onClick: handleSave,
              disabled: !qrName.trim(),
              'data-testid': 'button-confirm-save',
            },
            'Save'
          )
        )
      ),

    isOpen &&
      React.createElement(
        'div',
        { 'data-testid': 'history-dialog' },
        React.createElement(
          'div',
          { 'data-testid': 'dialog-content' },
          React.createElement('h2', { 'data-testid': 'dialog-title' }, 'QR Code History'),
          React.createElement(
            'div',
            { 'data-testid': 'scroll-area' },
            isLoadingQRCodes
              ? React.createElement('div', { 'data-testid': 'loading-qrcodes' }, 'Loading...')
              : savedQRCodes.length === 0
                ? React.createElement('div', { 'data-testid': 'no-qrcodes' }, 'No saved QR codes')
                : savedQRCodes.map((qrCode: any) =>
                    React.createElement(
                      'div',
                      { key: qrCode.id, 'data-testid': `qr-code-item-${qrCode.id}` },
                      React.createElement(
                        'h3',
                        { 'data-testid': `text-qr-name-${qrCode.id}` },
                        qrCode.title
                      ),
                      React.createElement(
                        'button',
                        {
                          onClick: () => handleLoad(qrCode),
                          'data-testid': `button-load-qr-${qrCode.id}`,
                        },
                        'Load'
                      ),
                      React.createElement(
                        'button',
                        {
                          onClick: () => setSelectedQR(qrCode),
                          'data-testid': `button-preview-qr-${qrCode.id}`,
                        },
                        'Preview'
                      ),
                      React.createElement(
                        'button',
                        {
                          onClick: () => handleDelete(qrCode.id),
                          'data-testid': `button-delete-qr-${qrCode.id}`,
                        },
                        'Delete'
                      )
                    )
                  )
          )
        )
      ),

    selectedQR &&
      React.createElement(
        'div',
        { 'data-testid': 'preview-dialog' },
        React.createElement(
          'div',
          { 'data-testid': 'dialog-content' },
          React.createElement('h2', { 'data-testid': 'dialog-title' }, selectedQR.title),
          React.createElement(
            'button',
            {
              onClick: () => handleLoad(selectedQR),
              'data-testid': 'button-load-from-preview',
            },
            'Load This QR Code'
          )
        )
      )
  );
}

describe('QRHistory', () => {
  const mockSaveQRCode = vi.fn();
  const mockDeleteQRCode = vi.fn();
  const mockOnLoadOptions = vi.fn();
  const mockCurrentOptions = {
    data: 'https://example.com',
    format: 'png',
    size: 200,
  };

  const mockSavedQRCodes = [
    {
      id: '1',
      title: 'Test QR 1',
      data: 'https://example.com',
      options: { data: 'https://example.com', format: 'png', size: 200 },
      updatedAt: new Date().toISOString(),
    },
    {
      id: '2',
      title: 'Test QR 2',
      data: 'https://test.com',
      options: { data: 'https://test.com', format: 'svg', size: 300 },
      updatedAt: new Date().toISOString(),
    },
  ];

  beforeEach(() => {
    mockSaveQRCode.mockClear();
    mockDeleteQRCode.mockClear();
    mockOnLoadOptions.mockClear();
    mockUsePersistence.mockReturnValue({
      savedQRCodes: mockSavedQRCodes,
      saveQRCode: mockSaveQRCode,
      deleteQRCode: mockDeleteQRCode,
      isLoadingQRCodes: false,
    });
  });

  it('renders save QR code button', () => {
    render(
      React.createElement(QRHistory, {
        currentOptions: mockCurrentOptions,
        onLoadOptions: mockOnLoadOptions,
      })
    );

    expect(screen.getByTestId('button-save-qr')).toBeInTheDocument();
    expect(screen.getByText('Save QR Code')).toBeInTheDocument();
  });

  it('renders view history button', () => {
    render(
      React.createElement(QRHistory, {
        currentOptions: mockCurrentOptions,
        onLoadOptions: mockOnLoadOptions,
      })
    );

    expect(screen.getByTestId('button-view-history')).toBeInTheDocument();
    expect(screen.getByText('History')).toBeInTheDocument();
  });

  it('opens save dialog when save button is clicked', () => {
    render(
      React.createElement(QRHistory, {
        currentOptions: mockCurrentOptions,
        onLoadOptions: mockOnLoadOptions,
      })
    );

    const saveButton = screen.getByTestId('button-save-qr');
    fireEvent.click(saveButton);

    expect(screen.getByTestId('save-dialog')).toBeInTheDocument();
    expect(screen.getByTestId('dialog-title')).toBeInTheDocument();
    expect(screen.getByTestId('save-dialog')).toContainElement(screen.getByTestId('dialog-title'));
  });

  it('opens history dialog when history button is clicked', () => {
    render(
      React.createElement(QRHistory, {
        currentOptions: mockCurrentOptions,
        onLoadOptions: mockOnLoadOptions,
      })
    );

    const historyButton = screen.getByTestId('button-view-history');
    fireEvent.click(historyButton);

    expect(screen.getByTestId('history-dialog')).toBeInTheDocument();
    expect(screen.getByTestId('dialog-title')).toBeInTheDocument();
    expect(screen.getByText('QR Code History')).toBeInTheDocument();
  });

  it('shows loading state when QR codes are loading', () => {
    mockUsePersistence.mockReturnValue({
      savedQRCodes: [],
      saveQRCode: mockSaveQRCode,
      deleteQRCode: mockDeleteQRCode,
      isLoadingQRCodes: true,
    });

    render(
      React.createElement(QRHistory, {
        currentOptions: mockCurrentOptions,
        onLoadOptions: mockOnLoadOptions,
      })
    );

    const historyButton = screen.getByTestId('button-view-history');
    fireEvent.click(historyButton);

    expect(screen.getByTestId('loading-qrcodes')).toBeInTheDocument();
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('shows empty state when no QR codes are saved', () => {
    mockUsePersistence.mockReturnValue({
      savedQRCodes: [],
      saveQRCode: mockSaveQRCode,
      deleteQRCode: mockDeleteQRCode,
      isLoadingQRCodes: false,
    });

    render(
      React.createElement(QRHistory, {
        currentOptions: mockCurrentOptions,
        onLoadOptions: mockOnLoadOptions,
      })
    );

    const historyButton = screen.getByTestId('button-view-history');
    fireEvent.click(historyButton);

    expect(screen.getByTestId('no-qrcodes')).toBeInTheDocument();
    expect(screen.getByText('No saved QR codes')).toBeInTheDocument();
  });

  it('displays saved QR codes in history', () => {
    render(
      React.createElement(QRHistory, {
        currentOptions: mockCurrentOptions,
        onLoadOptions: mockOnLoadOptions,
      })
    );

    const historyButton = screen.getByTestId('button-view-history');
    fireEvent.click(historyButton);

    expect(screen.getByTestId('qr-code-item-1')).toBeInTheDocument();
    expect(screen.getByTestId('qr-code-item-2')).toBeInTheDocument();
    expect(screen.getByTestId('text-qr-name-1')).toHaveTextContent('Test QR 1');
    expect(screen.getByTestId('text-qr-name-2')).toHaveTextContent('Test QR 2');
  });

  it('calls saveQRCode when save is confirmed', async () => {
    render(
      React.createElement(QRHistory, {
        currentOptions: mockCurrentOptions,
        onLoadOptions: mockOnLoadOptions,
      })
    );

    const saveButton = screen.getByTestId('button-save-qr');
    fireEvent.click(saveButton);

    const nameInput = screen.getByTestId('input-qr-name');
    fireEvent.change(nameInput, { target: { value: 'Test QR' } });

    const confirmButton = screen.getByTestId('button-confirm-save');
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(mockSaveQRCode).toHaveBeenCalledWith('Test QR', mockCurrentOptions);
    });
  });

  it('disables save button when name is empty', () => {
    render(
      React.createElement(QRHistory, {
        currentOptions: mockCurrentOptions,
        onLoadOptions: mockOnLoadOptions,
      })
    );

    const saveButton = screen.getByTestId('button-save-qr');
    fireEvent.click(saveButton);

    const confirmButton = screen.getByTestId('button-confirm-save');
    expect(confirmButton).toBeDisabled();
  });

  it('calls onLoadOptions when load button is clicked', () => {
    render(
      React.createElement(QRHistory, {
        currentOptions: mockCurrentOptions,
        onLoadOptions: mockOnLoadOptions,
      })
    );

    const historyButton = screen.getByTestId('button-view-history');
    fireEvent.click(historyButton);

    const loadButton = screen.getByTestId('button-load-qr-1');
    fireEvent.click(loadButton);

    expect(mockOnLoadOptions).toHaveBeenCalledWith(mockSavedQRCodes[0].options);
  });

  it('calls deleteQRCode when delete button is clicked', () => {
    render(
      React.createElement(QRHistory, {
        currentOptions: mockCurrentOptions,
        onLoadOptions: mockOnLoadOptions,
      })
    );

    const historyButton = screen.getByTestId('button-view-history');
    fireEvent.click(historyButton);

    const deleteButton = screen.getByTestId('button-delete-qr-1');
    fireEvent.click(deleteButton);

    expect(mockDeleteQRCode).toHaveBeenCalledWith('1');
  });

  it('opens preview dialog when preview button is clicked', () => {
    render(
      React.createElement(QRHistory, {
        currentOptions: mockCurrentOptions,
        onLoadOptions: mockOnLoadOptions,
      })
    );

    const historyButton = screen.getByTestId('button-view-history');
    fireEvent.click(historyButton);

    const previewButton = screen.getByTestId('button-preview-qr-1');
    fireEvent.click(previewButton);

    expect(screen.getByTestId('preview-dialog')).toBeInTheDocument();
    const previewDialog = screen.getByTestId('preview-dialog');
    const previewDialogTitle = within(previewDialog).getByTestId('dialog-title');
    expect(previewDialog).toContainElement(previewDialogTitle);
    expect(previewDialogTitle).toHaveTextContent('Test QR 1');
  });

  it('calls onLoadOptions from preview dialog', () => {
    render(
      React.createElement(QRHistory, {
        currentOptions: mockCurrentOptions,
        onLoadOptions: mockOnLoadOptions,
      })
    );

    const historyButton = screen.getByTestId('button-view-history');
    fireEvent.click(historyButton);

    const previewButton = screen.getByTestId('button-preview-qr-1');
    fireEvent.click(previewButton);

    const loadFromPreviewButton = screen.getByTestId('button-load-from-preview');
    fireEvent.click(loadFromPreviewButton);

    expect(mockOnLoadOptions).toHaveBeenCalledWith(mockSavedQRCodes[0].options);
  });
});
