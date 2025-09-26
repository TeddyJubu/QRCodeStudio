import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings, Palette, Download, Save } from 'lucide-react';
import { usePersistence } from '@/contexts/PersistenceContext';
import { useTheme } from '@/contexts/ThemeContext';

export default function UserPreferences() {
  const { preferences, updatePreferences, isLoadingPreferences } = usePersistence();
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  // Local state for form values
  const [autoSave, setAutoSave] = useState(preferences?.autoSave ?? true);
  const [defaultDownloadFormat, setDefaultDownloadFormat] = useState(
    preferences?.defaultDownloadFormat ?? 'png'
  );

  // Sync form state when preferences are loaded
  useEffect(() => {
    if (preferences) {
      setAutoSave(preferences.autoSave);
      setDefaultDownloadFormat(preferences.defaultDownloadFormat);
      // Sync theme from server preferences if different from current
      if (preferences.theme !== theme) {
        setTheme(preferences.theme as 'light' | 'dark');
      }
    }
  }, [preferences, theme, setTheme]);

  const handleSave = async () => {
    try {
      await updatePreferences({
        theme: theme,
        autoSave,
        defaultDownloadFormat,
      });
      setIsOpen(false);
    } catch (error) {
      console.error('Failed to save preferences:', error);
    }
  };

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme as 'light' | 'dark');
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2" data-testid="button-user-preferences">
          <Settings className="w-4 h-4" />
          Settings
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>User Preferences</DialogTitle>
          <DialogDescription>Customize your QR code generator experience.</DialogDescription>
        </DialogHeader>

        {isLoadingPreferences ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-sm text-muted-foreground">Loading preferences...</div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Theme Settings */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Palette className="w-4 h-4" />
                  Appearance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="theme-select" className="text-sm">
                      Theme
                    </Label>
                    <Select
                      value={theme}
                      onValueChange={handleThemeChange}
                      data-testid="select-theme"
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">Light</SelectItem>
                        <SelectItem value="dark">Dark</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Download Settings */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  Download
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="format-select" className="text-sm">
                      Default Format
                    </Label>
                    <Select
                      value={defaultDownloadFormat}
                      onValueChange={setDefaultDownloadFormat}
                      data-testid="select-download-format"
                    >
                      <SelectTrigger className="w-20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="png">PNG</SelectItem>
                        <SelectItem value="jpeg">JPEG</SelectItem>
                        <SelectItem value="svg">SVG</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Save Settings */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Save className="w-4 h-4" />
                  Saving
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="auto-save" className="text-sm">
                      Auto-save QR codes
                    </Label>
                    <Switch
                      id="auto-save"
                      checked={autoSave}
                      onCheckedChange={setAutoSave}
                      data-testid="switch-auto-save"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Automatically save QR codes to your history when generated
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isLoadingPreferences}
            data-testid="button-save-preferences"
          >
            Save Preferences
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
