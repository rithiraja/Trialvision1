import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { ArrowLeft, CheckCircle, XCircle } from 'lucide-react';

interface EligibilityProps {
  onBack: () => void;
}

export function Eligibility({ onBack }: EligibilityProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Button variant="ghost" onClick={onBack} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>

        <div className="mb-8">
          <h1 className="text-3xl text-gray-900 mb-2">Eligibility Requirements</h1>
          <p className="text-gray-600">Understanding who can use TrialVision</p>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Who Can Use TrialVision?</CardTitle>
              <CardDescription>Platform eligibility criteria</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-4">
                TrialVision is designed for qualified medical professionals who are planning clinical trials. 
                To use our platform, you must meet the following requirements:
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Required Qualifications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">Licensed Medical Professional</p>
                    <p className="text-sm text-gray-600">Active medical license in good standing</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">Institutional Affiliation</p>
                    <p className="text-sm text-gray-600">Current employment at a medical institution or research facility</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">Research Intent</p>
                    <p className="text-sm text-gray-600">Genuine intention to conduct clinical research</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">Terms of Service Agreement</p>
                    <p className="text-sm text-gray-600">Acceptance of our terms and conditions</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Trial Eligibility Criteria</CardTitle>
              <CardDescription>What makes a trial suitable for assessment</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm">Clearly defined research question and hypothesis</p>
                </div>
                <div className="flex gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm">Appropriate study phase (Phase I-IV)</p>
                </div>
                <div className="flex gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm">Realistic study design and methodology</p>
                </div>
                <div className="flex gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm">Defined target population and sample size</p>
                </div>
                <div className="flex gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm">Preliminary budget considerations</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Minimum Feasibility Threshold</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <p className="font-semibold text-blue-900 mb-2">75% Success Score Required</p>
                <p className="text-sm text-blue-800">
                  Clinical trials must achieve a minimum feasibility score of 75 out of 100 to be considered 
                  ready for submission to medical councils and regulatory bodies.
                </p>
              </div>
              <p className="text-sm text-gray-600">
                Trials scoring below 75% will receive detailed feedback and recommendations for improvement 
                before resubmission.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Not Eligible</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex gap-3">
                  <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm">Non-medical professionals without proper credentials</p>
                </div>
                <div className="flex gap-3">
                  <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm">Studies not involving human subjects or clinical intervention</p>
                </div>
                <div className="flex gap-3">
                  <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm">Incomplete or speculative trial proposals</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-yellow-200 bg-yellow-50">
            <CardHeader>
              <CardTitle>Important Note</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-700">
                TrialVision is a feasibility assessment tool designed for planning purposes. It does not replace 
                formal institutional review board (IRB) approval, regulatory submissions, or ethical reviews. 
                All trials must still undergo appropriate oversight and approval processes.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
