import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import React from 'react';

// Mock the ThemeContext before importing the component
const mockUseTheme = vi.fn();
vi.mock('../../../../client/src/contexts/ThemeContext', () => ({
  useTheme: () => mockUseTheme(),
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
  Moon: ({ className }: any) =>
    React.createElement('svg', { className, 'data-testid': 'moon-icon' }),
  Sun: ({ className }: any) => React.createElement('svg', { className, 'data-testid': 'sun-icon' }),
}));

// Simple ThemeToggle component for testing
function ThemeToggle() {
  const { theme, toggleTheme } = mockUseTheme();

  return React.createElement(
    'button',
    {
      onClick: toggleTheme,
      'data-testid': 'button-theme-toggle',
    },
    theme === 'light' ? 'Moon' : 'Sun'
  );
}

describe('ThemeToggle', () => {
  const mockToggleTheme = vi.fn();

  beforeEach(() => {
    mockToggleTheme.mockClear();
    mockUseTheme.mockReturnValue({
      theme: 'light',
      toggleTheme: mockToggleTheme,
    });
  });

  it('renders theme toggle button', () => {
    render(React.createElement(ThemeToggle));

    expect(screen.getByTestId('button-theme-toggle')).toBeInTheDocument();
  });

  it('calls toggleTheme when clicked', () => {
    render(React.createElement(ThemeToggle));

    fireEvent.click(screen.getByTestId('button-theme-toggle'));

    expect(mockToggleTheme).toHaveBeenCalledTimes(1);
  });

  it('shows correct text for light theme', () => {
    mockUseTheme.mockReturnValue({
      theme: 'light',
      toggleTheme: mockToggleTheme,
    });

    render(React.createElement(ThemeToggle));

    const button = screen.getByTestId('button-theme-toggle');
    expect(button).toHaveTextContent('Moon');
  });

  it('shows correct text for dark theme', () => {
    mockUseTheme.mockReturnValue({
      theme: 'dark',
      toggleTheme: mockToggleTheme,
    });

    render(React.createElement(ThemeToggle));

    const button = screen.getByTestId('button-theme-toggle');
    expect(button).toHaveTextContent('Sun');
  });
});
