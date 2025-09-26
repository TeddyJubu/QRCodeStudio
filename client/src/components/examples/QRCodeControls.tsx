import { useState } from 'react';
import QRCodeControls from '../QRCodeControls';
import type { QRCodeOptions } from '../QRCodePreview';

export default function QRCodeControlsExample() {
  const [options, setOptions] = useState<QRCodeOptions>({
    data: 'https://example.com',
    width: 300,
    height: 300,
    margin: 10,
    dotsOptions: {
      color: '#6366f1',
      type: 'square' as const,
    },
    backgroundOptions: {
      color: '#ffffff',
    },
    cornersSquareOptions: {
      type: 'square' as const,
      color: '#6366f1',
    },
    cornersDotOptions: {
      type: 'square' as const,
      color: '#6366f1',
    },
  });

  const handleOptionsChange = (newOptions: QRCodeOptions) => {
    console.log('Options changed:', newOptions);
    setOptions(newOptions);
  };

  return <QRCodeControls options={options} onOptionsChange={handleOptionsChange} />;
}
