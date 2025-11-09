import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { ArrowLeft, User, Edit, X, Save } from 'lucide-react';
import { projectId } from '../utils/supabase/info';
import { getFreshAccessToken } from '../utils/supabase/auth';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from './ui/alert-dialog';
import { Alert, AlertDescription } from './ui/alert';
import { AlertCircle, CheckCircle } from 'lucide-react';

interface ProfileProps {
  accessToken: string;
  onBack: () => void;
}

export function Profile({ accessToken, onBack }: ProfileProps) {
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState('');

  const [editedData, setEditedData] = useState({
    legalName: '',
    birthDate: '',
    placeOfEmployment: '',
    licenseReceived: '',
    degree: ''
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-f5a2c76d/profile`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );

      const data = await response.json();
      setProfile(data.user);
      
      // Initialize edited data with current values
      setEditedData({
        legalName: data.user?.user_metadata?.legalName || '',
        birthDate: data.user?.user_metadata?.birthDate || '',
        placeOfEmployment: data.user?.user_metadata?.placeOfEmployment || '',
        licenseReceived: data.user?.user_metadata?.licenseReceived || '',
        degree: data.user?.user_metadata?.degree || ''
      });
    } catch (err) {
      console.error('Error loading profile:', err);
      setError('Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setSaveSuccess(false);
    setError('');
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset to original values
    setEditedData({
      legalName: profile?.user_metadata?.legalName || '',
      birthDate: profile?.user_metadata?.birthDate || '',
      placeOfEmployment: profile?.user_metadata?.placeOfEmployment || '',
      licenseReceived: profile?.user_metadata?.licenseReceived || '',
      degree: profile?.user_metadata?.degree || ''
    });
    setError('');
  };

  const handleSaveClick = () => {
    setShowConfirmDialog(true);
  };

  const handleConfirmSave = async () => {
    setShowConfirmDialog(false);
    setIsSaving(true);
    setError('');
    setSaveSuccess(false);

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-f5a2c76d/update-profile`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
          },
          body: JSON.stringify(editedData)
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update profile');
      }

      // Reload profile to get updated data
      await loadProfile();
      setIsEditing(false);
      setSaveSuccess(true);
      
      // Hide success message after 5 seconds
      setTimeout(() => {
        setSaveSuccess(false);
      }, 5000);
    } catch (err: any) {
      console.error('Error updating profile:', err);
      setError(err.message || 'Failed to update profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setEditedData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Button variant="ghost" onClick={onBack} className="mb-6 text-green-700 hover:text-green-900 hover:bg-green-100">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>

        <div className="mb-8">
          <h1 className="text-3xl text-gray-900 mb-2">Profile</h1>
          <p className="text-gray-600">Your professional information</p>
        </div>

        {saveSuccess && (
          <Alert className="mb-6 bg-green-50 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-700" />
            <AlertDescription className="text-green-900">
              Profile updated successfully!
            </AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          </div>
        ) : (
          <Card className="border-green-200">
            <CardHeader className="bg-green-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <User className="w-8 h-8 text-green-700" />
                  <div>
                    <CardTitle className="text-green-900">Medical Professional Information</CardTitle>
                    <CardDescription>Verified account details</CardDescription>
                  </div>
                </div>
                {!isEditing ? (
                  <Button onClick={handleEdit} className="bg-green-700 hover:bg-green-800 text-white">
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={handleCancel} disabled={isSaving} className="border-gray-400 text-gray-700 hover:bg-gray-100">
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                    <Button onClick={handleSaveClick} disabled={isSaving} className="bg-green-700 hover:bg-green-800 text-white">
                      <Save className="w-4 h-4 mr-2" />
                      {isSaving ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              {isEditing ? (
                <div className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="legalName">Legal Name *</Label>
                      <Input
                        id="legalName"
                        value={editedData.legalName}
                        onChange={(e) => handleChange('legalName', e.target.value)}
                        className="border-green-200 focus:border-green-500 focus:ring-green-500"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="birthDate">Birth Date *</Label>
                      <Input
                        id="birthDate"
                        type="date"
                        value={editedData.birthDate}
                        onChange={(e) => handleChange('birthDate', e.target.value)}
                        className="border-green-200 focus:border-green-500 focus:ring-green-500"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="placeOfEmployment">Place of Employment *</Label>
                      <Input
                        id="placeOfEmployment"
                        value={editedData.placeOfEmployment}
                        onChange={(e) => handleChange('placeOfEmployment', e.target.value)}
                        className="border-green-200 focus:border-green-500 focus:ring-green-500"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="licenseReceived">License Received *</Label>
                      <Input
                        id="licenseReceived"
                        type="date"
                        value={editedData.licenseReceived}
                        onChange={(e) => handleChange('licenseReceived', e.target.value)}
                        className="border-green-200 focus:border-green-500 focus:ring-green-500"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="degree">Degree *</Label>
                      <Input
                        id="degree"
                        value={editedData.degree}
                        onChange={(e) => handleChange('degree', e.target.value)}
                        className="border-green-200 focus:border-green-500 focus:ring-green-500"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Email (Read-only)</Label>
                      <Input
                        value={profile?.email || ''}
                        disabled
                        className="bg-gray-100"
                      />
                    </div>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-sm text-yellow-900">
                      <strong>Note:</strong> Make sure all information is accurate before saving. 
                      You'll be asked to confirm your changes.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-500">Legal Name</p>
                      <p className="font-medium">{profile?.user_metadata?.legalName || 'Not provided'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-medium">{profile?.email || 'Not provided'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Birth Date</p>
                      <p className="font-medium">{profile?.user_metadata?.birthDate || 'Not provided'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Degree</p>
                      <p className="font-medium">{profile?.user_metadata?.degree || 'Not provided'}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-500">Place of Employment</p>
                      <p className="font-medium">{profile?.user_metadata?.placeOfEmployment || 'Not provided'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">License Received</p>
                      <p className="font-medium">{profile?.user_metadata?.licenseReceived || 'Not provided'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Account Created</p>
                      <p className="font-medium">{profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'Unknown'}</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to save these changes?</AlertDialogTitle>
            <AlertDialogDescription>
              This will update your professional profile information. Please review the changes carefully 
              before confirming.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="my-4 p-4 bg-green-50 border border-green-200 rounded-lg space-y-2">
            <p className="text-sm"><strong>Legal Name:</strong> {editedData.legalName}</p>
            <p className="text-sm"><strong>Birth Date:</strong> {editedData.birthDate}</p>
            <p className="text-sm"><strong>Place of Employment:</strong> {editedData.placeOfEmployment}</p>
            <p className="text-sm"><strong>License Received:</strong> {editedData.licenseReceived}</p>
            <p className="text-sm"><strong>Degree:</strong> {editedData.degree}</p>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-gray-400">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmSave} className="bg-green-700 hover:bg-green-800">
              Confirm & Save
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
