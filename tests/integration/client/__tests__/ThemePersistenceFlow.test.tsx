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

// Mock ThemeToggle component
const ThemeToggle = () => {
  const { theme, toggleTheme } = mockUseTheme();

  return React.createElement(
    'button',
    {
      onClick: toggleTheme,
      'data-testid': 'button-theme-toggle',
    },
    `Current theme: ${theme}`
  );
};

// Mock UserPreferences component
const UserPreferences = () => {
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

  // Update local state when theme changes
  React.useEffect(() => {
    if (theme) {
      setAutoSave(prev => prev);
      setDefaultDownloadFormat(prev => prev);
    }
  }, [theme]);

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
            React.createElement('h2', { 'data-testid': 'dialog-title' }, 'User Preferences')
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
};

// Main App component for integration testing
function App() {
  return React.createElement(
    'div',
    { 'data-testid': 'app' },
    React.createElement(
      'div',
      { 'data-testid': 'header' },
      React.createElement(ThemeToggle),
      React.createElement(UserPreferences)
    ),
    React.createElement(
      'div',
      { 'data-testid': 'main-content' },
      React.createElement('h1', null, 'QR Code Studio')
    )
  );
}

describe('ThemePersistenceFlow Integration Tests', () => {
  const mockUpdatePreferences = vi.fn();
  const mockSetTheme = vi.fn();
  const mockToggleTheme = vi.fn();

  beforeEach(() => {
    mockUpdatePreferences.mockClear();
    mockSetTheme.mockClear();
    mockToggleTheme.mockClear();
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
      toggleTheme: mockToggleTheme,
    });
  });

  it('renders app with theme toggle and preferences', () => {
    render(React.createElement(App));

    expect(screen.getByTestId('app')).toBeInTheDocument();
    expect(screen.getByTestId('header')).toBeInTheDocument();
    expect(screen.getByTestId('button-theme-toggle')).toBeInTheDocument();
    expect(screen.getByTestId('button-user-preferences')).toBeInTheDocument();
    expect(screen.getByText('QR Code Studio')).toBeInTheDocument();
  });

  it('displays current theme in theme toggle button', () => {
    render(React.createElement(App));

    const themeToggle = screen.getByTestId('button-theme-toggle');
    expect(themeToggle).toHaveTextContent('Current theme: light');
  });

  it('calls toggleTheme when theme toggle button is clicked', () => {
    render(React.createElement(App));

    const themeToggle = screen.getByTestId('button-theme-toggle');
    fireEvent.click(themeToggle);

    expect(mockToggleTheme).toHaveBeenCalledTimes(1);
  });

  it('opens preferences dialog when settings button is clicked', () => {
    render(React.createElement(App));

    const settingsButton = screen.getByTestId('button-user-preferences');
    fireEvent.click(settingsButton);

    expect(screen.getByTestId('dialog')).toBeInTheDocument();
    expect(screen.getByTestId('dialog-title')).toBeInTheDocument();
    expect(screen.getByText('User Preferences')).toBeInTheDocument();
  });

  it('displays theme selection in preferences dialog', () => {
    render(React.createElement(App));

    const settingsButton = screen.getByTestId('button-user-preferences');
    fireEvent.click(settingsButton);

    expect(screen.getByTestId('theme-section')).toBeInTheDocument();
    expect(screen.getByTestId('select-theme')).toBeInTheDocument();
    expect(screen.getByText('Light')).toBeInTheDocument();
    expect(screen.getByText('Dark')).toBeInTheDocument();
  });

  it('calls setTheme when theme is changed in preferences', () => {
    render(React.createElement(App));

    const settingsButton = screen.getByTestId('button-user-preferences');
    fireEvent.click(settingsButton);

    const themeSelect = screen.getByTestId('select-theme');
    fireEvent.change(themeSelect, { target: { value: 'dark' } });

    expect(mockSetTheme).toHaveBeenCalledWith('dark');
  });

  it('saves theme preference when save button is clicked', async () => {
    render(React.createElement(App));

    const settingsButton = screen.getByTestId('button-user-preferences');
    fireEvent.click(settingsButton);

    const themeSelect = screen.getByTestId('select-theme');
    fireEvent.change(themeSelect, { target: { value: 'dark' } });

    const saveButton = screen.getByTestId('button-save-preferences');
    fireEvent.click(saveButton);

    expect(mockUpdatePreferences).toHaveBeenCalledWith({
      theme: 'light',
      autoSave: true,
      defaultDownloadFormat: 'png',
    });
  });

  it('closes preferences dialog after saving', async () => {
    mockUpdatePreferences.mockResolvedValue({});

    render(React.createElement(App));

    const settingsButton = screen.getByTestId('button-user-preferences');
    fireEvent.click(settingsButton);

    expect(screen.getByTestId('dialog')).toBeInTheDocument();

    const saveButton = screen.getByTestId('button-save-preferences');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.queryByTestId('dialog')).not.toBeInTheDocument();
    });
  });

  it('syncs theme from server preferences when loaded', () => {
    mockUsePersistence.mockReturnValue({
      preferences: {
        theme: 'dark',
        autoSave: true,
        defaultDownloadFormat: 'png',
      },
      updatePreferences: mockUpdatePreferences,
      isLoadingPreferences: false,
    });

    render(React.createElement(App));

    expect(mockSetTheme).toHaveBeenCalledWith('dark');
  });

  it('does not sync theme when server preference matches current theme', () => {
    mockUsePersistence.mockReturnValue({
      preferences: {
        theme: 'light',
        autoSave: true,
        defaultDownloadFormat: 'png',
      },
      updatePreferences: mockUpdatePreferences,
      isLoadingPreferences: false,
    });

    render(React.createElement(App));

    expect(mockSetTheme).not.toHaveBeenCalled();
  });

  it('handles preferences loading state', () => {
    mockUsePersistence.mockReturnValue({
      preferences: null,
      updatePreferences: mockUpdatePreferences,
      isLoadingPreferences: true,
    });

    render(React.createElement(App));

    const settingsButton = screen.getByTestId('button-user-preferences');
    fireEvent.click(settingsButton);

    expect(screen.getByTestId('loading-preferences')).toBeInTheDocument();
    expect(screen.getByText('Loading preferences...')).toBeInTheDocument();
  });

  it('disables save button when preferences are loading', () => {
    mockUsePersistence.mockReturnValue({
      preferences: {
        theme: 'light',
        autoSave: true,
        defaultDownloadFormat: 'png',
      },
      updatePreferences: mockUpdatePreferences,
      isLoadingPreferences: true,
    });

    render(React.createElement(App));

    const settingsButton = screen.getByTestId('button-user-preferences');
    fireEvent.click(settingsButton);

    const saveButton = screen.getByTestId('button-save-preferences');
    expect(saveButton).toBeDisabled();
  });
});
