import React, { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, AlertCircle, FileText, Download, ChevronDown, ChevronUp, Calendar, Award, ArrowLeft, Lock } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import { Progress } from './ui/progress';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface GrantFundingMatchmakerProps {
  trialData?: any;
  accessToken: string;
  onBack: () => void;
  subscriptionTier: string;
}

export function GrantFundingMatchmaker({ trialData, accessToken, onBack, subscriptionTier }: GrantFundingMatchmakerProps) {
  const [loading, setLoading] = useState(true);
  const [grantMatches, setGrantMatches] = useState<any[]>([]);
  const [fundingProposal, setFundingProposal] = useState<any>(null);
  const [budgetAnalysis, setBudgetAnalysis] = useState<any>(null);
  const [expandedGrants, setExpandedGrants] = useState<{ [key: string]: boolean }>({});
  const [expandedSections, setExpandedSections] = useState<{ [key: string]: boolean }>({
    proposal: false,
    budget: true
  });

  useEffect(() => {
    fetchGrantMatches();
  }, []);

  const fetchGrantMatches = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-f5a2c76d/grant-funding-matches`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
          },
          body: JSON.stringify({ trialData })
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch grant matches');
      }

      const data = await response.json();
      setGrantMatches(data.grantMatches);
      setFundingProposal(data.fundingProposal);
      setBudgetAnalysis(data.budgetAnalysis);
    } catch (error) {
      console.error('Error fetching grant matches:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleGrant = (grantId: string) => {
    setExpandedGrants(prev => ({ ...prev, [grantId]: !prev[grantId] }));
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const downloadProposal = () => {
    if (!fundingProposal) return;
    
    let proposalText = `${fundingProposal.title}\n\n`;
    Object.entries(fundingProposal.sections).forEach(([key, value]) => {
      const title = key.replace(/([A-Z])/g, ' $1').trim();
      proposalText += `\n${title.toUpperCase()}\n${'='.repeat(50)}\n`;
      if (Array.isArray(value)) {
        value.forEach((item, idx) => {
          proposalText += `${idx + 1}. ${item}\n`;
        });
      } else {
        proposalText += `${value}\n`;
      }
    });

    const blob = new Blob([proposalText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'grant-proposal-draft.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Check if user has Expert tier access
  if (subscriptionTier !== 'expert') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-100 p-8">
        <div className="max-w-4xl mx-auto">
          <Button variant="ghost" onClick={onBack} className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          <Card className="border-2 border-green-500">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="bg-green-600 p-3 rounded-lg">
                  <Lock className="w-6 h-6 text-white" />
                </div>
                <div>
                  <CardTitle>Grant Funding Matchmaker</CardTitle>
                  <Badge className="bg-green-600 text-white mt-1">Expert Feature</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-gray-700">
                Unlock AI-powered grant matching and automated proposal generation by upgrading to our Expert plan.
              </p>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-semibold text-green-900 mb-3">Expert Plan includes:</h4>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2 text-sm">
                    • AI-powered matching with federal and private grants
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    • Auto-generated funding proposals
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    • Budget gap analysis and ROI opportunities
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    • 30-minute expert consultations
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    • All Pro features including Hospital Matching
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-100 p-8">
        <div className="max-w-7xl mx-auto">
          <Button variant="ghost" onClick={onBack} className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div className="flex items-center justify-center p-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-800 mx-auto mb-4"></div>
              <p className="text-gray-600">Analyzing funding opportunities...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-100 p-8">
      <div className="max-w-7xl mx-auto space-y-6 pb-24">
        <Button variant="ghost" onClick={onBack} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        {/* Header */}
        <div className="bg-gradient-to-r from-green-700 to-emerald-700 text-white p-8 rounded-lg">
          <div className="flex items-center gap-3 mb-2">
            <DollarSign className="w-8 h-8" />
            <h2>Grant Funding Matchmaker</h2>
          </div>
          <p className="text-green-100">
            AI-powered grant matching and funding proposal generation for your clinical trial
          </p>
        </div>

      {/* Budget Analysis */}
      <Card className="border-green-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-800" />
              <CardTitle className="text-green-800">Budget Analysis</CardTitle>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => toggleSection('budget')}
            >
              {expandedSections.budget ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
          </div>
        </CardHeader>
        {expandedSections.budget && budgetAnalysis && (
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="text-sm text-gray-600 mb-1 block">Estimated Total Cost</label>
                <p className="text-green-900">{budgetAnalysis.estimatedTotalCost}</p>
              </div>
              <div>
                <label className="text-sm text-gray-600 mb-1 block">Provided Budget</label>
                <p className="text-green-900">{budgetAnalysis.providedBudget}</p>
              </div>
              <div>
                <label className="text-sm text-gray-600 mb-1 block">Budget Gap</label>
                <p className={`${budgetAnalysis.gapStatus === 'adequate' ? 'text-green-600' : 'text-red-600'}`}>
                  {budgetAnalysis.gap}
                </p>
              </div>
              <div>
                <label className="text-sm text-gray-600 mb-1 block">Status</label>
                <Badge className={budgetAnalysis.gapStatus === 'adequate' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                  {budgetAnalysis.gapStatus}
                </Badge>
              </div>
            </div>

            <div className="mb-6">
              <h4 className="text-green-800 mb-3">Budget Breakdown</h4>
              <div className="space-y-2">
                {Object.entries(budgetAnalysis.breakdown).map(([category, amount]) => (
                  <div key={category} className="flex items-center justify-between text-sm">
                    <span className="text-gray-700 capitalize">{category}</span>
                    <span className="text-green-900">{amount as string}</span>
                  </div>
                ))}
              </div>
            </div>

            {budgetAnalysis.recommendations && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="text-blue-900 mb-2 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  Recommendations
                </h4>
                <ul className="space-y-1">
                  {budgetAnalysis.recommendations.map((rec: string, idx: number) => (
                    <li key={idx} className="text-sm text-blue-800">• {rec}</li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        )}
      </Card>

      {/* Grant Matches */}
      <div>
        <h3 className="text-green-800 mb-4">Recommended Grants ({grantMatches.length})</h3>
        <div className="space-y-4">
          {grantMatches.map((grant) => (
            <Card key={grant.id} className="border-green-200 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Award className="w-5 h-5 text-green-800" />
                      <CardTitle className="text-green-800">{grant.name}</CardTitle>
                      <Badge className="bg-green-100 text-green-800">{grant.type}</Badge>
                    </div>
                    <CardDescription>{grant.description}</CardDescription>
                  </div>
                  <div className="text-right ml-4">
                    <div className="text-green-900 mb-1">{grant.maxAward}</div>
                    <div className="flex items-center gap-1">
                      <Progress value={grant.matchScore} className="w-16 h-2" />
                      <span className="text-sm text-green-700">{grant.matchScore}%</span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="text-sm text-gray-600">Deadline</label>
                    <div className="flex items-center gap-1 text-sm text-gray-900">
                      <Calendar className="w-4 h-4" />
                      {grant.deadline}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Success Rate</label>
                    <p className="text-sm text-gray-900">{grant.estimatedSuccessRate}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Average Award</label>
                    <p className="text-sm text-gray-900">{grant.averageAward}</p>
                  </div>
                </div>

                <Collapsible open={expandedGrants[grant.id]}>
                  <CollapsibleTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleGrant(grant.id)}
                      className="text-green-800 hover:text-green-900"
                    >
                      {expandedGrants[grant.id] ? 'Show Less' : 'Show More'}
                      {expandedGrants[grant.id] ? <ChevronUp className="w-4 h-4 ml-2" /> : <ChevronDown className="w-4 h-4 ml-2" />}
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-4 space-y-4">
                    <div>
                      <h5 className="text-green-800 mb-2">Why This Grant Matches</h5>
                      <p className="text-sm text-gray-700 bg-green-50 p-3 rounded">{grant.why}</p>
                    </div>
                    <div>
                      <h5 className="text-green-800 mb-2">Focus Areas</h5>
                      <div className="flex flex-wrap gap-2">
                        {grant.focusAreas.map((area: string, idx: number) => (
                          <Badge key={idx} variant="outline" className="border-green-300 text-green-800">
                            {area}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h5 className="text-green-800 mb-2">Eligibility</h5>
                      <ul className="text-sm text-gray-700 space-y-1">
                        {grant.eligibility.map((item: string, idx: number) => (
                          <li key={idx}>• {item}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h5 className="text-green-800 mb-2">Application Requirements</h5>
                      <ul className="text-sm text-gray-700 space-y-1">
                        {grant.applicationRequirements.map((req: string, idx: number) => (
                          <li key={idx}>• {req}</li>
                        ))}
                      </ul>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Funding Proposal */}
      {fundingProposal && (
        <Card className="border-green-200">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-green-800" />
                <CardTitle className="text-green-800">AI-Generated Funding Proposal Draft</CardTitle>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  onClick={downloadProposal}
                  variant="outline"
                  size="sm"
                  className="border-green-600 text-green-800"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleSection('proposal')}
                >
                  {expandedSections.proposal ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </Button>
              </div>
            </div>
          </CardHeader>
          {expandedSections.proposal && (
            <CardContent>
              <div className="space-y-6">
                {Object.entries(fundingProposal.sections).map(([key, value]) => (
                  <div key={key}>
                    <h4 className="text-green-800 mb-2 capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </h4>
                    {Array.isArray(value) ? (
                      <ul className="text-sm text-gray-700 space-y-1 bg-gray-50 p-4 rounded">
                        {value.map((item, idx) => (
                          <li key={idx}>• {item}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-gray-700 bg-gray-50 p-4 rounded whitespace-pre-wrap">
                        {value}
                      </p>
                    )}
                  </div>
                ))}

                {fundingProposal.budgetGaps && fundingProposal.budgetGaps.length > 0 && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h4 className="text-yellow-900 mb-2 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      Potential Budget Gaps
                    </h4>
                    <ul className="space-y-1">
                      {fundingProposal.budgetGaps.map((gap: string, idx: number) => (
                        <li key={idx} className="text-sm text-yellow-800">• {gap}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {fundingProposal.roiOpportunities && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="text-green-900 mb-2 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" />
                      ROI Opportunities
                    </h4>
                    <ul className="space-y-1">
                      {fundingProposal.roiOpportunities.map((opp: string, idx: number) => (
                        <li key={idx} className="text-sm text-green-800">• {opp}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </CardContent>
          )}
        </Card>
      )}
      </div>
    </div>
  );
}
