import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { projectId } from '../utils/supabase/info';
import { getFreshAccessToken } from '../utils/supabase/auth';
import { ArrowLeft, CheckCircle, AlertCircle, XCircle, TrendingUp, DollarSign, ClipboardCheck, Target, Building2, Award, Calendar, Sparkles } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';
import { HospitalMatchingProgram } from './HospitalMatchingProgram';
import { GrantFundingMatchmaker } from './GrantFundingMatchmaker';
import { ConsultationBooking } from './ConsultationBooking';

interface ResultsViewProps {
  accessToken: string;
  trialId: string;
  onBack: () => void;
  subscriptionTier?: string;
  onNavigateToSubscription?: () => void;
}

export function ResultsView({ accessToken, trialId, onBack, subscriptionTier = 'free', onNavigateToSubscription }: ResultsViewProps) {
  const [trial, setTrial] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showGrantFunding, setShowGrantFunding] = useState(false);
  const [showConsultation, setShowConsultation] = useState(false);

  useEffect(() => {
    loadTrial();
  }, [trialId]);

  const loadTrial = async () => {
    try {
      console.log('=== CLIENT: Loading trial ===');
      console.log('Trial ID:', trialId);
      
      // Get a fresh access token to ensure it's not expired
      console.log('Getting fresh access token...');
      const freshToken = await getFreshAccessToken();
      
      if (!freshToken) {
        throw new Error('Unable to get valid access token. Please log in again.');
      }
      
      console.log('Fresh token obtained');
      
      // Add a small delay to ensure database has committed the transaction
      console.log('Waiting 1 second for database commit...');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // First, let's check what trials exist in the database
      console.log('--- Checking all trials in database first ---');
      try {
        const debugResponse = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-f5a2c76d/debug/trials`,
          {
            headers: {
              'Authorization': `Bearer ${freshToken}`
            }
          }
        );
        const debugData = await debugResponse.json();
        console.log('Debug endpoint response:', debugData);
        console.log('Total trials in database:', debugData.trialCount);
        if (debugData.trials) {
          console.log('Trial IDs in database:', debugData.trials.map((t: any) => t.trialId));
        }
      } catch (debugErr) {
        console.log('Debug endpoint error (non-critical):', debugErr);
      }
      console.log('--- End debug check ---');
      
      // Encode the trial ID to handle any special characters
      const encodedTrialId = encodeURIComponent(trialId);
      const url = `https://${projectId}.supabase.co/functions/v1/make-server-f5a2c76d/trials/${encodedTrialId}`;
      console.log('Original trial ID:', trialId);
      console.log('Encoded trial ID:', encodedTrialId);
      console.log('Fetching URL:', url);
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${freshToken}`
        }
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);
      
      const data = await response.json();
      console.log('Response data:', data);

      if (!response.ok) {
        console.error('Error response from server:', data);
        if (data.debug) {
          console.error('Debug info - Requested ID:', data.debug.requestedId);
          console.error('Debug info - Available trials:', data.debug.availableTrials);
        }
        throw new Error(data.error || 'Failed to load trial');
      }

      console.log('Trial loaded successfully!');
      console.log('Trial data keys:', Object.keys(data.trial || {}));
      setTrial(data.trial);
    } catch (err: any) {
      console.error('=== CLIENT ERROR loading trial ===');
      console.error('Error message:', err.message);
      console.error('Error object:', err);
      setError(err.message || 'Failed to load trial results');
    } finally {
      setIsLoading(false);
    }
  };

  const getVerdictIcon = (verdict: string) => {
    switch (verdict?.toLowerCase()) {
      case 'proceed':
        return <CheckCircle className="w-8 h-8 text-green-600" />;
      case 'revise':
        return <AlertCircle className="w-8 h-8 text-yellow-600" />;
      case 'abandon':
        return <XCircle className="w-8 h-8 text-red-600" />;
      default:
        return <Target className="w-8 h-8 text-gray-600" />;
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

  const getScoreColor = (score: number) => {
    if (score >= 75) return 'text-green-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mb-4"></div>
          <p className="text-gray-600">Loading assessment results...</p>
        </div>
      </div>
    );
  }

  if (error || !trial) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-100 p-8">
        <div className="max-w-4xl mx-auto">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error || 'Trial not found'}</AlertDescription>
          </Alert>
          <Button onClick={onBack} className="mt-4">Back to Dashboard</Button>
        </div>
      </div>
    );
  }

  const analysis = trial.analysis;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-100 pb-44">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Button variant="ghost" onClick={onBack} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl text-gray-900 mb-2">{trial.studyTitle || 'Clinical Trial Assessment'}</h1>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">{trial.studyPhase || 'N/A'}</Badge>
            <Badge variant="outline">{trial.indication || 'N/A'}</Badge>
            <Badge variant="outline">{trial.therapeuticArea || 'N/A'}</Badge>
          </div>
        </div>

        {/* Overall Recommendation */}
        <Card className="mb-6 border-2">
          <CardHeader>
            <div className="flex items-start gap-4">
              {getVerdictIcon(analysis.overallRecommendation.verdict)}
              <div className="flex-1">
                <CardTitle className="text-2xl mb-2">Overall Recommendation</CardTitle>
                <Badge className={`${getVerdictColor(analysis.overallRecommendation.verdict)} text-lg px-4 py-1`}>
                  {analysis.overallRecommendation.verdict.toUpperCase()}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-green-900">Feasibility Score:</span>
                <span className={`text-3xl ${getScoreColor(analysis.outcomePredictor.successProbability)}`}>
                  {analysis.outcomePredictor.successProbability}/100
                </span>
              </div>
              <Progress value={analysis.outcomePredictor.successProbability} className="h-3 mb-2" />
              <p className="text-sm text-green-800">
                {analysis.outcomePredictor.successProbability >= 75 
                  ? '✓ Meets the 75% threshold - Ready for medical council submission'
                  : `✗ Below 75% threshold - Further refinement recommended before submission`
                }
              </p>
            </div>

            <p className="text-gray-700">{analysis.overallRecommendation.summary}</p>
            
            <div>
              <h4 className="font-semibold mb-2">Next Steps:</h4>
              <ul className="list-disc list-inside space-y-1">
                {analysis.overallRecommendation.nextSteps.map((step: string, index: number) => (
                  <li key={index} className="text-gray-700">{step}</li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Outcome Predictor */}
        <Card className="mb-6 bg-gradient-to-br from-green-50 to-white">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Target className="w-6 h-6 text-green-700" />
              <CardTitle>Outcome Prediction</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm">Success Probability</span>
                <span className={`text-2xl ${getScoreColor(analysis.outcomePredictor.successProbability)}`}>
                  {analysis.outcomePredictor.successProbability}%
                </span>
              </div>
              <Progress value={analysis.outcomePredictor.successProbability} className="h-3" />
            </div>

            <p className="text-gray-700">{analysis.outcomePredictor.prediction}</p>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold mb-2 text-green-700">Key Success Factors:</h4>
                <ul className="list-disc list-inside space-y-1">
                  {analysis.outcomePredictor.keyFactors.map((factor: string, index: number) => (
                    <li key={index} className="text-gray-700 text-sm">{factor}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2 text-red-700">Potential Risks:</h4>
                <ul className="list-disc list-inside space-y-1">
                  {analysis.outcomePredictor.risks.map((risk: string, index: number) => (
                    <li key={index} className="text-gray-700 text-sm">{risk}</li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Feasibility Scores */}
        <div className="grid md:grid-cols-3 gap-6 mb-6">
          {/* Medical Feasibility */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <ClipboardCheck className="w-6 h-6 text-purple-600" />
                <CardTitle>Medical Feasibility</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-center mb-2">
                  <span className={`text-4xl ${getScoreColor(analysis.medicalFeasibility.score)}`}>
                    {analysis.medicalFeasibility.score}
                  </span>
                  <span className="text-gray-500">/100</span>
                </div>
                <Progress value={analysis.medicalFeasibility.score} className="h-2" />
              </div>

              <p className="text-sm text-gray-700">{analysis.medicalFeasibility.assessment}</p>

              <div>
                <h5 className="text-sm font-semibold mb-1">Concerns:</h5>
                <ul className="list-disc list-inside space-y-1">
                  {analysis.medicalFeasibility.concerns.map((concern: string, index: number) => (
                    <li key={index} className="text-xs text-gray-600">{concern}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h5 className="text-sm font-semibold mb-1">Recommendations:</h5>
                <ul className="list-disc list-inside space-y-1">
                  {analysis.medicalFeasibility.recommendations.map((rec: string, index: number) => (
                    <li key={index} className="text-xs text-gray-600">{rec}</li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Financial Feasibility */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <DollarSign className="w-6 h-6 text-green-600" />
                <CardTitle>Financial Feasibility</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-center mb-2">
                  <span className={`text-4xl ${getScoreColor(analysis.financialFeasibility.score)}`}>
                    {analysis.financialFeasibility.score}
                  </span>
                  <span className="text-gray-500">/100</span>
                </div>
                <Progress value={analysis.financialFeasibility.score} className="h-2" />
              </div>

              <p className="text-sm text-gray-700">{analysis.financialFeasibility.assessment}</p>

              <div className="bg-green-50 p-3 rounded">
                <p className="text-sm font-semibold text-green-900">Estimated Cost:</p>
                <p className="text-lg text-green-700">{analysis.financialFeasibility.estimatedCost}</p>
              </div>

              <div>
                <h5 className="text-sm font-semibold mb-1">Concerns:</h5>
                <ul className="list-disc list-inside space-y-1">
                  {analysis.financialFeasibility.concerns.map((concern: string, index: number) => (
                    <li key={index} className="text-xs text-gray-600">{concern}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h5 className="text-sm font-semibold mb-1">Recommendations:</h5>
                <ul className="list-disc list-inside space-y-1">
                  {analysis.financialFeasibility.recommendations.map((rec: string, index: number) => (
                    <li key={index} className="text-xs text-gray-600">{rec}</li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Administrative Feasibility */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <TrendingUp className="w-6 h-6 text-green-700" />
                <CardTitle>Administrative</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-center mb-2">
                  <span className={`text-4xl ${getScoreColor(analysis.administrativeFeasibility.score)}`}>
                    {analysis.administrativeFeasibility.score}
                  </span>
                  <span className="text-gray-500">/100</span>
                </div>
                <Progress value={analysis.administrativeFeasibility.score} className="h-2" />
              </div>

              <p className="text-sm text-gray-700">{analysis.administrativeFeasibility.assessment}</p>

              <div>
                <h5 className="text-sm font-semibold mb-1">Concerns:</h5>
                <ul className="list-disc list-inside space-y-1">
                  {analysis.administrativeFeasibility.concerns.map((concern: string, index: number) => (
                    <li key={index} className="text-xs text-gray-600">{concern}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h5 className="text-sm font-semibold mb-1">Recommendations:</h5>
                <ul className="list-disc list-inside space-y-1">
                  {analysis.administrativeFeasibility.recommendations.map((rec: string, index: number) => (
                    <li key={index} className="text-xs text-gray-600">{rec}</li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Hospital/Clinic Matching Program - Only show if score is above 85% */}
        {analysis.outcomePredictor.successProbability >= 85 && (
          subscriptionTier === 'free' ? (
            <Card className="mt-6 border-2 border-green-500 bg-gradient-to-br from-green-50 to-emerald-50">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="bg-green-600 p-3 rounded-lg">
                    <Building2 className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <CardTitle>Hospital/Clinic Matching Program</CardTitle>
                    <Badge className="bg-green-600 text-white mt-1">Pro Feature</Badge>
                  </div>
                </div>
                <CardDescription className="mt-3">
                  Your trial scored {analysis.outcomePredictor.successProbability}% feasibility! Unlock the Hospital Matching Program to connect with 100+ research facilities interested in hosting your trial.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-white border border-green-200 rounded-lg p-4">
                  <h4 className="font-semibold text-green-900 mb-3">With Pro, you'll get access to:</h4>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">100+ verified research facilities and hospitals</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">Detailed patient population data for each site</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">Equipment and staff capacity information</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">Send match invitations directly to interested facilities</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">AI-powered matching based on your trial criteria</span>
                    </li>
                  </ul>
                </div>
                <Button 
                  onClick={onNavigateToSubscription}
                  className="w-full bg-green-600 hover:bg-green-700"
                  size="lg"
                >
                  Upgrade to Pro - $49/month
                </Button>
              </CardContent>
            </Card>
          ) : (
            <HospitalMatchingProgram
              accessToken={accessToken}
              trialId={trialId}
              trialTitle={trial.studyTitle || 'Clinical Trial'}
              therapeuticArea={trial.therapeuticArea}
              indication={trial.indication}
            />
          )
        )}

        {/* Grant Funding Matchmaker - Expert Feature */}
        {subscriptionTier === 'expert' ? (
          showGrantFunding ? (
            <GrantFundingMatchmaker
              trialData={trial}
              accessToken={accessToken}
              onBack={() => setShowGrantFunding(false)}
              subscriptionTier={subscriptionTier}
            />
          ) : (
            <Card className="mt-6 border-2 border-green-600 bg-gradient-to-br from-green-50 to-emerald-50">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="bg-green-700 p-3 rounded-lg">
                    <Award className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <CardTitle>Grant Funding Matchmaker</CardTitle>
                    <Badge className="bg-green-700 text-white mt-1 flex items-center gap-1 w-fit">
                      <Sparkles className="w-3 h-3" />
                      Expert Feature
                    </Badge>
                  </div>
                </div>
                <CardDescription className="mt-3">
                  AI-powered grant matching service that identifies funding opportunities and generates customized proposal drafts for your trial
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-white border border-green-200 rounded-lg p-4">
                  <h4 className="font-semibold text-green-900 mb-3">What you'll get:</h4>
                  <ul className="space-y-2">
                    {[
                      'Matched with 10+ relevant grant opportunities',
                      'AI-generated proposal drafts tailored to each grant',
                      'Detailed budget analysis and cost optimization suggestions',
                      'Application deadlines and success rate information',
                      'Downloadable proposal templates ready for submission'
                    ].map((feature, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <Button 
                  onClick={() => setShowGrantFunding(true)}
                  className="w-full bg-green-700 hover:bg-green-800"
                  size="lg"
                >
                  <Award className="w-5 h-5 mr-2" />
                  View Grant Funding Matches
                </Button>
              </CardContent>
            </Card>
          )
        ) : subscriptionTier === 'pro' ? (
          <Card className="mt-6 border-2 border-green-500 bg-gradient-to-br from-green-50 to-emerald-50">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="bg-green-700 p-3 rounded-lg">
                  <Award className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <CardTitle>Grant Funding Matchmaker</CardTitle>
                  <Badge className="bg-green-700 text-white mt-1 flex items-center gap-1 w-fit">
                    <Sparkles className="w-3 h-3" />
                    Expert Feature
                  </Badge>
                </div>
              </div>
              <CardDescription className="mt-3">
                Get AI-powered grant matching and proposal generation by upgrading to Expert
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-white border border-green-200 rounded-lg p-4">
                <h4 className="font-semibold text-green-900 mb-3">Expert Plan includes:</h4>
                <ul className="space-y-2">
                  {[
                    'Grant Funding Matchmaker with AI proposal generation',
                    'Expert Consultation Booking with medical professionals',
                    'All Pro features including Hospital Matching',
                    'Dedicated account manager and white-glove onboarding'
                  ].map((feature, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      • {feature}
                    </li>
                  ))}
                </ul>
              </div>
              <Button 
                onClick={onNavigateToSubscription}
                className="w-full bg-green-700 hover:bg-green-800"
                size="lg"
              >
                Upgrade to Expert - $99/month
              </Button>
            </CardContent>
          </Card>
        ) : null}

        {/* Consultation Booking - Expert Feature */}
        {subscriptionTier === 'expert' ? (
          showConsultation ? (
            <ConsultationBooking
              trialId={trialId}
              accessToken={accessToken}
              onBack={() => setShowConsultation(false)}
              subscriptionTier={subscriptionTier}
            />
          ) : (
            <Card className="mt-6 border-2 border-green-600 bg-gradient-to-br from-green-50 to-emerald-50">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="bg-green-700 p-3 rounded-lg">
                    <Calendar className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <CardTitle>Expert Consultation Booking</CardTitle>
                    <Badge className="bg-green-700 text-white mt-1 flex items-center gap-1 w-fit">
                      <Sparkles className="w-3 h-3" />
                      Expert Feature
                    </Badge>
                  </div>
                </div>
                <CardDescription className="mt-3">
                  Schedule personalized 30-minute Zoom consultations with our medical professional experts
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-white border border-green-200 rounded-lg p-4">
                  <h4 className="font-semibold text-green-900 mb-3">What you'll get:</h4>
                  <ul className="space-y-2">
                    {[
                      '30-minute one-on-one Zoom consultations',
                      'Choose from 6 medical professional experts',
                      'Personalized feedback on your trial design and protocol',
                      'Recommendations for improving feasibility scores',
                      'Easy calendar scheduling with automatic Zoom links'
                    ].map((feature, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <Button 
                  onClick={() => setShowConsultation(true)}
                  className="w-full bg-green-700 hover:bg-green-800"
                  size="lg"
                >
                  <Calendar className="w-5 h-5 mr-2" />
                  Book Expert Consultation
                </Button>
              </CardContent>
            </Card>
          )
        ) : subscriptionTier === 'pro' ? (
          <Card className="mt-6 border-2 border-green-500 bg-gradient-to-br from-green-50 to-emerald-50">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="bg-green-700 p-3 rounded-lg">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <CardTitle>Expert Consultation Booking</CardTitle>
                  <Badge className="bg-green-700 text-white mt-1 flex items-center gap-1 w-fit">
                    <Sparkles className="w-3 h-3" />
                    Expert Feature
                  </Badge>
                </div>
              </div>
              <CardDescription className="mt-3">
                Book consultations with medical experts by upgrading to Expert
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-white border border-green-200 rounded-lg p-4">
                <h4 className="font-semibold text-green-900 mb-3">Expert Plan includes:</h4>
                <ul className="space-y-2">
                  {[
                    'Expert Consultation Booking with medical professionals',
                    'Grant Funding Matchmaker with AI proposal generation',
                    'All Pro features including Hospital Matching',
                    'Dedicated account manager and white-glove onboarding'
                  ].map((feature, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      • {feature}
                    </li>
                  ))}
                </ul>
              </div>
              <Button 
                onClick={onNavigateToSubscription}
                className="w-full bg-green-700 hover:bg-green-800"
                size="lg"
              >
                Upgrade to Expert - $99/month
              </Button>
            </CardContent>
          </Card>
        ) : null}

        {/* Trial Details */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Trial Details</CardTitle>
            <CardDescription>Submitted information</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Study Design</p>
                  <p>{trial.studyDesign || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Sample Size</p>
                  <p>{trial.studySize || 'Not specified'} participants</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Duration</p>
                  <p>{trial.totalStudyDuration || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Budget</p>
                  <p>{trial.estimatedTotalBudget || 'Not specified'}</p>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Primary Endpoint</p>
                  <p className="text-sm">{trial.primaryEndpoint || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Intervention</p>
                  <p className="text-sm">{trial.interventionDescription || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Submitted</p>
                  <p className="text-sm">{new Date(trial.createdAt).toLocaleString()}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
