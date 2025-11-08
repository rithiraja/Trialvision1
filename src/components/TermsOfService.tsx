import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { ArrowLeft } from 'lucide-react';
import { Checkbox } from './ui/checkbox';
import { useState } from 'react';

interface TermsOfServiceProps {
  onAccept: () => void;
  onDecline: () => void;
}

export function TermsOfService({ onAccept, onDecline }: TermsOfServiceProps) {
  const [accepted, setAccepted] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Button variant="ghost" onClick={onDecline} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <div className="mb-8">
          <h1 className="text-3xl text-gray-900 mb-2">Terms of Service</h1>
          <p className="text-gray-600">Please read and accept our terms to continue</p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>TrialVision Terms of Service</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 max-h-[60vh] overflow-y-auto">
            <section>
              <h3 className="font-semibold mb-2">1. Acceptance of Terms</h3>
              <p className="text-sm text-gray-700">
                By accessing and using TrialVision, you agree to be bound by these Terms of Service. 
                If you do not agree to these terms, please do not use our platform.
              </p>
            </section>

            <section>
              <h3 className="font-semibold mb-2">2. Use of Platform</h3>
              <p className="text-sm text-gray-700">
                TrialVision is a clinical trial feasibility assessment tool intended for use by licensed 
                medical professionals. You agree to:
              </p>
              <ul className="list-disc list-inside text-sm text-gray-700 mt-2 space-y-1">
                <li>Provide accurate and complete information</li>
                <li>Maintain the confidentiality of your account credentials</li>
                <li>Use the platform only for legitimate clinical research purposes</li>
                <li>Comply with all applicable laws and regulations</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold mb-2">3. Professional Responsibility</h3>
              <p className="text-sm text-gray-700">
                You acknowledge that TrialVision provides feasibility assessments and recommendations only. 
                The platform does not replace:
              </p>
              <ul className="list-disc list-inside text-sm text-gray-700 mt-2 space-y-1">
                <li>Institutional Review Board (IRB) approval</li>
                <li>Regulatory agency submissions and approvals</li>
                <li>Ethical review processes</li>
                <li>Professional medical judgment</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold mb-2">4. Data and Privacy</h3>
              <p className="text-sm text-gray-700">
                We are committed to protecting your data. TrialVision:
              </p>
              <ul className="list-disc list-inside text-sm text-gray-700 mt-2 space-y-1">
                <li>Stores data securely using industry-standard encryption</li>
                <li>Does not share your personal information without consent</li>
                <li>Complies with applicable data protection regulations</li>
                <li>May use anonymized data to improve AI models</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold mb-2">5. Disclaimer of Warranties</h3>
              <p className="text-sm text-gray-700">
                TrialVision is provided "as is" without warranties of any kind. While we strive for accuracy, 
                we do not guarantee that:
              </p>
              <ul className="list-disc list-inside text-sm text-gray-700 mt-2 space-y-1">
                <li>The platform will be error-free or uninterrupted</li>
                <li>AI assessments will be completely accurate</li>
                <li>Clinical trials will be approved based on our assessment</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold mb-2">6. Limitation of Liability</h3>
              <p className="text-sm text-gray-700">
                TrialVision and its affiliates shall not be liable for any indirect, incidental, special, 
                consequential, or punitive damages resulting from your use of the platform.
              </p>
            </section>

            <section>
              <h3 className="font-semibold mb-2">7. Intellectual Property</h3>
              <p className="text-sm text-gray-700">
                All content, features, and functionality on TrialVision are owned by us and are protected 
                by intellectual property laws. You retain ownership of the clinical trial data you submit.
              </p>
            </section>

            <section>
              <h3 className="font-semibold mb-2">8. Termination</h3>
              <p className="text-sm text-gray-700">
                We reserve the right to suspend or terminate your access to TrialVision at any time for 
                violation of these terms or for any other reason.
              </p>
            </section>

            <section>
              <h3 className="font-semibold mb-2">9. Prototype Disclaimer</h3>
              <p className="text-sm text-gray-700 font-medium bg-yellow-50 p-3 rounded border border-yellow-200">
                IMPORTANT: This platform is for prototyping and demonstration purposes only. It is not intended 
                for production use with real patient data or sensitive medical information. Do not submit 
                actual clinical trial proposals containing protected health information (PHI) or personally 
                identifiable information (PII).
              </p>
            </section>

            <section>
              <h3 className="font-semibold mb-2">10. Changes to Terms</h3>
              <p className="text-sm text-gray-700">
                We may modify these terms at any time. Continued use of the platform after changes constitutes 
                acceptance of the modified terms.
              </p>
            </section>

            <section>
              <h3 className="font-semibold mb-2">11. Contact Information</h3>
              <p className="text-sm text-gray-700">
                For questions about these terms, please contact us at legal@trialvision.com
              </p>
            </section>

            <section>
              <p className="text-xs text-gray-500">
                Last Updated: {new Date().toLocaleDateString()}
              </p>
            </section>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2 mb-4">
              <Checkbox 
                id="accept-terms" 
                checked={accepted}
                onCheckedChange={(checked) => setAccepted(checked as boolean)}
              />
              <label
                htmlFor="accept-terms"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                I have read and agree to the Terms of Service
              </label>
            </div>
            <div className="flex gap-4">
              <Button onClick={onDecline} variant="outline" className="flex-1">
                Decline
              </Button>
              <Button onClick={onAccept} disabled={!accepted} className="flex-1">
                Accept and Continue
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
