import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { FileText, Upload, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';
import { projectId } from '../utils/supabase/info';

interface TrialCreationDialogProps {
  open: boolean;
  onClose: () => void;
  onManualEntry: () => void;
  onDocumentParsed: (data: any) => void;
  accessToken: string;
}

export function TrialCreationDialog({ open, onClose, onManualEntry, onDocumentParsed, accessToken }: TrialCreationDialogProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
      if (!validTypes.includes(file.type)) {
        setUploadError('Please upload a PDF, Word document, or text file');
        return;
      }
      
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setUploadError('File size must be less than 10MB');
        return;
      }
      
      setSelectedFile(file);
      setUploadError('');
      setUploadSuccess(false);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setUploadError('Please select a file first');
      return;
    }

    setIsUploading(true);
    setUploadError('');

    try {
      // Convert file to base64
      const reader = new FileReader();
      reader.readAsDataURL(selectedFile);
      
      reader.onload = async () => {
        try {
          const base64Data = reader.result as string;
          
          const response = await fetch(
            `https://${projectId}.supabase.co/functions/v1/make-server-f5a2c76d/parse-trial-document`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
              },
              body: JSON.stringify({
                fileName: selectedFile.name,
                fileData: base64Data,
                fileType: selectedFile.type
              })
            }
          );

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.error || 'Failed to parse document');
          }

          setUploadSuccess(true);
          
          // Wait a moment to show success message
          setTimeout(() => {
            onDocumentParsed(data.extractedData);
            onClose();
          }, 1000);
        } catch (err: any) {
          console.error('Error parsing document:', err);
          setUploadError(err.message || 'Failed to parse document. Please try manual entry.');
        } finally {
          setIsUploading(false);
        }
      };

      reader.onerror = () => {
        setUploadError('Failed to read file');
        setIsUploading(false);
      };
    } catch (err: any) {
      console.error('Error uploading document:', err);
      setUploadError(err.message || 'Failed to upload document');
      setIsUploading(false);
    }
  };

  const handleManualEntry = () => {
    onManualEntry();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Trial Assessment</DialogTitle>
          <DialogDescription>
            Choose how you'd like to create your clinical trial assessment
          </DialogDescription>
        </DialogHeader>

        <div className="grid md:grid-cols-2 gap-4 mt-4">
          {/* Manual Entry Option */}
          <Card className="border-green-200 hover:border-green-400 transition-colors cursor-pointer" onClick={handleManualEntry}>
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 bg-green-100 rounded-lg">
                  <FileText className="w-6 h-6 text-green-700" />
                </div>
                <CardTitle>Manual Entry</CardTitle>
              </div>
              <CardDescription>
                Fill out the complete form manually with your trial details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-gray-700 space-y-2">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Complete control over all fields</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Step-by-step guidance</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Best for new trials</span>
                </li>
              </ul>
              <Button className="w-full mt-4 bg-green-700 hover:bg-green-800">
                Start Manual Entry
              </Button>
            </CardContent>
          </Card>

          {/* Document Upload Option */}
          <Card className="border-green-200">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Upload className="w-6 h-6 text-blue-700" />
                </div>
                <CardTitle>Upload Document</CardTitle>
              </div>
              <CardDescription>
                Upload a trial protocol or research document for auto-fill
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-gray-700 space-y-2 mb-4">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>AI-powered data extraction</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Saves time on data entry</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Review and edit extracted data</span>
                </li>
              </ul>

              <div className="space-y-3">
                <div>
                  <Label htmlFor="file-upload" className="text-sm text-gray-700 mb-2 block">
                    Supported formats: PDF, Word, Text
                  </Label>
                  <Input
                    id="file-upload"
                    type="file"
                    accept=".pdf,.doc,.docx,.txt"
                    onChange={handleFileChange}
                    disabled={isUploading}
                    className="cursor-pointer"
                  />
                </div>

                {selectedFile && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <p className="text-sm font-medium text-green-900">Selected file:</p>
                    <p className="text-sm text-green-700">{selectedFile.name}</p>
                    <p className="text-xs text-green-600">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                )}

                {uploadError && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{uploadError}</AlertDescription>
                  </Alert>
                )}

                {uploadSuccess && (
                  <Alert className="border-green-200 bg-green-50">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800">
                      Document parsed successfully! Loading form...
                    </AlertDescription>
                  </Alert>
                )}

                <Button
                  onClick={handleUpload}
                  disabled={!selectedFile || isUploading || uploadSuccess}
                  className="w-full bg-blue-700 hover:bg-blue-800"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Parsing Document...
                    </>
                  ) : uploadSuccess ? (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Success!
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Parse Document
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-900">
            <strong>Note:</strong> When uploading a document, our AI will extract relevant information and pre-fill 
            the form. You'll be able to review, edit, and complete any missing fields before submission.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
