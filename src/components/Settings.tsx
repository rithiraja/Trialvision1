import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { ArrowLeft, Settings as SettingsIcon } from 'lucide-react';
import { Switch } from './ui/switch';
import { Label } from './ui/label';

interface SettingsProps {
  onBack: () => void;
}

export function Settings({ onBack }: SettingsProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Button variant="ghost" onClick={onBack} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>

        <div className="mb-8">
          <h1 className="text-3xl text-gray-900 mb-2">Settings</h1>
          <p className="text-gray-600">Manage your account preferences</p>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>Manage how you receive notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="email-notifications" className="flex flex-col gap-1">
                  <span>Email Notifications</span>
                  <span className="text-sm text-gray-500">Receive email updates about your trials</span>
                </Label>
                <Switch id="email-notifications" />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="analysis-complete" className="flex flex-col gap-1">
                  <span>Analysis Complete Alerts</span>
                  <span className="text-sm text-gray-500">Get notified when AI analysis is complete</span>
                </Label>
                <Switch id="analysis-complete" defaultChecked />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Privacy</CardTitle>
              <CardDescription>Control your data and privacy settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="data-sharing" className="flex flex-col gap-1">
                  <span>Anonymous Data Sharing</span>
                  <span className="text-sm text-gray-500">Help improve our AI models</span>
                </Label>
                <Switch id="data-sharing" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Accessibility</CardTitle>
              <CardDescription>Customize your experience</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="high-contrast" className="flex flex-col gap-1">
                  <span>High Contrast Mode</span>
                  <span className="text-sm text-gray-500">Increase color contrast for better visibility</span>
                </Label>
                <Switch id="high-contrast" />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="screen-reader" className="flex flex-col gap-1">
                  <span>Screen Reader Optimization</span>
                  <span className="text-sm text-gray-500">Enhanced support for screen readers</span>
                </Label>
                <Switch id="screen-reader" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
