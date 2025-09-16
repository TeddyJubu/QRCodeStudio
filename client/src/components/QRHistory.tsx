import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter,
  DialogDescription 
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
import { Label } from '@/components/ui/label';
import { 
  History, 
  Save, 
  Download, 
  Trash2, 
  Eye, 
  Calendar, 
  QrCode,
  ExternalLink 
} from 'lucide-react';
import { usePersistence } from '@/contexts/PersistenceContext';
import { formatDistanceToNow } from 'date-fns';
import type { QRCodeOptions } from '@/components/QRCodePreview';

interface QRHistoryProps {
  currentOptions: QRCodeOptions;
  onLoadOptions: (options: QRCodeOptions) => void;
}

export default function QRHistory({ currentOptions, onLoadOptions }: QRHistoryProps) {
  const { 
    savedQRCodes, 
    saveQRCode, 
    deleteQRCode, 
    isLoadingQRCodes 
  } = usePersistence();
  
  const [isOpen, setIsOpen] = useState(false);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [qrName, setQrName] = useState('');
  const [selectedQR, setSelectedQR] = useState<typeof savedQRCodes[0] | null>(null);

  const handleSave = async () => {
    if (!qrName.trim()) return;
    
    try {
      await saveQRCode(qrName.trim(), currentOptions);
      setQrName('');
      setSaveDialogOpen(false);
    } catch (error) {
      console.error('Failed to save QR code:', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteQRCode(id);
    } catch (error) {
      console.error('Failed to delete QR code:', error);
    }
  };

  const handleLoad = (qrCode: typeof savedQRCodes[0]) => {
    onLoadOptions(qrCode.options);
    setIsOpen(false);
  };

  const getDataPreview = (data: string) => {
    if (data.length <= 50) return data;
    return data.substring(0, 47) + '...';
  };

  const getContentType = (data: string) => {
    if (data.startsWith('http://') || data.startsWith('https://')) return 'URL';
    if (data.startsWith('WIFI:')) return 'WiFi';
    if (data.startsWith('BEGIN:VCARD')) return 'vCard';
    if (data.startsWith('mailto:')) return 'Email';
    return 'Text';
  };

  return (
    <>
      {/* Save Dialog */}
      <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <DialogTrigger asChild>
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-2"
            data-testid="button-save-qr"
          >
            <Save className="w-4 h-4" />
            Save QR Code
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Save QR Code</DialogTitle>
            <DialogDescription>
              Give your QR code a name to save it to your history.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="qr-name">QR Code Name</Label>
            <Input
              id="qr-name"
              value={qrName}
              onChange={(e) => setQrName(e.target.value)}
              placeholder="Enter a name for this QR code"
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
              data-testid="input-qr-name"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSaveDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={!qrName.trim()}
              data-testid="button-confirm-save"
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* History Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-2"
            data-testid="button-view-history"
          >
            <History className="w-4 h-4" />
            History ({savedQRCodes.length})
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>QR Code History</DialogTitle>
            <DialogDescription>
              View and manage your saved QR codes.
            </DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="h-[400px] pr-4">
            {isLoadingQRCodes ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-sm text-muted-foreground">Loading your QR codes...</div>
              </div>
            ) : savedQRCodes.length === 0 ? (
              <div className="text-center py-8">
                <QrCode className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No saved QR codes</h3>
                <p className="text-sm text-muted-foreground">
                  Save your first QR code to see it here.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {savedQRCodes.map((qrCode) => (
                  <Card key={qrCode.id} className="hover-elevate">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1 flex-1">
                          <CardTitle className="text-base" data-testid={`text-qr-name-${qrCode.id}`}>
                            {qrCode.title}
                          </CardTitle>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Calendar className="w-3 h-3" />
                            <span data-testid={`text-qr-date-${qrCode.id}`}>
                              {formatDistanceToNow(new Date(qrCode.updatedAt), { addSuffix: true })}
                            </span>
                          </div>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {getContentType(qrCode.data)}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Content:</p>
                          <p className="text-sm font-mono bg-muted p-2 rounded text-wrap break-all">
                            {getDataPreview(qrCode.data)}
                          </p>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleLoad(qrCode)}
                            className="gap-2 flex-1"
                            data-testid={`button-load-qr-${qrCode.id}`}
                          >
                            <ExternalLink className="w-3 h-3" />
                            Load
                          </Button>
                          
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedQR(qrCode)}
                            className="gap-2"
                            data-testid={`button-preview-qr-${qrCode.id}`}
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
                                data-testid={`button-delete-qr-${qrCode.id}`}
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete QR Code</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "{qrCode.title}"? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(qrCode.id)}
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
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      {selectedQR && (
        <Dialog open={!!selectedQR} onOpenChange={() => setSelectedQR(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{selectedQR.title}</DialogTitle>
              <DialogDescription>
                QR Code Preview
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-center py-4">
              <div 
                className="border rounded-lg p-4 bg-muted/20"
                style={{ 
                  width: selectedQR.options.width, 
                  height: selectedQR.options.height 
                }}
              >
                {/* QR code would be rendered here - for now showing placeholder */}
                <div className="w-full h-full bg-white border-2 border-dashed border-muted-foreground/20 flex items-center justify-center">
                  <QrCode className="w-8 h-8 text-muted-foreground" />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setSelectedQR(null)}
              >
                Close
              </Button>
              <Button 
                onClick={() => handleLoad(selectedQR)}
                data-testid="button-load-from-preview"
              >
                Load This QR Code
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}