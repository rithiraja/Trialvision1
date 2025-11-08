import { useState } from 'react';
import { Button } from './ui/button';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from './ui/sheet';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Slider } from './ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Accessibility, Type, Contrast, MousePointer, Eye, Volume2 } from 'lucide-react';
import { Separator } from './ui/separator';

export function AccessibilityMenu() {
  const [fontSize, setFontSize] = useState(16);
  const [highContrast, setHighContrast] = useState(false);
  const [largerCursor, setLargerCursor] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [screenReader, setScreenReader] = useState(false);
  const [textSpacing, setTextSpacing] = useState(1);
  const [colorBlindMode, setColorBlindMode] = useState('none');

  const handleFontSizeChange = (value: number[]) => {
    const newSize = value[0];
    setFontSize(newSize);
    document.documentElement.style.setProperty('--font-size', `${newSize}px`);
  };

  const handleHighContrastToggle = (checked: boolean) => {
    setHighContrast(checked);
    if (checked) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }
  };

  const handleLargerCursorToggle = (checked: boolean) => {
    setLargerCursor(checked);
    if (checked) {
      document.documentElement.classList.add('large-cursor');
    } else {
      document.documentElement.classList.remove('large-cursor');
    }
  };

  const handleReduceMotionToggle = (checked: boolean) => {
    setReduceMotion(checked);
    if (checked) {
      document.documentElement.classList.add('reduce-motion');
    } else {
      document.documentElement.classList.remove('reduce-motion');
    }
  };

  const handleTextSpacingChange = (value: number[]) => {
    const spacing = value[0];
    setTextSpacing(spacing);
    document.documentElement.style.setProperty('--text-spacing', `${spacing}`);
  };

  const handleColorBlindModeChange = (value: string) => {
    setColorBlindMode(value);
    // Remove previous mode classes
    document.documentElement.classList.remove('protanopia', 'deuteranopia', 'tritanopia');
    if (value !== 'none') {
      document.documentElement.classList.add(value);
    }
  };

  const resetToDefaults = () => {
    setFontSize(16);
    setHighContrast(false);
    setLargerCursor(false);
    setReduceMotion(false);
    setTextSpacing(1);
    setColorBlindMode('none');
    
    document.documentElement.style.setProperty('--font-size', '16px');
    document.documentElement.style.setProperty('--text-spacing', '1');
    document.documentElement.classList.remove('high-contrast', 'large-cursor', 'reduce-motion', 'protanopia', 'deuteranopia', 'tritanopia');
  };

  return (
    <div className="fixed right-4 top-1/2 -translate-y-1/2 z-50">
      <Sheet>
        <SheetTrigger asChild>
          <Button
            size="lg"
            className="rounded-full w-14 h-14 shadow-lg bg-green-700 hover:bg-green-800 text-white"
            aria-label="Open accessibility menu"
          >
            <Accessibility className="w-6 h-6" />
          </Button>
        </SheetTrigger>
        <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <Accessibility className="w-5 h-5 text-green-700" />
              Accessibility Settings
            </SheetTitle>
            <SheetDescription>
              Customize your experience for better accessibility
            </SheetDescription>
          </SheetHeader>

          <div className="space-y-6 py-6">
            {/* Font Size */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Type className="w-4 h-4 text-green-700" />
                  <Label>Font Size</Label>
                </div>
                <span className="text-sm text-gray-600">{fontSize}px</span>
              </div>
              <Slider
                value={[fontSize]}
                onValueChange={handleFontSizeChange}
                min={12}
                max={24}
                step={1}
                className="w-full"
              />
              <p className="text-xs text-gray-500">Adjust text size across the application</p>
            </div>

            <Separator />

            {/* Text Spacing */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Text Spacing</Label>
                <span className="text-sm text-gray-600">{textSpacing.toFixed(1)}x</span>
              </div>
              <Slider
                value={[textSpacing]}
                onValueChange={handleTextSpacingChange}
                min={1}
                max={2}
                step={0.1}
                className="w-full"
              />
              <p className="text-xs text-gray-500">Increase spacing between lines and letters</p>
            </div>

            <Separator />

            {/* High Contrast */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <Contrast className="w-4 h-4 text-green-700" />
                  <Label>High Contrast Mode</Label>
                </div>
                <p className="text-xs text-gray-500">Enhance color contrast for better visibility</p>
              </div>
              <Switch checked={highContrast} onCheckedChange={handleHighContrastToggle} />
            </div>

            <Separator />

            {/* Color Blind Mode */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-green-700" />
                <Label>Color Blind Mode</Label>
              </div>
              <Select value={colorBlindMode} onValueChange={handleColorBlindModeChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="protanopia">Protanopia (Red-Blind)</SelectItem>
                  <SelectItem value="deuteranopia">Deuteranopia (Green-Blind)</SelectItem>
                  <SelectItem value="tritanopia">Tritanopia (Blue-Blind)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500">Adjust colors for color vision deficiency</p>
            </div>

            <Separator />

            {/* Larger Cursor */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <MousePointer className="w-4 h-4 text-green-700" />
                  <Label>Larger Cursor</Label>
                </div>
                <p className="text-xs text-gray-500">Increase cursor size for easier tracking</p>
              </div>
              <Switch checked={largerCursor} onCheckedChange={handleLargerCursorToggle} />
            </div>

            <Separator />

            {/* Reduce Motion */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Reduce Motion</Label>
                <p className="text-xs text-gray-500">Minimize animations and transitions</p>
              </div>
              <Switch checked={reduceMotion} onCheckedChange={handleReduceMotionToggle} />
            </div>

            <Separator />

            {/* Screen Reader Optimized */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <Volume2 className="w-4 h-4 text-green-700" />
                  <Label>Screen Reader Enhanced</Label>
                </div>
                <p className="text-xs text-gray-500">Optimize experience for screen readers</p>
              </div>
              <Switch checked={screenReader} onCheckedChange={setScreenReader} />
            </div>

            <Separator />

            {/* Reset Button */}
            <Button onClick={resetToDefaults} variant="outline" className="w-full border-green-600 text-green-700 hover:bg-green-50">
              Reset to Defaults
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
