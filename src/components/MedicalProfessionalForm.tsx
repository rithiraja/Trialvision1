import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { ArrowLeft, ArrowRight, AlertCircle } from 'lucide-react';

interface MedicalProfessionalFormProps {
  onBack: () => void;
  onNext: (data: any) => void;
  initialData?: any;
}

export function MedicalProfessionalForm({ onBack, onNext, initialData }: MedicalProfessionalFormProps) {
  const [formData, setFormData] = useState({
    legalName: initialData?.legalName || '',
    birthDate: initialData?.birthDate || '',
    placeOfEmployment: initialData?.placeOfEmployment || '',
    licenseReceived: initialData?.licenseReceived || '',
    degree: initialData?.degree || '',
  });

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext(formData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Button variant="ghost" onClick={onBack} className="mb-6 text-green-700 hover:text-green-900 hover:bg-green-100">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>

        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl text-gray-900 mb-2">New Clinical Trial Assessment</h1>
              <p className="text-gray-600">Step 1 of 2: Medical Professional Information</p>
            </div>
            <div className="flex gap-2">
              <div className="w-12 h-2 bg-green-600 rounded"></div>
              <div className="w-12 h-2 bg-gray-300 rounded"></div>
            </div>
          </div>
        </div>

        {initialData && (
          <Alert className="mb-6 border-blue-200 bg-blue-50">
            <AlertCircle className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-900">
              <strong>Document Parsed Successfully!</strong> This form has been pre-filled with data extracted from your uploaded document. 
              Please review all fields and complete any missing information before proceeding.
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card className="border-green-200">
            <CardHeader className="bg-green-50">
              <CardTitle className="text-green-900">Medical Professional Information</CardTitle>
              <CardDescription>Your credentials and professional details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div className="space-y-2">
                <Label htmlFor="legalName" className="text-gray-700">Legal Name *</Label>
                <Input
                  id="legalName"
                  placeholder="Dr. Jane Smith"
                  value={formData.legalName}
                  onChange={(e) => handleChange('legalName', e.target.value)}
                  required
                  className="border-green-200 focus:border-green-500 focus:ring-green-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="birthDate" className="text-gray-700">Birth Date *</Label>
                  <Input
                    id="birthDate"
                    type="date"
                    value={formData.birthDate}
                    onChange={(e) => handleChange('birthDate', e.target.value)}
                    required
                    className="border-green-200 focus:border-green-500 focus:ring-green-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="licenseReceived" className="text-gray-700">License Received *</Label>
                  <Input
                    id="licenseReceived"
                    type="date"
                    value={formData.licenseReceived}
                    onChange={(e) => handleChange('licenseReceived', e.target.value)}
                    required
                    className="border-green-200 focus:border-green-500 focus:ring-green-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="placeOfEmployment" className="text-gray-700">Place of Employment *</Label>
                  <Input
                    id="placeOfEmployment"
                    placeholder="City General Hospital"
                    value={formData.placeOfEmployment}
                    onChange={(e) => handleChange('placeOfEmployment', e.target.value)}
                    required
                    className="border-green-200 focus:border-green-500 focus:ring-green-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="degree" className="text-gray-700">Degree *</Label>
                  <Input
                    id="degree"
                    placeholder="MD, PhD, etc."
                    value={formData.degree}
                    onChange={(e) => handleChange('degree', e.target.value)}
                    required
                    className="border-green-200 focus:border-green-500 focus:ring-green-500"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-4 justify-end">
            <Button type="button" variant="outline" onClick={onBack} className="border-green-600 text-green-700 hover:bg-green-50">
              Cancel
            </Button>
            <Button type="submit" className="bg-green-700 hover:bg-green-800 text-white">
              Next: Clinical Trial Information
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
