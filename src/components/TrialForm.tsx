import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { projectId } from '../utils/supabase/info';
import { ArrowLeft, Send, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';
import { AlertCircle } from 'lucide-react';

interface TrialFormProps {
  accessToken: string;
  onBack: () => void;
  onSubmitSuccess: (trialId: string) => void;
  onShowTerms: () => void;
}

export function TrialForm({ accessToken, onBack, onSubmitSuccess, onShowTerms }: TrialFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    // Medical Professional Information
    legalName: '',
    birthDate: '',
    placeOfEmployment: '',
    licenseReceived: '',
    degree: '',
    
    // Clinical Trial Information
    studyTitle: '',
    researchQuestion: '',
    backgroundRationale: '',
    studyPhase: '',
    studySize: ''
  });

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-f5a2c76d/trials`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
          },
          body: JSON.stringify(formData)
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit trial');
      }

      onSubmitSuccess(data.trialId);
    } catch (err: any) {
      console.error('Error submitting trial:', err);
      setError(err.message || 'Failed to submit trial for assessment');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Button variant="ghost" onClick={onBack} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>

        <div className="mb-8">
          <h1 className="text-3xl text-gray-900 mb-2">New Clinical Trial Assessment</h1>
          <p className="text-gray-600">Complete the form below to receive an AI-powered feasibility assessment</p>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Medical Professional Information */}
          <Card>
            <CardHeader>
              <CardTitle>Medical Professional Information</CardTitle>
              <CardDescription>Your credentials and professional details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="legalName">Legal Name *</Label>
                <Input
                  id="legalName"
                  placeholder="Dr. Jane Smith"
                  value={formData.legalName}
                  onChange={(e) => handleChange('legalName', e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="birthDate">Birth Date *</Label>
                  <Input
                    id="birthDate"
                    type="date"
                    value={formData.birthDate}
                    onChange={(e) => handleChange('birthDate', e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="licenseReceived">License Received *</Label>
                  <Input
                    id="licenseReceived"
                    type="date"
                    value={formData.licenseReceived}
                    onChange={(e) => handleChange('licenseReceived', e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="placeOfEmployment">Place of Employment *</Label>
                  <Input
                    id="placeOfEmployment"
                    placeholder="City General Hospital"
                    value={formData.placeOfEmployment}
                    onChange={(e) => handleChange('placeOfEmployment', e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="degree">Degree *</Label>
                  <Input
                    id="degree"
                    placeholder="MD, PhD, etc."
                    value={formData.degree}
                    onChange={(e) => handleChange('degree', e.target.value)}
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Clinical Trial Information */}
          <Card>
            <CardHeader>
              <CardTitle>Clinical Trial Information</CardTitle>
              <CardDescription>Details about your proposed clinical trial</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="studyTitle">Study Title *</Label>
                <Input
                  id="studyTitle"
                  placeholder="A Phase II Study of..."
                  value={formData.studyTitle}
                  onChange={(e) => handleChange('studyTitle', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="researchQuestion">Research Question/Hypothesis *</Label>
                <Textarea
                  id="researchQuestion"
                  placeholder="What is the primary research question your trial aims to answer?"
                  value={formData.researchQuestion}
                  onChange={(e) => handleChange('researchQuestion', e.target.value)}
                  required
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="backgroundRationale">Background and Rationale *</Label>
                <Textarea
                  id="backgroundRationale"
                  placeholder="Provide the scientific background and rationale for your study..."
                  value={formData.backgroundRationale}
                  onChange={(e) => handleChange('backgroundRationale', e.target.value)}
                  required
                  rows={6}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="studyPhase">Study Phase *</Label>
                  <Select value={formData.studyPhase} onValueChange={(value) => handleChange('studyPhase', value)} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select phase" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Phase 1">Phase 1</SelectItem>
                      <SelectItem value="Phase 2">Phase 2</SelectItem>
                      <SelectItem value="Phase 3">Phase 3</SelectItem>
                      <SelectItem value="Phase 4">Phase 4</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="studySize">Study Size (Number of Participants) *</Label>
                  <Input
                    id="studySize"
                    type="number"
                    placeholder="e.g., 200"
                    value={formData.studySize}
                    onChange={(e) => handleChange('studySize', e.target.value)}
                    required
                    min="1"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Terms of Service Link */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-6">
              <p className="text-sm text-gray-700 mb-2">
                By submitting this form, you agree to our{' '}
                <button
                  type="button"
                  onClick={onShowTerms}
                  className="text-blue-600 hover:text-blue-800 underline"
                >
                  Terms of Service
                </button>
              </p>
              <p className="text-xs text-gray-600">
                Your trial will be analyzed by AI systems validated by medical professionals, 
                financial advisors, and administrators. Results include a feasibility score (1-100) 
                where 75% is the minimum threshold for proceeding with submission to medical councils.
              </p>
            </CardContent>
          </Card>

          <div className="flex gap-4 justify-end">
            <Button type="button" variant="outline" onClick={onBack} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing Trial...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Submit for Assessment
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
