import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { ArrowLeft, CheckCircle, AlertCircle, XCircle, TrendingUp, DollarSign, ClipboardCheck, Target } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';

interface ResultsViewProps {
  accessToken: string;
  trialId: string;
  onBack: () => void;
}

export function ResultsView({ accessToken, trialId, onBack }: ResultsViewProps) {
  const [trial, setTrial] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadTrial();
  }, [trialId]);

  const loadTrial = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-f5a2c76d/trials/${trialId}`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load trial');
      }

      setTrial(data.trial);
    } catch (err: any) {
      console.error('Error loading trial:', err);
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
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Button variant="ghost" onClick={onBack} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl text-gray-900 mb-2">{trial.trialTitle}</h1>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">{trial.phase}</Badge>
            <Badge variant="outline">{trial.indication}</Badge>
            <Badge variant="outline">{trial.therapeuticArea}</Badge>
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

        {/* Trial Details */}
        <Card>
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
                  <p>{trial.sampleSize} participants</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Duration</p>
                  <p>{trial.totalDuration || trial.duration || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Budget</p>
                  <p>{trial.estimatedBudget || 'Not specified'}</p>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Primary Endpoint</p>
                  <p className="text-sm">{trial.primaryEndpoint || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Intervention</p>
                  <p className="text-sm">{trial.intervention || 'Not specified'}</p>
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
