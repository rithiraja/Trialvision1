import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { projectId } from '../utils/supabase/info';
import { getSupabaseClient } from '../utils/supabase/client';
import { getFreshAccessToken } from '../utils/supabase/auth';
import { Plus, FileText, LogOut, TrendingUp, AlertCircle, CheckCircle, XCircle, Trash2, Crown, DollarSign, Video, Zap, Sparkles } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';
import { toast } from 'sonner@2.0.3';

const supabase = getSupabaseClient();

interface DashboardProps {
  accessToken: string;
  onStartNewTrial: () => void;
  onViewTrial: (trialId: string) => void;
  onNavigate: (view: string) => void;
  onLogout: () => void;
}

export function Dashboard({ accessToken, onStartNewTrial, onViewTrial, onNavigate, onLogout }: DashboardProps) {
  const [trials, setTrials] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [userName, setUserName] = useState('');
  const [subscriptionTier, setSubscriptionTier] = useState('free');
  const [trialToDelete, setTrialToDelete] = useState<{ id: string; title: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    loadUserData();
    loadTrials();
  }, []);

  const loadUserData = async () => {
    try {
      const freshToken = await getFreshAccessToken();
      if (!freshToken) {
        console.error('No valid access token available');
        return;
      }

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-f5a2c76d/profile`,
        {
          headers: {
            'Authorization': `Bearer ${freshToken}`
          }
        }
      );

      const data = await response.json();
      if (data.user?.user_metadata?.legalName) {
        setUserName(data.user.user_metadata.legalName);
      }
      if (data.user?.user_metadata?.subscriptionTier) {
        setSubscriptionTier(data.user.user_metadata.subscriptionTier);
      }
    } catch (err) {
      console.error('Error loading user data:', err);
    }
  };

  const loadTrials = async () => {
    try {
      const freshToken = await getFreshAccessToken();
      if (!freshToken) {
        throw new Error('Unable to get valid access token. Please log in again.');
      }

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-f5a2c76d/trials`,
        {
          headers: {
            'Authorization': `Bearer ${freshToken}`
          }
        }
      );

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to load trials');
      }

      setTrials(data.trials || []);
    } catch (err: any) {
      console.error('Error loading trials:', err);
      setError(err.message || 'Failed to load trials');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    onLogout();
  };

  const handleDeleteClick = (e: React.MouseEvent, trialId: string, trialTitle: string) => {
    e.stopPropagation(); // Prevent card click event
    setTrialToDelete({ id: trialId, title: trialTitle });
  };

  const handleDeleteConfirm = async () => {
    if (!trialToDelete) return;

    setIsDeleting(true);
    try {
      const freshToken = await getFreshAccessToken();
      if (!freshToken) {
        throw new Error('Unable to get valid access token. Please log in again.');
      }

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-f5a2c76d/trials/${encodeURIComponent(trialToDelete.id)}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${freshToken}`
          }
        }
      );

      const data = await response.json();

      if (!response.ok) {
        console.error('Delete error response:', data);
        if (data.debug) {
          console.error('Debug info:', data.debug);
        }
        throw new Error(data.error || 'Failed to delete trial');
      }

      toast.success('Trial deleted successfully');
      
      // Refresh the trials list
      await loadTrials();
    } catch (err: any) {
      console.error('Error deleting trial:', err);
      toast.error(err.message || 'Failed to delete trial');
    } finally {
      setIsDeleting(false);
      setTrialToDelete(null);
    }
  };

  const getVerdictIcon = (verdict: string) => {
    switch (verdict?.toLowerCase()) {
      case 'proceed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'revise':
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      case 'abandon':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <FileText className="w-5 h-5 text-gray-600" />;
    }
  };

  const getVerdictColor = (verdict: string) => {
    switch (verdict?.toLowerCase()) {
      case 'proceed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'revise':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'abandon':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-100 pb-44">
        <nav className="bg-white border-b border-green-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center gap-8">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-6 h-6 text-green-700" />
                  <span className="text-xl text-green-700">TrialVision</span>
                </div>
                <div className="hidden md:flex items-center gap-1">
                  <Button variant="ghost" onClick={() => onNavigate('profile')}>Profile</Button>
                  <Button variant="ghost" onClick={() => onNavigate('settings')}>Settings</Button>
                  <Button variant="ghost" onClick={() => onNavigate('about')}>About Us</Button>
                  <Button variant="ghost" onClick={() => onNavigate('eligibility')}>Eligibility</Button>
                  <Button variant="ghost" onClick={() => onNavigate('privacy')}>Privacy</Button>
                </div>
              </div>
              <div className="flex items-center gap-4">
                {userName && <span className="text-gray-700 hidden sm:block">Welcome, {userName}</span>}
                <Button variant="ghost" onClick={handleSignOut}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Log Out
                </Button>
              </div>
            </div>
          </div>
        </nav>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Subscription Tier Badge */}
          <div className="flex justify-end mb-4">
            <Badge 
              className="cursor-pointer transition-colors px-4 py-2" 
              variant="outline"
              onClick={() => onNavigate('subscription')}
            >
              {subscriptionTier === 'free' && (
                <>
                  <Zap className="w-4 h-4 mr-2" />
                  Free Plan
                </>
              )}
              {subscriptionTier === 'pro' && (
                <>
                  <Crown className="w-4 h-4 mr-2 text-green-700" />
                  <span className="text-green-700">Pro Plan</span>
                </>
              )}
              {subscriptionTier === 'expert' && (
                <>
                  <Sparkles className="w-4 h-4 mr-2 text-green-800" />
                  <span className="text-green-800">Expert Plan</span>
                </>
              )}
            </Badge>
          </div>

          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl text-gray-900 mb-2">Your Clinical Trials</h1>
              <p className="text-gray-600">Manage and assess your clinical trial proposals</p>
            </div>
            <Button onClick={onStartNewTrial} size="lg">
              <Plus className="w-5 h-5 mr-2" />
              New Trial Assessment
            </Button>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {isLoading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
              <p className="mt-4 text-gray-600">Loading your trials...</p>
            </div>
          ) : trials.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FileText className="w-16 h-16 text-gray-400 mb-4" />
                <h3 className="text-xl text-gray-900 mb-2">No trials yet</h3>
                <p className="text-gray-600 mb-6">Get started by creating your first clinical trial assessment</p>
                <Button onClick={onStartNewTrial}>
                  <Plus className="w-5 h-5 mr-2" />
                  Create First Trial
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {trials.map((trialData: any, index: number) => {
                // Trial data already contains trialId field from backend
                const trialId = trialData.trialId;
                
                // Skip trials without valid IDs
                if (!trialId) {
                  console.warn('Trial without ID found, skipping:', trialData);
                  return null;
                }
                
                return (
                  <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer relative group" onClick={() => onViewTrial(trialId)}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="line-clamp-2">{trialData.studyTitle || trialData.trialTitle || 'Untitled Trial'}</CardTitle>
                          <CardDescription className="mt-2">
                            {trialData.studyPhase || trialData.phase || 'Phase II'} • {trialData.indication || 'Not specified'}
                          </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                          {trialData.analysis?.overallRecommendation?.verdict && 
                            getVerdictIcon(trialData.analysis.overallRecommendation.verdict)
                          }
                          <Button
                            variant="ghost"
                            size="icon"
                            className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={(e) => handleDeleteClick(e, trialId, trialData.studyTitle || trialData.trialTitle || 'Untitled Trial')}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {trialData.analysis?.overallRecommendation?.verdict && (
                          <Badge className={getVerdictColor(trialData.analysis.overallRecommendation.verdict)}>
                            {trialData.analysis.overallRecommendation.verdict.toUpperCase()}
                          </Badge>
                        )}
                        
                        {trialData.analysis && (
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Success Probability:</span>
                              <span className="font-medium">{trialData.analysis.outcomePredictor?.successProbability || 0}%</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Medical Score:</span>
                              <span className="font-medium">{trialData.analysis.medicalFeasibility?.score || 0}/100</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Financial Score:</span>
                              <span className="font-medium">{trialData.analysis.financialFeasibility?.score || 0}/100</span>
                            </div>
                          </div>
                        )}
                        
                        <div className="pt-2 border-t">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500">
                              Created: {new Date(trialData.createdAt).toLocaleDateString()}
                            </span>
                            <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-300">
                              View Full Results
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </main>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!trialToDelete} onOpenChange={() => !isDeleting && setTrialToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Trial Assessment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{trialToDelete?.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
