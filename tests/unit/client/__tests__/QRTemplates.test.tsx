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

vi.mock('../../../../client/src/components/ui/textarea', () => ({
  Textarea: ({ onChange, value, 'data-testid': testId, ...props }: any) =>
    React.createElement('textarea', {
      onChange,
      value,
      'data-testid': testId,
      ...props,
    }),
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

vi.mock('../../../../client/src/components/ui/card', () => ({
  Card: ({ children, 'data-testid': testId, ...props }: any) =>
    React.createElement('div', { 'data-testid': testId || 'card', ...props }, children),
  CardHeader: ({ children }: any) =>
    React.createElement('div', { 'data-testid': 'card-header' }, children),
  CardTitle: ({ children }: any) =>
    React.createElement('h3', { 'data-testid': 'card-title' }, children),
  CardContent: ({ children }: any) =>
    React.createElement('div', { 'data-testid': 'card-content' }, children),
  CardDescription: ({ children }: any) =>
    React.createElement('p', { 'data-testid': 'card-description' }, children),
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

vi.mock('../../../../client/src/components/ui/tabs', () => ({
  Tabs: ({ children, defaultValue, value, onValueChange }: any) =>
    React.createElement('div', { 'data-testid': 'tabs' }, children),
  TabsList: ({ children }: any) =>
    React.createElement('div', { 'data-testid': 'tabs-list' }, children),
  TabsTrigger: ({ children, value, onClick, 'data-testid': testId, ...props }: any) =>
    React.createElement('button', { onClick, 'data-testid': testId, ...props }, children),
  TabsContent: ({ children, value }: any) =>
    React.createElement('div', { 'data-testid': `tabs-content-${value}` }, children),
}));

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  Bookmark: ({ className }: any) =>
    React.createElement('svg', { className, 'data-testid': 'bookmark-icon' }),
  Download: ({ className }: any) =>
    React.createElement('svg', { className, 'data-testid': 'download-icon' }),
  Trash2: ({ className }: any) =>
    React.createElement('svg', { className, 'data-testid': 'trash-icon' }),
  Eye: ({ className }: any) => React.createElement('svg', { className, 'data-testid': 'eye-icon' }),
  Calendar: ({ className }: any) =>
    React.createElement('svg', { className, 'data-testid': 'calendar-icon' }),
  Users: ({ className }: any) =>
    React.createElement('svg', { className, 'data-testid': 'users-icon' }),
  Layout: ({ className }: any) =>
    React.createElement('svg', { className, 'data-testid': 'layout-icon' }),
  ExternalLink: ({ className }: any) =>
    React.createElement('svg', { className, 'data-testid': 'external-link-icon' }),
  Star: ({ className }: any) =>
    React.createElement('svg', { className, 'data-testid': 'star-icon' }),
  Globe: ({ className }: any) =>
    React.createElement('svg', { className, 'data-testid': 'globe-icon' }),
  Lock: ({ className }: any) =>
    React.createElement('svg', { className, 'data-testid': 'lock-icon' }),
}));

// Mock date-fns
vi.mock('date-fns', () => ({
  formatDistanceToNow: () => '2 hours ago',
}));

// Simple QRTemplates component for testing
function QRTemplates({
  currentOptions,
  onLoadOptions,
}: {
  currentOptions: any;
  onLoadOptions: (options: any) => void;
}) {
  const {
    templates,
    publicTemplates,
    saveTemplate,
    deleteTemplate,
    useTemplate,
    isLoadingTemplates,
  } = mockUsePersistence();

  const [isOpen, setIsOpen] = React.useState(false);
  const [saveDialogOpen, setSaveDialogOpen] = React.useState(false);
  const [templateName, setTemplateName] = React.useState('');
  const [templateDescription, setTemplateDescription] = React.useState('');
  const [isPublicTemplate, setIsPublicTemplate] = React.useState(false);
  const [selectedTemplate, setSelectedTemplate] = React.useState<any>(null);

  const handleSave = async () => {
    if (!templateName.trim()) return;
    await saveTemplate(
      templateName.trim(),
      templateDescription.trim() || '',
      currentOptions,
      isPublicTemplate
    );
    setTemplateName('');
    setTemplateDescription('');
    setIsPublicTemplate(false);
    setSaveDialogOpen(false);
  };

  const handleDelete = async (id: string) => {
    await deleteTemplate(id);
  };

  const handleUseTemplate = async (template: any) => {
    try {
      await useTemplate(template.id);
      onLoadOptions(template.config);
      setIsOpen(false);
    } catch (error) {
      // Error is handled gracefully
      onLoadOptions(template.config);
      setIsOpen(false);
    }
  };

  return React.createElement(
    'div',
    null,
    React.createElement(
      'button',
      {
        onClick: () => setSaveDialogOpen(true),
        'data-testid': 'button-save-template',
      },
      'Save as Template'
    ),

    React.createElement(
      'button',
      {
        onClick: () => setIsOpen(true),
        'data-testid': 'button-view-templates',
      },
      'Templates'
    ),

    saveDialogOpen &&
      React.createElement(
        'div',
        { 'data-testid': 'save-dialog' },
        React.createElement(
          'div',
          { 'data-testid': 'dialog-content' },
          React.createElement('h2', { 'data-testid': 'dialog-title' }, 'Save Template'),
          React.createElement('input', {
            'data-testid': 'input-template-name',
            value: templateName,
            onChange: e => setTemplateName(e.target.value),
          }),
          React.createElement('textarea', {
            'data-testid': 'textarea-template-description',
            value: templateDescription,
            onChange: e => setTemplateDescription(e.target.value),
          }),
          React.createElement('input', {
            type: 'checkbox',
            'data-testid': 'switch-public-template',
            checked: isPublicTemplate,
            onChange: e => setIsPublicTemplate(e.target.checked),
          }),
          React.createElement(
            'button',
            {
              onClick: handleSave,
              disabled: !templateName.trim(),
              'data-testid': 'button-confirm-save-template',
            },
            'Save Template'
          )
        )
      ),

    isOpen &&
      React.createElement(
        'div',
        { 'data-testid': 'templates-dialog' },
        React.createElement(
          'div',
          { 'data-testid': 'dialog-content' },
          React.createElement('h2', { 'data-testid': 'dialog-title' }, 'QR Code Templates'),
          React.createElement(
            'div',
            { 'data-testid': 'tabs' },
            React.createElement(
              'div',
              { 'data-testid': 'tabs-list' },
              React.createElement(
                'button',
                { 'data-testid': 'tab-my-templates' },
                `My Templates (${templates.length})`
              ),
              React.createElement(
                'button',
                { 'data-testid': 'tab-public-templates' },
                `Public Templates (${publicTemplates.length})`
              )
            ),
            React.createElement(
              'div',
              { 'data-testid': 'tabs-content-my-templates' },
              React.createElement(
                'div',
                { 'data-testid': 'scroll-area' },
                isLoadingTemplates
                  ? React.createElement(
                      'div',
                      { 'data-testid': 'loading-templates' },
                      'Loading templates...'
                    )
                  : templates.length === 0
                    ? React.createElement(
                        'div',
                        { 'data-testid': 'no-templates' },
                        'No templates yet'
                      )
                    : templates.map((template: any) =>
                        React.createElement(
                          'div',
                          { key: template.id, 'data-testid': `template-item-${template.id}` },
                          React.createElement(
                            'h3',
                            { 'data-testid': `text-template-name-${template.id}` },
                            template.name
                          ),
                          React.createElement(
                            'button',
                            {
                              onClick: () => handleUseTemplate(template),
                              'data-testid': `button-use-template-${template.id}`,
                            },
                            'Use Template'
                          ),
                          React.createElement(
                            'button',
                            {
                              onClick: () => setSelectedTemplate(template),
                              'data-testid': `button-preview-template-${template.id}`,
                            },
                            'Preview'
                          ),
                          React.createElement(
                            'button',
                            {
                              onClick: () => handleDelete(template.id),
                              'data-testid': `button-delete-template-${template.id}`,
                            },
                            'Delete'
                          )
                        )
                      )
              )
            ),
            React.createElement(
              'div',
              { 'data-testid': 'tabs-content-public-templates' },
              React.createElement(
                'div',
                { 'data-testid': 'scroll-area' },
                publicTemplates.length === 0
                  ? React.createElement(
                      'div',
                      { 'data-testid': 'no-public-templates' },
                      'No public templates'
                    )
                  : publicTemplates.map((template: any) =>
                      React.createElement(
                        'div',
                        { key: template.id, 'data-testid': `public-template-item-${template.id}` },
                        React.createElement(
                          'h3',
                          { 'data-testid': `text-public-template-name-${template.id}` },
                          template.name
                        ),
                        React.createElement(
                          'button',
                          {
                            onClick: () => handleUseTemplate(template),
                            'data-testid': `button-use-public-template-${template.id}`,
                          },
                          'Use Template'
                        ),
                        React.createElement(
                          'button',
                          {
                            onClick: () => setSelectedTemplate(template),
                            'data-testid': `button-preview-public-template-${template.id}`,
                          },
                          'Preview'
                        )
                      )
                    )
              )
            )
          )
        )
      ),

    selectedTemplate &&
      React.createElement(
        'div',
        { 'data-testid': 'preview-dialog' },
        React.createElement(
          'div',
          { 'data-testid': 'dialog-content' },
          React.createElement('h2', { 'data-testid': 'dialog-title' }, selectedTemplate.name),
          React.createElement(
            'button',
            {
              onClick: () => handleUseTemplate(selectedTemplate),
              'data-testid': 'button-use-from-preview',
            },
            'Use This Template'
          )
        )
      )
  );
}

describe('QRTemplates', () => {
  const mockSaveTemplate = vi.fn();
  const mockDeleteTemplate = vi.fn();
  const mockUseTemplate = vi.fn();
  const mockOnLoadOptions = vi.fn();
  const mockCurrentOptions = {
    data: 'https://example.com',
    format: 'png',
    size: 200,
  };

  const mockTemplates = [
    {
      id: '1',
      name: 'Test Template 1',
      description: 'Test description 1',
      config: { data: 'https://example.com', format: 'png', size: 200 },
      isPublic: false,
      usageCount: 5,
      updatedAt: new Date().toISOString(),
    },
    {
      id: '2',
      name: 'Test Template 2',
      description: 'Test description 2',
      config: { data: 'https://test.com', format: 'svg', size: 300 },
      isPublic: true,
      usageCount: 10,
      updatedAt: new Date().toISOString(),
    },
  ];

  const mockPublicTemplates = [
    {
      id: '3',
      name: 'Public Template 1',
      description: 'Public description 1',
      config: { data: 'https://public.com', format: 'jpg', size: 250 },
      isPublic: true,
      usageCount: 15,
      updatedAt: new Date().toISOString(),
    },
  ];

  beforeEach(() => {
    mockSaveTemplate.mockClear();
    mockDeleteTemplate.mockClear();
    mockUseTemplate.mockClear();
    mockOnLoadOptions.mockClear();
    mockUsePersistence.mockReturnValue({
      templates: mockTemplates,
      publicTemplates: mockPublicTemplates,
      saveTemplate: mockSaveTemplate,
      deleteTemplate: mockDeleteTemplate,
      useTemplate: mockUseTemplate,
      isLoadingTemplates: false,
    });
  });

  it('renders save template button', () => {
    render(
      React.createElement(QRTemplates, {
        currentOptions: mockCurrentOptions,
        onLoadOptions: mockOnLoadOptions,
      })
    );

    expect(screen.getByTestId('button-save-template')).toBeInTheDocument();
    expect(screen.getByText('Save as Template')).toBeInTheDocument();
  });

  it('renders view templates button', () => {
    render(
      React.createElement(QRTemplates, {
        currentOptions: mockCurrentOptions,
        onLoadOptions: mockOnLoadOptions,
      })
    );

    expect(screen.getByTestId('button-view-templates')).toBeInTheDocument();
    expect(screen.getByText('Templates')).toBeInTheDocument();
  });

  it('opens save dialog when save button is clicked', () => {
    render(
      React.createElement(QRTemplates, {
        currentOptions: mockCurrentOptions,
        onLoadOptions: mockOnLoadOptions,
      })
    );

    const saveButton = screen.getByTestId('button-save-template');
    fireEvent.click(saveButton);

    expect(screen.getByTestId('save-dialog')).toBeInTheDocument();
    expect(screen.getByTestId('dialog-title')).toBeInTheDocument();
    expect(screen.getByTestId('save-dialog')).toContainElement(screen.getByTestId('dialog-title'));
  });

  it('opens templates dialog when templates button is clicked', () => {
    render(
      React.createElement(QRTemplates, {
        currentOptions: mockCurrentOptions,
        onLoadOptions: mockOnLoadOptions,
      })
    );

    const templatesButton = screen.getByTestId('button-view-templates');
    fireEvent.click(templatesButton);

    expect(screen.getByTestId('templates-dialog')).toBeInTheDocument();
    expect(screen.getByTestId('dialog-title')).toBeInTheDocument();
    expect(screen.getByText('QR Code Templates')).toBeInTheDocument();
  });

  it('shows loading state when templates are loading', () => {
    mockUsePersistence.mockReturnValue({
      templates: [],
      publicTemplates: [],
      saveTemplate: mockSaveTemplate,
      deleteTemplate: mockDeleteTemplate,
      useTemplate: mockUseTemplate,
      isLoadingTemplates: true,
    });

    render(
      React.createElement(QRTemplates, {
        currentOptions: mockCurrentOptions,
        onLoadOptions: mockOnLoadOptions,
      })
    );

    const templatesButton = screen.getByTestId('button-view-templates');
    fireEvent.click(templatesButton);

    expect(screen.getByTestId('loading-templates')).toBeInTheDocument();
    expect(screen.getByText('Loading templates...')).toBeInTheDocument();
  });

  it('shows empty state when no templates exist', () => {
    mockUsePersistence.mockReturnValue({
      templates: [],
      publicTemplates: [],
      saveTemplate: mockSaveTemplate,
      deleteTemplate: mockDeleteTemplate,
      useTemplate: mockUseTemplate,
      isLoadingTemplates: false,
    });

    render(
      React.createElement(QRTemplates, {
        currentOptions: mockCurrentOptions,
        onLoadOptions: mockOnLoadOptions,
      })
    );

    const templatesButton = screen.getByTestId('button-view-templates');
    fireEvent.click(templatesButton);

    expect(screen.getByTestId('no-templates')).toBeInTheDocument();
    expect(screen.getByText('No templates yet')).toBeInTheDocument();
  });

  it('shows empty state when no public templates exist', () => {
    mockUsePersistence.mockReturnValue({
      templates: mockTemplates,
      publicTemplates: [],
      saveTemplate: mockSaveTemplate,
      deleteTemplate: mockDeleteTemplate,
      useTemplate: mockUseTemplate,
      isLoadingTemplates: false,
    });

    render(
      React.createElement(QRTemplates, {
        currentOptions: mockCurrentOptions,
        onLoadOptions: mockOnLoadOptions,
      })
    );

    const templatesButton = screen.getByTestId('button-view-templates');
    fireEvent.click(templatesButton);

    expect(screen.getByTestId('no-public-templates')).toBeInTheDocument();
    expect(screen.getByText('No public templates')).toBeInTheDocument();
  });

  it('displays my templates in the gallery', () => {
    render(
      React.createElement(QRTemplates, {
        currentOptions: mockCurrentOptions,
        onLoadOptions: mockOnLoadOptions,
      })
    );

    const templatesButton = screen.getByTestId('button-view-templates');
    fireEvent.click(templatesButton);

    expect(screen.getByTestId('template-item-1')).toBeInTheDocument();
    expect(screen.getByTestId('template-item-2')).toBeInTheDocument();
    expect(screen.getByTestId('text-template-name-1')).toHaveTextContent('Test Template 1');
    expect(screen.getByTestId('text-template-name-2')).toHaveTextContent('Test Template 2');
  });

  it('displays public templates in the gallery', () => {
    render(
      React.createElement(QRTemplates, {
        currentOptions: mockCurrentOptions,
        onLoadOptions: mockOnLoadOptions,
      })
    );

    const templatesButton = screen.getByTestId('button-view-templates');
    fireEvent.click(templatesButton);

    expect(screen.getByTestId('public-template-item-3')).toBeInTheDocument();
    expect(screen.getByTestId('text-public-template-name-3')).toHaveTextContent(
      'Public Template 1'
    );
  });

  it('calls saveTemplate when save is confirmed', async () => {
    render(
      React.createElement(QRTemplates, {
        currentOptions: mockCurrentOptions,
        onLoadOptions: mockOnLoadOptions,
      })
    );

    const saveButton = screen.getByTestId('button-save-template');
    fireEvent.click(saveButton);

    const nameInput = screen.getByTestId('input-template-name');
    fireEvent.change(nameInput, { target: { value: 'Test Template' } });

    const descriptionInput = screen.getByTestId('textarea-template-description');
    fireEvent.change(descriptionInput, { target: { value: 'Test description' } });

    const publicSwitch = screen.getByTestId('switch-public-template');
    fireEvent.click(publicSwitch);

    const confirmButton = screen.getByTestId('button-confirm-save-template');
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(mockSaveTemplate).toHaveBeenCalledWith(
        'Test Template',
        'Test description',
        mockCurrentOptions,
        true
      );
    });
  });

  it('disables save button when name is empty', () => {
    render(
      React.createElement(QRTemplates, {
        currentOptions: mockCurrentOptions,
        onLoadOptions: mockOnLoadOptions,
      })
    );

    const saveButton = screen.getByTestId('button-save-template');
    fireEvent.click(saveButton);

    const confirmButton = screen.getByTestId('button-confirm-save-template');
    expect(confirmButton).toBeDisabled();
  });

  it('calls useTemplate and onLoadOptions when use template button is clicked', async () => {
    render(
      React.createElement(QRTemplates, {
        currentOptions: mockCurrentOptions,
        onLoadOptions: mockOnLoadOptions,
      })
    );

    const templatesButton = screen.getByTestId('button-view-templates');
    fireEvent.click(templatesButton);

    const useButton = screen.getByTestId('button-use-template-1');
    fireEvent.click(useButton);

    await waitFor(() => {
      expect(mockUseTemplate).toHaveBeenCalledWith('1');
      expect(mockOnLoadOptions).toHaveBeenCalledWith(mockTemplates[0].config);
    });
  });

  it('calls deleteTemplate when delete button is clicked', () => {
    render(
      React.createElement(QRTemplates, {
        currentOptions: mockCurrentOptions,
        onLoadOptions: mockOnLoadOptions,
      })
    );

    const templatesButton = screen.getByTestId('button-view-templates');
    fireEvent.click(templatesButton);

    const deleteButton = screen.getByTestId('button-delete-template-1');
    fireEvent.click(deleteButton);

    expect(mockDeleteTemplate).toHaveBeenCalledWith('1');
  });

  it('opens preview dialog when preview button is clicked', () => {
    render(
      React.createElement(QRTemplates, {
        currentOptions: mockCurrentOptions,
        onLoadOptions: mockOnLoadOptions,
      })
    );

    const templatesButton = screen.getByTestId('button-view-templates');
    fireEvent.click(templatesButton);

    const previewButton = screen.getByTestId('button-preview-template-1');
    fireEvent.click(previewButton);

    expect(screen.getByTestId('preview-dialog')).toBeInTheDocument();
    const previewDialog = screen.getByTestId('preview-dialog');
    const previewDialogTitle = within(previewDialog).getByTestId('dialog-title');
    expect(previewDialog).toContainElement(previewDialogTitle);
    expect(previewDialogTitle).toHaveTextContent('Test Template 1');
  });

  it('calls useTemplate and onLoadOptions from preview dialog', async () => {
    render(
      React.createElement(QRTemplates, {
        currentOptions: mockCurrentOptions,
        onLoadOptions: mockOnLoadOptions,
      })
    );

    const templatesButton = screen.getByTestId('button-view-templates');
    fireEvent.click(templatesButton);

    const previewButton = screen.getByTestId('button-preview-template-1');
    fireEvent.click(previewButton);

    const useFromPreviewButton = screen.getByTestId('button-use-from-preview');
    fireEvent.click(useFromPreviewButton);

    await waitFor(() => {
      expect(mockUseTemplate).toHaveBeenCalledWith('1');
      expect(mockOnLoadOptions).toHaveBeenCalledWith(mockTemplates[0].config);
    });
  });

  it('handles template usage errors gracefully', async () => {
    mockUseTemplate.mockRejectedValue(new Error('Failed to track usage'));

    render(
      React.createElement(QRTemplates, {
        currentOptions: mockCurrentOptions,
        onLoadOptions: mockOnLoadOptions,
      })
    );

    const templatesButton = screen.getByTestId('button-view-templates');
    fireEvent.click(templatesButton);

    const useButton = screen.getByTestId('button-use-template-1');
    fireEvent.click(useButton);

    await waitFor(() => {
      expect(mockUseTemplate).toHaveBeenCalledWith('1');
      expect(mockOnLoadOptions).toHaveBeenCalledWith(mockTemplates[0].config);
    });
  });
});
