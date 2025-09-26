import { useRef, useEffect } from 'react';
import QRCodeStyling from 'qr-code-styling';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Download } from 'lucide-react';

export interface QRCodeOptions {
  data: string;
  width: number;
  height: number;
  margin: number;
  dotsOptions: {
    color: string;
    type: 'square' | 'dots' | 'rounded' | 'extra-rounded' | 'classy';
    gradient?: {
      type: 'linear';
      rotation: number;
      colorStops: { offset: number; color: string }[];
    };
  };
  backgroundOptions: {
    color: string;
  };
  cornersSquareOptions: {
    type: 'square' | 'dot' | 'extra-rounded';
    color: string;
  };
  cornersDotOptions: {
    type: 'square' | 'dot';
    color: string;
  };
  imageOptions?: {
    crossOrigin: 'anonymous';
    margin: number;
  };
  image?: string;
  // Dynamic QR code fields
  isDynamic?: boolean;
  destinationUrl?: string;
}

interface QRCodePreviewProps {
  options: QRCodeOptions;
  onDownload: (format: 'png' | 'jpeg' | 'svg') => void;
}

export default function QRCodePreview({ options, onDownload }: QRCodePreviewProps) {
  const ref = useRef<HTMLDivElement>(null);
  const qrCodeRef = useRef<QRCodeStyling | null>(null);

  useEffect(() => {
    if (!ref.current) return;

    // Create new QR code instance
    const qrCode = new QRCodeStyling(options);
    qrCodeRef.current = qrCode;

    // Clear previous QR code
    ref.current.innerHTML = '';
    
    // Append to DOM
    qrCode.append(ref.current);

    return () => {
      if (ref.current) {
        ref.current.innerHTML = '';
      }
    };
  }, [options]);

  const handleDownload = (format: 'png' | 'jpeg' | 'svg') => {
    if (!qrCodeRef.current) return;
    
    qrCodeRef.current.download({
      extension: format,
      name: `qr-code`
    }).catch(console.error);
    
    onDownload(format);
  };

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <div className="flex flex-col items-center space-y-6">
          <div 
            ref={ref} 
            className="flex items-center justify-center min-h-[300px] w-full"
            data-testid="qr-code-display"
          />
          
          <div className="flex flex-wrap gap-2 justify-center">
            <Button 
              onClick={() => handleDownload('png')}
              variant="default"
              size="sm"
              data-testid="button-download-png"
            >
              <Download className="w-4 h-4 mr-2" />
              PNG
            </Button>
            <Button 
              onClick={() => handleDownload('jpeg')}
              variant="outline"
              size="sm"
              data-testid="button-download-jpeg"
            >
              <Download className="w-4 h-4 mr-2" />
              JPEG
            </Button>
            <Button 
              onClick={() => handleDownload('svg')}
              variant="outline"
              size="sm"
              data-testid="button-download-svg"
            >
              <Download className="w-4 h-4 mr-2" />
              SVG
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}