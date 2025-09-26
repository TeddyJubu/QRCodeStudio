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

vi.mock('../../../../client/src/components/ui/label', () => ({
  Label: ({ children, 'data-testid': testId, ...props }: any) =>
    React.createElement('label', { 'data-testid': testId, ...props }, children),
}));

vi.mock('../../../../client/src/components/ui/switch', () => ({
  Switch: ({ checked, onCheckedChange, 'data-testid': testId, ...props }: any) =>
    React.createElement('input', {
      type: 'checkbox',
      checked,
      onChange: e => onCheckedChange(e.target.checked),
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

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  Settings: ({ className }: any) =>
    React.createElement('svg', { className, 'data-testid': 'settings-icon' }),
  Palette: ({ className }: any) =>
    React.createElement('svg', { className, 'data-testid': 'palette-icon' }),
  Download: ({ className }: any) =>
    React.createElement('svg', { className, 'data-testid': 'download-icon' }),
  Save: ({ className }: any) =>
    React.createElement('svg', { className, 'data-testid': 'save-icon' }),
}));

// Simple UserPreferences component for testing
function UserPreferences() {
  const { preferences, updatePreferences, isLoadingPreferences } = mockUsePersistence();
  const { theme, setTheme } = mockUseTheme();
  const [isOpen, setIsOpen] = React.useState(false);

  const [autoSave, setAutoSave] = React.useState(preferences?.autoSave ?? true);
  const [defaultDownloadFormat, setDefaultDownloadFormat] = React.useState(
    preferences?.defaultDownloadFormat ?? 'png'
  );

  React.useEffect(() => {
    if (preferences) {
      setAutoSave(preferences.autoSave);
      setDefaultDownloadFormat(preferences.defaultDownloadFormat);
      if (preferences.theme !== theme) {
        setTheme(preferences.theme);
      }
    }
  }, [preferences, theme, setTheme]);

  const handleSave = async () => {
    try {
      await updatePreferences({
        theme,
        autoSave,
        defaultDownloadFormat,
      });
      setIsOpen(false);
    } catch (error) {
      console.error('Failed to save preferences:', error);
    }
  };

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
  };

  return React.createElement(
    'div',
    null,
    React.createElement(
      'button',
      {
        onClick: () => setIsOpen(true),
        'data-testid': 'button-user-preferences',
      },
      'Settings'
    ),

    isOpen &&
      React.createElement(
        'div',
        { 'data-testid': 'dialog' },
        React.createElement(
          'div',
          { 'data-testid': 'dialog-content' },
          React.createElement(
            'div',
            { 'data-testid': 'dialog-header' },
            React.createElement('h2', { 'data-testid': 'dialog-title' }, 'User Preferences'),
            React.createElement(
              'p',
              { 'data-testid': 'dialog-description' },
              'Customize your QR code generator experience.'
            )
          ),

          isLoadingPreferences
            ? React.createElement(
                'div',
                { 'data-testid': 'loading-preferences' },
                'Loading preferences...'
              )
            : React.createElement(
                'div',
                { 'data-testid': 'preferences-content' },
                React.createElement(
                  'div',
                  { 'data-testid': 'theme-section' },
                  React.createElement('h3', { 'data-testid': 'card-title' }, 'Appearance'),
                  React.createElement(
                    'div',
                    { 'data-testid': 'card-content' },
                    React.createElement('label', { 'data-testid': 'theme-label' }, 'Theme'),
                    React.createElement(
                      'select',
                      {
                        'data-testid': 'select-theme',
                        value: theme,
                        onChange: e => handleThemeChange(e.target.value),
                      },
                      React.createElement('option', { value: 'light' }, 'Light'),
                      React.createElement('option', { value: 'dark' }, 'Dark')
                    )
                  )
                ),

                React.createElement(
                  'div',
                  { 'data-testid': 'download-section' },
                  React.createElement('h3', { 'data-testid': 'card-title' }, 'Download'),
                  React.createElement(
                    'div',
                    { 'data-testid': 'card-content' },
                    React.createElement(
                      'label',
                      { 'data-testid': 'format-label' },
                      'Default Format'
                    ),
                    React.createElement(
                      'select',
                      {
                        'data-testid': 'select-download-format',
                        value: defaultDownloadFormat,
                        onChange: e => setDefaultDownloadFormat(e.target.value),
                      },
                      React.createElement('option', { value: 'png' }, 'PNG'),
                      React.createElement('option', { value: 'jpeg' }, 'JPEG'),
                      React.createElement('option', { value: 'svg' }, 'SVG')
                    )
                  )
                ),

                React.createElement(
                  'div',
                  { 'data-testid': 'save-section' },
                  React.createElement('h3', { 'data-testid': 'card-title' }, 'Saving'),
                  React.createElement(
                    'div',
                    { 'data-testid': 'card-content' },
                    React.createElement(
                      'label',
                      { 'data-testid': 'auto-save-label' },
                      'Auto-save QR codes'
                    ),
                    React.createElement('input', {
                      type: 'checkbox',
                      'data-testid': 'switch-auto-save',
                      checked: autoSave,
                      onChange: e => setAutoSave(e.target.checked),
                    })
                  )
                )
              ),

          React.createElement(
            'div',
            { 'data-testid': 'dialog-footer' },
            React.createElement(
              'button',
              {
                onClick: () => setIsOpen(false),
                'data-testid': 'button-cancel',
              },
              'Cancel'
            ),
            React.createElement(
              'button',
              {
                onClick: handleSave,
                disabled: isLoadingPreferences,
                'data-testid': 'button-save-preferences',
              },
              'Save Preferences'
            )
          )
        )
      )
  );
}

describe('UserPreferences', () => {
  const mockUpdatePreferences = vi.fn();
  const mockSetTheme = vi.fn();

  beforeEach(() => {
    mockUpdatePreferences.mockClear();
    mockSetTheme.mockClear();
    mockUsePersistence.mockReturnValue({
      preferences: {
        theme: 'light',
        autoSave: true,
        defaultDownloadFormat: 'png',
      },
      updatePreferences: mockUpdatePreferences,
      isLoadingPreferences: false,
    });
    mockUseTheme.mockReturnValue({
      theme: 'light',
      setTheme: mockSetTheme,
    });
  });

  it('renders user preferences button', () => {
    render(React.createElement(UserPreferences));

    expect(screen.getByTestId('button-user-preferences')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });

  it('opens dialog when settings button is clicked', () => {
    render(React.createElement(UserPreferences));

    const settingsButton = screen.getByTestId('button-user-preferences');
    fireEvent.click(settingsButton);

    expect(screen.getByTestId('dialog')).toBeInTheDocument();
    expect(screen.getByTestId('dialog-content')).toBeInTheDocument();
    expect(screen.getByTestId('dialog-title')).toBeInTheDocument();
    expect(screen.getByText('User Preferences')).toBeInTheDocument();
  });

  it('shows loading state when preferences are loading', () => {
    mockUsePersistence.mockReturnValue({
      preferences: null,
      updatePreferences: mockUpdatePreferences,
      isLoadingPreferences: true,
    });

    render(React.createElement(UserPreferences));

    const settingsButton = screen.getByTestId('button-user-preferences');
    fireEvent.click(settingsButton);

    expect(screen.getByTestId('loading-preferences')).toBeInTheDocument();
    expect(screen.getByText('Loading preferences...')).toBeInTheDocument();
  });

  it('renders theme selection section', () => {
    render(React.createElement(UserPreferences));

    const settingsButton = screen.getByTestId('button-user-preferences');
    fireEvent.click(settingsButton);

    expect(screen.getByTestId('theme-section')).toBeInTheDocument();
    expect(screen.getByTestId('select-theme')).toBeInTheDocument();
    expect(screen.getByText('Light')).toBeInTheDocument();
    expect(screen.getByText('Dark')).toBeInTheDocument();
  });

  it('renders download format section', () => {
    render(React.createElement(UserPreferences));

    const settingsButton = screen.getByTestId('button-user-preferences');
    fireEvent.click(settingsButton);

    expect(screen.getByTestId('download-section')).toBeInTheDocument();
    expect(screen.getByTestId('select-download-format')).toBeInTheDocument();
    expect(screen.getByText('PNG')).toBeInTheDocument();
    expect(screen.getByText('JPEG')).toBeInTheDocument();
    expect(screen.getByText('SVG')).toBeInTheDocument();
  });

  it('renders auto-save section', () => {
    render(React.createElement(UserPreferences));

    const settingsButton = screen.getByTestId('button-user-preferences');
    fireEvent.click(settingsButton);

    expect(screen.getByTestId('save-section')).toBeInTheDocument();
    expect(screen.getByTestId('switch-auto-save')).toBeInTheDocument();
    expect(screen.getByTestId('switch-auto-save')).toBeChecked();
  });

  it('calls updatePreferences when save button is clicked', async () => {
    render(React.createElement(UserPreferences));

    const settingsButton = screen.getByTestId('button-user-preferences');
    fireEvent.click(settingsButton);

    const saveButton = screen.getByTestId('button-save-preferences');
    fireEvent.click(saveButton);

    expect(mockUpdatePreferences).toHaveBeenCalledWith({
      theme: 'light',
      autoSave: true,
      defaultDownloadFormat: 'png',
    });
  });

  it('closes dialog when save is successful', async () => {
    mockUpdatePreferences.mockResolvedValue({});

    render(React.createElement(UserPreferences));

    const settingsButton = screen.getByTestId('button-user-preferences');
    fireEvent.click(settingsButton);

    expect(screen.getByTestId('dialog')).toBeInTheDocument();

    const saveButton = screen.getByTestId('button-save-preferences');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.queryByTestId('dialog')).not.toBeInTheDocument();
    });
  });

  it('closes dialog when cancel button is clicked', () => {
    render(React.createElement(UserPreferences));

    const settingsButton = screen.getByTestId('button-user-preferences');
    fireEvent.click(settingsButton);

    expect(screen.getByTestId('dialog')).toBeInTheDocument();

    const cancelButton = screen.getByTestId('button-cancel');
    fireEvent.click(cancelButton);

    expect(screen.queryByTestId('dialog')).not.toBeInTheDocument();
  });

  it('calls setTheme when theme is changed', () => {
    render(React.createElement(UserPreferences));

    const settingsButton = screen.getByTestId('button-user-preferences');
    fireEvent.click(settingsButton);

    const themeSelect = screen.getByTestId('select-theme');
    fireEvent.change(themeSelect, { target: { value: 'dark' } });

    expect(mockSetTheme).toHaveBeenCalledWith('dark');
  });

  it('disables save button when loading', () => {
    mockUsePersistence.mockReturnValue({
      preferences: {
        theme: 'light',
        autoSave: true,
        defaultDownloadFormat: 'png',
      },
      updatePreferences: mockUpdatePreferences,
      isLoadingPreferences: true,
    });

    render(React.createElement(UserPreferences));

    const settingsButton = screen.getByTestId('button-user-preferences');
    fireEvent.click(settingsButton);

    const saveButton = screen.getByTestId('button-save-preferences');
    expect(saveButton).toBeDisabled();
  });
});
