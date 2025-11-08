import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { ArrowLeft, Eye, Target, Users, Award } from 'lucide-react';

interface AboutUsProps {
  onBack: () => void;
}

export function AboutUs({ onBack }: AboutUsProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Button variant="ghost" onClick={onBack} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>

        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Eye className="w-12 h-12 text-green-700" />
            <h1 className="text-4xl text-green-700">TrialVision</h1>
          </div>
          <p className="text-xl text-gray-700">Clinical Trial Feasibility Assessment Platform</p>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Our Mission</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">
                TrialVision is dedicated to revolutionizing the clinical trial planning process by providing medical professionals
                with AI-powered feasibility assessments. We help researchers make informed decisions about trial viability before
                committing significant resources, ultimately accelerating the path from research to patient care.
              </p>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <Target className="w-8 h-8 text-green-700 mb-2" />
                <CardTitle>Our Vision</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-700">
                  To become the leading platform for clinical trial feasibility assessment, empowering researchers worldwide.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Users className="w-8 h-8 text-green-700 mb-2" />
                <CardTitle>Expert Team</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-700">
                  Our AI is validated by medical professionals, financial advisors, and clinical trial administrators.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Award className="w-8 h-8 text-green-700 mb-2" />
                <CardTitle>Excellence</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-700">
                  We maintain the highest standards of accuracy and reliability in our feasibility assessments.
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>How It Works</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-700 text-white flex items-center justify-center">1</div>
                  <div>
                    <h4 className="font-semibold">Submit Your Trial Proposal</h4>
                    <p className="text-sm text-gray-600">Fill out our comprehensive form with your clinical trial details</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-700 text-white flex items-center justify-center">2</div>
                  <div>
                    <h4 className="font-semibold">AI Analysis</h4>
                    <p className="text-sm text-gray-600">Our validated AI system evaluates medical, financial, and administrative feasibility</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-700 text-white flex items-center justify-center">3</div>
                  <div>
                    <h4 className="font-semibold">Receive Results</h4>
                    <p className="text-sm text-gray-600">Get a detailed feasibility score (1-100) with recommendations and next steps</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-700 text-white flex items-center justify-center">4</div>
                  <div>
                    <h4 className="font-semibold">Make Informed Decisions</h4>
                    <p className="text-sm text-gray-600">Trials scoring 75% or higher are considered ready for submission to medical councils</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contact Us</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-4">
                Have questions or need support? We're here to help.
              </p>
              <div className="space-y-2 text-sm text-gray-600">
                <p>Email: support@trialvision.com</p>
                <p>Phone: 1-800-TRIAL-VIS</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
