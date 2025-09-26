import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Bookmark,
  Save,
  Download,
  Trash2,
  Eye,
  Calendar,
  Users,
  Layout,
  ExternalLink,
  Heart,
  Star,
  Globe,
  Lock,
} from 'lucide-react';
import { usePersistence } from '@/contexts/PersistenceContext';
import { formatDistanceToNow } from 'date-fns';
import type { QRCodeOptions } from '@/components/QRCodePreview';

interface QRTemplatesProps {
  currentOptions: QRCodeOptions;
  onLoadOptions: (options: QRCodeOptions) => void;
}

export default function QRTemplates({ currentOptions, onLoadOptions }: QRTemplatesProps) {
  const {
    templates,
    publicTemplates,
    saveTemplate,
    deleteTemplate,
    useTemplate,
    isLoadingTemplates,
  } = usePersistence();

  const [isOpen, setIsOpen] = useState(false);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [templateDescription, setTemplateDescription] = useState('');
  const [isPublicTemplate, setIsPublicTemplate] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<(typeof templates)[0] | null>(null);

  const handleSave = async () => {
    if (!templateName.trim()) return;

    try {
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
    } catch (error) {
      console.error('Failed to save template:', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteTemplate(id);
    } catch (error) {
      console.error('Failed to delete template:', error);
    }
  };

  const handleUseTemplate = async (template: (typeof templates)[0]) => {
    try {
      // Track usage for analytics
      // eslint-disable-next-line react-hooks/rules-of-hooks
      await useTemplate(template.id);
      // Load the template configuration
      onLoadOptions(template.config);
      setIsOpen(false);
    } catch (error) {
      console.error('Failed to use template:', error);
      // Still load the template even if tracking fails
      onLoadOptions(template.config);
      setIsOpen(false);
    }
  };

  const getContentType = (data: string) => {
    if (data.startsWith('http://') || data.startsWith('https://')) return 'URL';
    if (data.startsWith('WIFI:')) return 'WiFi';
    if (data.startsWith('BEGIN:VCARD')) return 'vCard';
    if (data.startsWith('mailto:')) return 'Email';
    return 'Text';
  };

  const getDataPreview = (data: string) => {
    if (data.length <= 50) return data;
    return data.substring(0, 47) + '...';
  };

  return (
    <>
      {/* Save Template Dialog */}
      <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2" data-testid="button-save-template">
            <Bookmark className="w-4 h-4" />
            Save as Template
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Save Template</DialogTitle>
            <DialogDescription>
              Save your current QR code configuration as a reusable template.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="template-name">Template Name</Label>
              <Input
                id="template-name"
                value={templateName}
                onChange={e => setTemplateName(e.target.value)}
                placeholder="Enter a name for this template"
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSave()}
                data-testid="input-template-name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="template-description">Description (Optional)</Label>
              <Textarea
                id="template-description"
                value={templateDescription}
                onChange={e => setTemplateDescription(e.target.value)}
                placeholder="Describe this template..."
                rows={3}
                data-testid="textarea-template-description"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="public-template"
                checked={isPublicTemplate}
                onCheckedChange={setIsPublicTemplate}
                data-testid="switch-public-template"
              />
              <Label htmlFor="public-template" className="text-sm">
                Make this template public for others to use
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSaveDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={!templateName.trim()}
              data-testid="button-confirm-save-template"
            >
              Save Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Templates Gallery Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2" data-testid="button-view-templates">
            <Layout className="w-4 h-4" />
            Templates
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>QR Code Templates</DialogTitle>
            <DialogDescription>Browse and use pre-designed QR code templates.</DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="my-templates" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="my-templates" data-testid="tab-my-templates">
                My Templates ({templates.length})
              </TabsTrigger>
              <TabsTrigger value="public-templates" data-testid="tab-public-templates">
                Public Templates ({publicTemplates.length})
              </TabsTrigger>
            </TabsList>

            {/* My Templates */}
            <TabsContent value="my-templates">
              <ScrollArea className="h-[400px] pr-4">
                {isLoadingTemplates ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="text-sm text-muted-foreground">Loading templates...</div>
                  </div>
                ) : templates.length === 0 ? (
                  <div className="text-center py-8">
                    <Layout className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">No templates yet</h3>
                    <p className="text-sm text-muted-foreground">
                      Save your first template to see it here.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {templates.map(template => (
                      <Card key={template.id} className="hover-elevate">
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div className="space-y-1 flex-1">
                              <CardTitle
                                className="text-base"
                                data-testid={`text-template-name-${template.id}`}
                              >
                                {template.name}
                              </CardTitle>
                              {template.description && (
                                <CardDescription className="text-xs">
                                  {template.description}
                                </CardDescription>
                              )}
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Calendar className="w-3 h-3" />
                                <span data-testid={`text-template-date-${template.id}`}>
                                  {formatDistanceToNow(new Date(template.updatedAt), {
                                    addSuffix: true,
                                  })}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {template.isPublic && (
                                <Badge variant="secondary" className="text-xs gap-1">
                                  <Globe className="w-3 h-3" />
                                  Public
                                </Badge>
                              )}
                              <Badge variant="outline" className="text-xs gap-1">
                                <Star className="w-3 h-3" />
                                {template.usageCount}
                              </Badge>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="space-y-3">
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                onClick={() => handleUseTemplate(template)}
                                className="gap-2 flex-1"
                                data-testid={`button-use-template-${template.id}`}
                              >
                                <ExternalLink className="w-3 h-3" />
                                Use Template
                              </Button>

                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setSelectedTemplate(template)}
                                className="gap-2"
                                data-testid={`button-preview-template-${template.id}`}
                              >
                                <Eye className="w-3 h-3" />
                                Preview
                              </Button>

                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="gap-2 text-destructive hover:text-destructive"
                                    data-testid={`button-delete-template-${template.id}`}
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Template</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete "{template.name}"? This action
                                      cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleDelete(template.id)}
                                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </TabsContent>

            {/* Public Templates */}
            <TabsContent value="public-templates">
              <ScrollArea className="h-[400px] pr-4">
                {publicTemplates.length === 0 ? (
                  <div className="text-center py-8">
                    <Globe className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">No public templates</h3>
                    <p className="text-sm text-muted-foreground">
                      Be the first to share a template with the community!
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {publicTemplates.map(template => (
                      <Card key={template.id} className="hover-elevate">
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div className="space-y-1 flex-1">
                              <CardTitle
                                className="text-base"
                                data-testid={`text-public-template-name-${template.id}`}
                              >
                                {template.name}
                              </CardTitle>
                              {template.description && (
                                <CardDescription className="text-xs">
                                  {template.description}
                                </CardDescription>
                              )}
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Users className="w-3 h-3" />
                                <span>Public template</span>
                              </div>
                            </div>
                            <Badge variant="outline" className="text-xs gap-1">
                              <Star className="w-3 h-3" />
                              {template.usageCount}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="space-y-3">
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                onClick={() => handleUseTemplate(template)}
                                className="gap-2 flex-1"
                                data-testid={`button-use-public-template-${template.id}`}
                              >
                                <Download className="w-3 h-3" />
                                Use Template
                              </Button>

                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setSelectedTemplate(template)}
                                className="gap-2"
                                data-testid={`button-preview-public-template-${template.id}`}
                              >
                                <Eye className="w-3 h-3" />
                                Preview
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Template Preview Dialog */}
      {selectedTemplate && (
        <Dialog open={!!selectedTemplate} onOpenChange={() => setSelectedTemplate(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{selectedTemplate.name}</DialogTitle>
              <DialogDescription>Template Preview</DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {selectedTemplate.description && (
                <div>
                  <h4 className="text-sm font-medium mb-1">Description</h4>
                  <p className="text-sm text-muted-foreground">{selectedTemplate.description}</p>
                </div>
              )}

              <div className="flex justify-center py-4">
                <div
                  className="border rounded-lg p-4 bg-muted/20"
                  style={{
                    width: selectedTemplate.config.width,
                    height: selectedTemplate.config.height,
                  }}
                >
                  {/* QR code would be rendered here - for now showing placeholder */}
                  <div className="w-full h-full bg-white border-2 border-dashed border-muted-foreground/20 flex items-center justify-center">
                    <Layout className="w-8 h-8 text-muted-foreground" />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Usage Count:</span>
                  <Badge variant="outline">{selectedTemplate.usageCount}</Badge>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Visibility:</span>
                  <Badge
                    variant={selectedTemplate.isPublic ? 'secondary' : 'outline'}
                    className="gap-1"
                  >
                    {selectedTemplate.isPublic ? (
                      <Globe className="w-3 h-3" />
                    ) : (
                      <Lock className="w-3 h-3" />
                    )}
                    {selectedTemplate.isPublic ? 'Public' : 'Private'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Created:</span>
                  <span>
                    {formatDistanceToNow(new Date(selectedTemplate.createdAt), { addSuffix: true })}
                  </span>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedTemplate(null)}>
                Close
              </Button>
              <Button
                onClick={() => handleUseTemplate(selectedTemplate)}
                data-testid="button-use-from-preview"
              >
                Use This Template
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
