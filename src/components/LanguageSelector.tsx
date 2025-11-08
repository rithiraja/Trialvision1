import { useState } from 'react';
import { Button } from './ui/button';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from './ui/sheet';
import { Languages, Check } from 'lucide-react';
import { ScrollArea } from './ui/scroll-area';

const languages = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'es', name: 'Spanish', nativeName: 'Español' },
  { code: 'fr', name: 'French', nativeName: 'Français' },
  { code: 'de', name: 'German', nativeName: 'Deutsch' },
  { code: 'zh', name: 'Chinese', nativeName: '中文' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語' },
  { code: 'ko', name: 'Korean', nativeName: '한국어' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano' },
  { code: 'pl', name: 'Polish', nativeName: 'Polski' },
  { code: 'nl', name: 'Dutch', nativeName: 'Nederlands' },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe' },
  { code: 'sv', name: 'Swedish', nativeName: 'Svenska' },
  { code: 'da', name: 'Danish', nativeName: 'Dansk' },
  { code: 'fi', name: 'Finnish', nativeName: 'Suomi' },
  { code: 'no', name: 'Norwegian', nativeName: 'Norsk' },
  { code: 'cs', name: 'Czech', nativeName: 'Čeština' },
];

export function LanguageSelector() {
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [isOpen, setIsOpen] = useState(false);

  const handleLanguageSelect = (code: string) => {
    setSelectedLanguage(code);
    // Store in localStorage for persistence
    localStorage.setItem('preferred-language', code);
    // Here you would typically trigger your translation system
    console.log(`Language changed to: ${code}`);
    setIsOpen(false);
  };

  const currentLanguage = languages.find(lang => lang.code === selectedLanguage);

  return (
    <div className="fixed right-4 top-1/2 translate-y-20 z-50">
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button
            size="lg"
            className="rounded-full w-14 h-14 shadow-lg bg-green-700 hover:bg-green-800 text-white"
            aria-label="Select language"
          >
            <Languages className="w-6 h-6" />
          </Button>
        </SheetTrigger>
        <SheetContent className="w-[400px] sm:w-[540px]">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <Languages className="w-5 h-5 text-green-700" />
              Select Language
            </SheetTitle>
            <SheetDescription>
              Choose your preferred language for the application
            </SheetDescription>
          </SheetHeader>

          <div className="py-6">
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-900">
                Current: <span className="font-semibold">{currentLanguage?.nativeName}</span>
              </p>
            </div>

            <ScrollArea className="h-[500px] pr-4">
              <div className="space-y-2">
                {languages.map((language) => (
                  <button
                    key={language.code}
                    onClick={() => handleLanguageSelect(language.code)}
                    className={`w-full flex items-center justify-between p-3 rounded-lg border transition-colors ${
                      selectedLanguage === language.code
                        ? 'bg-green-50 border-green-600 text-green-900'
                        : 'bg-white border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className="text-left">
                      <p className="font-medium">{language.nativeName}</p>
                      <p className="text-sm text-gray-600">{language.name}</p>
                    </div>
                    {selectedLanguage === language.code && (
                      <Check className="w-5 h-5 text-green-700" />
                    )}
                  </button>
                ))}
              </div>
            </ScrollArea>

            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-xs text-blue-900">
                <strong>Note:</strong> Translation system is currently in development. 
                Your language preference has been saved and will be applied when translations are available.
              </p>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
