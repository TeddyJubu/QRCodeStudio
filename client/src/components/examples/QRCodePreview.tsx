import QRCodePreview from '../QRCodePreview';

export default function QRCodePreviewExample() {
  const sampleOptions = {
    data: 'https://example.com',
    width: 300,
    height: 300,
    margin: 10,
    dotsOptions: {
      color: '#6366f1',
      type: 'square' as const
    },
    backgroundOptions: {
      color: '#ffffff'
    },
    cornersSquareOptions: {
      type: 'square' as const,
      color: '#6366f1'
    },
    cornersDotOptions: {
      type: 'square' as const,
      color: '#6366f1'
    }
  };

  const handleDownload = (format: 'png' | 'jpeg' | 'svg') => {
    console.log(`Download triggered for format: ${format}`);
  };

  return (
    <QRCodePreview 
      options={sampleOptions}
      onDownload={handleDownload}
    />
  );
}