import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, Upload, X } from 'lucide-react';
import type { QRCodeOptions } from './QRCodePreview';

interface QRCodeControlsProps {
  options: QRCodeOptions;
  onOptionsChange: (options: QRCodeOptions) => void;
}

type ContentType = 'url' | 'text' | 'wifi' | 'vcard' | 'email';

export default function QRCodeControls({ options, onOptionsChange }: QRCodeControlsProps) {
  const [contentType, setContentType] = useState<ContentType>('url');
  const [useGradient, setUseGradient] = useState(false);
  const [stylingOpen, setStylingOpen] = useState(true);
  const [logoOpen, setLogoOpen] = useState(false);
  
  // Content form states
  const [urlText, setUrlText] = useState('https://example.com');
  const [plainText, setPlainText] = useState('Hello World!');
  const [wifiData, setWifiData] = useState({
    ssid: '',
    password: '',
    encryption: 'WPA'
  });
  const [vcardData, setVcardData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: ''
  });
  const [emailData, setEmailData] = useState({
    email: '',
    subject: '',
    body: ''
  });

  const generateQRData = () => {
    switch (contentType) {
      case 'url':
      case 'text':
        return contentType === 'url' ? urlText : plainText;
      case 'wifi':
        return `WIFI:T:${wifiData.encryption};S:${wifiData.ssid};P:${wifiData.password};;`;
      case 'vcard':
        return `BEGIN:VCARD\nVERSION:3.0\nFN:${vcardData.firstName} ${vcardData.lastName}\nTEL:${vcardData.phone}\nEMAIL:${vcardData.email}\nEND:VCARD`;
      case 'email':
        return `mailto:${emailData.email}?subject=${encodeURIComponent(emailData.subject)}&body=${encodeURIComponent(emailData.body)}`;
      default:
        return urlText;
    }
  };

  const updateQRData = () => {
    const newData = generateQRData();
    onOptionsChange({ ...options, data: newData });
  };

  const updateColor = (path: string, value: string) => {
    const newOptions = { ...options };
    const keys = path.split('.');
    let current: any = newOptions;
    
    for (let i = 0; i < keys.length - 1; i++) {
      current = current[keys[i]];
    }
    current[keys[keys.length - 1]] = value;
    
    onOptionsChange(newOptions);
  };

  const updateGradient = () => {
    const newOptions = { ...options };
    if (useGradient) {
      newOptions.dotsOptions.gradient = {
        type: 'linear',
        rotation: 0,
        colorStops: [
          { offset: 0, color: '#6366f1' },
          { offset: 1, color: '#8b5cf6' }
        ]
      };
    } else {
      delete newOptions.dotsOptions.gradient;
    }
    onOptionsChange(newOptions);
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const newOptions = { 
          ...options, 
          image: e.target?.result as string,
          imageOptions: { crossOrigin: 'anonymous' as const, margin: 10 }
        };
        onOptionsChange(newOptions);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeLogo = () => {
    const newOptions = { ...options };
    delete newOptions.image;
    delete newOptions.imageOptions;
    onOptionsChange(newOptions);
  };

  // Auto-update QR data when content changes
  const handleContentChange = (value: string, field?: string) => {
    if (contentType === 'url') {
      setUrlText(value);
    } else if (contentType === 'text') {
      setPlainText(value);
    } else if (contentType === 'wifi' && field) {
      setWifiData(prev => ({ ...prev, [field]: value }));
    } else if (contentType === 'vcard' && field) {
      setVcardData(prev => ({ ...prev, [field]: value }));
    } else if (contentType === 'email' && field) {
      setEmailData(prev => ({ ...prev, [field]: value }));
    }
    
    // Update with a small delay to avoid too many updates
    setTimeout(updateQRData, 100);
  };

  return (
    <div className="space-y-4">
      {/* Content Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Content</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Tabs value={contentType} onValueChange={(value) => {
            setContentType(value as ContentType);
            setTimeout(updateQRData, 100);
          }}>
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="url" data-testid="tab-url">URL</TabsTrigger>
              <TabsTrigger value="text" data-testid="tab-text">Text</TabsTrigger>
              <TabsTrigger value="wifi" data-testid="tab-wifi">WiFi</TabsTrigger>
              <TabsTrigger value="vcard" data-testid="tab-vcard">vCard</TabsTrigger>
              <TabsTrigger value="email" data-testid="tab-email">Email</TabsTrigger>
            </TabsList>
            
            <TabsContent value="url" className="space-y-2">
              <Label htmlFor="url-input">Website URL</Label>
              <Input
                id="url-input"
                placeholder="https://example.com"
                value={urlText}
                onChange={(e) => handleContentChange(e.target.value)}
                data-testid="input-url"
              />
            </TabsContent>
            
            <TabsContent value="text" className="space-y-2">
              <Label htmlFor="text-input">Plain Text</Label>
              <Textarea
                id="text-input"
                placeholder="Enter any text..."
                value={plainText}
                onChange={(e) => handleContentChange(e.target.value)}
                data-testid="input-text"
              />
            </TabsContent>
            
            <TabsContent value="wifi" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="wifi-ssid">Network Name (SSID)</Label>
                <Input
                  id="wifi-ssid"
                  placeholder="My WiFi Network"
                  value={wifiData.ssid}
                  onChange={(e) => handleContentChange(e.target.value, 'ssid')}
                  data-testid="input-wifi-ssid"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="wifi-password">Password</Label>
                <Input
                  id="wifi-password"
                  type="password"
                  placeholder="WiFi Password"
                  value={wifiData.password}
                  onChange={(e) => handleContentChange(e.target.value, 'password')}
                  data-testid="input-wifi-password"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="wifi-encryption">Encryption</Label>
                <Select value={wifiData.encryption} onValueChange={(value) => handleContentChange(value, 'encryption')}>
                  <SelectTrigger data-testid="select-wifi-encryption">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="WPA">WPA/WPA2</SelectItem>
                    <SelectItem value="WEP">WEP</SelectItem>
                    <SelectItem value="nopass">None</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>
            
            <TabsContent value="vcard" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="vcard-firstname">First Name</Label>
                  <Input
                    id="vcard-firstname"
                    placeholder="John"
                    value={vcardData.firstName}
                    onChange={(e) => handleContentChange(e.target.value, 'firstName')}
                    data-testid="input-vcard-firstname"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="vcard-lastname">Last Name</Label>
                  <Input
                    id="vcard-lastname"
                    placeholder="Doe"
                    value={vcardData.lastName}
                    onChange={(e) => handleContentChange(e.target.value, 'lastName')}
                    data-testid="input-vcard-lastname"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="vcard-phone">Phone</Label>
                <Input
                  id="vcard-phone"
                  placeholder="+1234567890"
                  value={vcardData.phone}
                  onChange={(e) => handleContentChange(e.target.value, 'phone')}
                  data-testid="input-vcard-phone"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="vcard-email">Email</Label>
                <Input
                  id="vcard-email"
                  type="email"
                  placeholder="john@example.com"
                  value={vcardData.email}
                  onChange={(e) => handleContentChange(e.target.value, 'email')}
                  data-testid="input-vcard-email"
                />
              </div>
            </TabsContent>
            
            <TabsContent value="email" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email-to">Email Address</Label>
                <Input
                  id="email-to"
                  type="email"
                  placeholder="recipient@example.com"
                  value={emailData.email}
                  onChange={(e) => handleContentChange(e.target.value, 'email')}
                  data-testid="input-email-to"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email-subject">Subject</Label>
                <Input
                  id="email-subject"
                  placeholder="Email subject"
                  value={emailData.subject}
                  onChange={(e) => handleContentChange(e.target.value, 'subject')}
                  data-testid="input-email-subject"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email-body">Message</Label>
                <Textarea
                  id="email-body"
                  placeholder="Email message..."
                  value={emailData.body}
                  onChange={(e) => handleContentChange(e.target.value, 'body')}
                  data-testid="input-email-body"
                />
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Styling Section */}
      <Collapsible open={stylingOpen} onOpenChange={setStylingOpen}>
        <Card>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover-elevate">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Styling Options</CardTitle>
                <ChevronDown className={`w-4 h-4 transition-transform ${stylingOpen ? 'rotate-180' : ''}`} />
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="space-y-6">
              {/* Colors */}
              <div className="space-y-4">
                <h3 className="font-medium">Colors</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="foreground-color">Foreground Color</Label>
                    <div className="flex gap-2">
                      <Input
                        id="foreground-color"
                        type="color"
                        value={options.dotsOptions.color}
                        onChange={(e) => updateColor('dotsOptions.color', e.target.value)}
                        className="w-12 h-10 p-1"
                        data-testid="input-foreground-color"
                      />
                      <Input
                        value={options.dotsOptions.color}
                        onChange={(e) => updateColor('dotsOptions.color', e.target.value)}
                        placeholder="#000000"
                        className="flex-1"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="background-color">Background Color</Label>
                    <div className="flex gap-2">
                      <Input
                        id="background-color"
                        type="color"
                        value={options.backgroundOptions.color}
                        onChange={(e) => updateColor('backgroundOptions.color', e.target.value)}
                        className="w-12 h-10 p-1"
                        data-testid="input-background-color"
                      />
                      <Input
                        value={options.backgroundOptions.color}
                        onChange={(e) => updateColor('backgroundOptions.color', e.target.value)}
                        placeholder="#ffffff"
                        className="flex-1"
                      />
                    </div>
                  </div>
                </div>
                
                {/* Gradient Option */}
                <div className="flex items-center space-x-2">
                  <Switch
                    id="use-gradient"
                    checked={useGradient}
                    onCheckedChange={(checked) => {
                      setUseGradient(checked);
                      setTimeout(updateGradient, 100);
                    }}
                    data-testid="switch-gradient"
                  />
                  <Label htmlFor="use-gradient">Use gradient for dots</Label>
                </div>
              </div>

              {/* Dot Style */}
              <div className="space-y-2">
                <Label htmlFor="dot-style">Dot Style</Label>
                <Select 
                  value={options.dotsOptions.type} 
                  onValueChange={(value) => updateColor('dotsOptions.type', value)}
                >
                  <SelectTrigger data-testid="select-dot-style">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="square">Square</SelectItem>
                    <SelectItem value="dots">Dots</SelectItem>
                    <SelectItem value="rounded">Rounded</SelectItem>
                    <SelectItem value="extra-rounded">Extra-rounded</SelectItem>
                    <SelectItem value="classy">Classy</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Corner Styles */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="corner-square-style">Corner Square Style</Label>
                  <Select 
                    value={options.cornersSquareOptions.type} 
                    onValueChange={(value) => updateColor('cornersSquareOptions.type', value)}
                  >
                    <SelectTrigger data-testid="select-corner-square-style">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="square">Square</SelectItem>
                      <SelectItem value="dot">Dot</SelectItem>
                      <SelectItem value="extra-rounded">Extra-rounded</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="corner-dot-style">Corner Dot Style</Label>
                  <Select 
                    value={options.cornersDotOptions.type} 
                    onValueChange={(value) => updateColor('cornersDotOptions.type', value)}
                  >
                    <SelectTrigger data-testid="select-corner-dot-style">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="square">Square</SelectItem>
                      <SelectItem value="dot">Dot</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Logo Section */}
      <Collapsible open={logoOpen} onOpenChange={setLogoOpen}>
        <Card>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover-elevate">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Logo Options</CardTitle>
                <ChevronDown className={`w-4 h-4 transition-transform ${logoOpen ? 'rotate-180' : ''}`} />
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="space-y-4">
              {!options.image ? (
                <div className="space-y-2">
                  <Label htmlFor="logo-upload">Upload Logo</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="logo-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById('logo-upload')?.click()}
                      data-testid="button-upload-logo"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Choose Logo
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Current Logo</Label>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={removeLogo}
                      data-testid="button-remove-logo"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Remove
                    </Button>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="logo-margin">Logo Margin: {options.imageOptions?.margin || 10}px</Label>
                    <Slider
                      id="logo-margin"
                      min={0}
                      max={50}
                      step={1}
                      value={[options.imageOptions?.margin || 10]}
                      onValueChange={([value]) => {
                        const newOptions = {
                          ...options,
                          imageOptions: { 
                            crossOrigin: 'anonymous' as const, 
                            margin: value 
                          }
                        };
                        onOptionsChange(newOptions);
                      }}
                      data-testid="slider-logo-margin"
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>
    </div>
  );
}