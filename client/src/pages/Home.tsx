import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import QRCodePreview, { QRCodeOptions } from '@/components/QRCodePreview';
import QRCodeControls from '@/components/QRCodeControls';
import ThemeToggle from '@/components/ThemeToggle';
import { QrCode } from 'lucide-react';

export default function Home() {
  const { toast } = useToast();
  
  const [qrOptions, setQrOptions] = useState<QRCodeOptions>({
    data: 'https://example.com',
    width: 300,
    height: 300,
    margin: 10,
    dotsOptions: {
      color: '#6366f1',
      type: 'square'
    },
    backgroundOptions: {
      color: '#ffffff'
    },
    cornersSquareOptions: {
      type: 'square',
      color: '#6366f1'
    },
    cornersDotOptions: {
      type: 'square',
      color: '#6366f1'
    }
  });

  const handleOptionsChange = useCallback((newOptions: QRCodeOptions) => {
    setQrOptions(newOptions);
  }, []);

  const handleDownload = useCallback((format: 'png' | 'jpeg' | 'svg') => {
    toast({
      title: 'Download Started',
      description: `Your QR code is downloading as ${format.toUpperCase()}.`,
    });
  }, [toast]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 bg-primary text-primary-foreground rounded-lg">
                <QrCode className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-foreground">QR Code Generator</h1>
                <p className="text-sm text-muted-foreground">Create custom QR codes instantly</p>
              </div>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Controls */}
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-24">
              <QRCodeControls 
                options={qrOptions}
                onOptionsChange={handleOptionsChange}
              />
            </div>
          </div>
          
          {/* Right Column - Preview */}
          <div className="lg:col-span-2">
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-medium text-foreground mb-2">Live Preview</h2>
                <p className="text-sm text-muted-foreground">
                  Your QR code updates automatically as you make changes
                </p>
              </div>
              
              <QRCodePreview 
                options={qrOptions}
                onDownload={handleDownload}
              />
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-sm text-muted-foreground">
            <p>Built with ❤️ using React, TypeScript, and qr-code-styling</p>
          </div>
        </div>
      </footer>
    </div>
  );
}