import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { ArrowLeft, Shield, Lock, Eye, CheckCircle, FileCheck } from 'lucide-react';

interface PrivacyComplianceProps {
  onBack: () => void;
}

export function PrivacyCompliance({ onBack }: PrivacyComplianceProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Button variant="ghost" onClick={onBack} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>

        <div className="mb-8">
          <h1 className="text-3xl text-gray-900 mb-2">Privacy & Compliance</h1>
          <p className="text-gray-600">Your data security and privacy is our top priority</p>
        </div>

        <div className="space-y-6">
          {/* HIPAA Compliance */}
          <Card className="border-green-200">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Shield className="w-6 h-6 text-green-700" />
                <CardTitle>HIPAA Compliance</CardTitle>
              </div>
              <CardDescription>Healthcare data protection standards</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-4">
                TrialVision is fully compliant with the Health Insurance Portability and Accountability Act (HIPAA) 
                of 1996. We understand the sensitivity of medical and clinical trial data and have implemented 
                comprehensive safeguards to protect all protected health information (PHI).
              </p>
              <div className="space-y-3">
                <div className="flex gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">Administrative Safeguards</p>
                    <p className="text-sm text-gray-600">Security management processes, workforce training, and access authorization</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">Physical Safeguards</p>
                    <p className="text-sm text-gray-600">Facility access controls and workstation security</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">Technical Safeguards</p>
                    <p className="text-sm text-gray-600">Encryption, access controls, and audit trails</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Data Security & Encryption */}
          <Card className="border-green-200">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Lock className="w-6 h-6 text-green-700" />
                <CardTitle>Data Security & Encryption</CardTitle>
              </div>
              <CardDescription>Industry-leading protection measures</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-4">
                All data submitted through TrialVision is protected using state-of-the-art security measures:
              </p>
              <div className="space-y-3">
                <div className="flex gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">End-to-End Encryption</p>
                    <p className="text-sm text-gray-600">256-bit AES encryption for data at rest and TLS 1.3 for data in transit</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">Secure Cloud Infrastructure</p>
                    <p className="text-sm text-gray-600">Enterprise-grade cloud storage with redundant backups and disaster recovery</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">Regular Security Audits</p>
                    <p className="text-sm text-gray-600">Quarterly penetration testing and annual third-party security assessments</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">Multi-Factor Authentication</p>
                    <p className="text-sm text-gray-600">Additional layer of security for user accounts</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Employee Data Review Permission */}
          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Eye className="w-6 h-6 text-green-700" />
                <CardTitle>Employee Data Review Authorization</CardTitle>
              </div>
              <CardDescription>Understanding who can access your submitted data</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-4">
                When you submit a clinical trial for feasibility assessment, you grant limited permission for 
                authorized TrialVision employees to review your submitted data. This is necessary to:
              </p>
              <div className="space-y-3 mb-4">
                <div className="flex gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm">Provide quality assurance on AI-generated assessments</p>
                </div>
                <div className="flex gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm">Improve algorithm accuracy and reliability</p>
                </div>
                <div className="flex gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm">Resolve technical issues or data discrepancies</p>
                </div>
                <div className="flex gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm">Provide customer support when requested</p>
                </div>
              </div>
              <div className="bg-white border border-green-200 rounded-lg p-4">
                <p className="font-semibold text-green-900 mb-2">Who Can Access Your Data?</p>
                <p className="text-sm text-gray-700 mb-3">
                  Only authorized employees who have completed HIPAA training and signed confidentiality 
                  agreements may access submitted trial data. Access is strictly limited to:
                </p>
                <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
                  <li>Clinical review specialists with medical credentials</li>
                  <li>Quality assurance team members</li>
                  <li>Technical support staff (only when troubleshooting)</li>
                  <li>Authorized supervisors for audit purposes</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Data Rights and Control */}
          <Card className="border-green-200">
            <CardHeader>
              <div className="flex items-center gap-3">
                <FileCheck className="w-6 h-6 text-green-700" />
                <CardTitle>Your Data Rights</CardTitle>
              </div>
              <CardDescription>Control and ownership of your information</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-4">
                You maintain full ownership and control over your clinical trial data:
              </p>
              <div className="space-y-3">
                <div className="flex gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">Right to Access</p>
                    <p className="text-sm text-gray-600">View and download all your submitted trial data at any time</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">Right to Deletion</p>
                    <p className="text-sm text-gray-600">Request permanent deletion of your trial data from our systems</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">Right to Portability</p>
                    <p className="text-sm text-gray-600">Export your data in standard formats for use elsewhere</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">Right to Correction</p>
                    <p className="text-sm text-gray-600">Update or correct any inaccurate information</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* No Third-Party Sharing */}
          <Card className="border-green-200">
            <CardHeader>
              <CardTitle>Privacy Protection</CardTitle>
              <CardDescription>We never sell or share your data</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-4">
                TrialVision is committed to protecting your privacy:
              </p>
              <div className="space-y-3">
                <div className="flex gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm">We never sell your clinical trial data to third parties</p>
                </div>
                <div className="flex gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm">We do not use your data for marketing purposes</p>
                </div>
                <div className="flex gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm">We do not share identifiable information with hospitals or clinics without explicit consent</p>
                </div>
                <div className="flex gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm">Aggregate, anonymized data may be used for research and platform improvement only</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Compliance Certifications */}
          <Card className="border-green-200">
            <CardHeader>
              <CardTitle>Compliance & Certifications</CardTitle>
              <CardDescription>Industry-recognized standards</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="font-semibold text-green-900 mb-1">HIPAA</p>
                  <p className="text-sm text-gray-700">Health Insurance Portability and Accountability Act</p>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="font-semibold text-green-900 mb-1">SOC 2 Type II</p>
                  <p className="text-sm text-gray-700">Service Organization Control audit</p>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="font-semibold text-green-900 mb-1">GDPR</p>
                  <p className="text-sm text-gray-700">General Data Protection Regulation</p>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="font-semibold text-green-900 mb-1">ISO 27001</p>
                  <p className="text-sm text-gray-700">Information security management</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact for Privacy Concerns */}
          <Card className="border-yellow-200 bg-yellow-50">
            <CardHeader>
              <CardTitle>Questions or Concerns?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-700 mb-2">
                If you have any questions about our privacy practices, data security, or compliance certifications, 
                please contact our Privacy Officer:
              </p>
              <p className="text-sm">
                <span className="font-medium">Email:</span> privacy@trialvision.com
              </p>
              <p className="text-sm">
                <span className="font-medium">Phone:</span> 1-800-TRIAL-99
              </p>
              <p className="text-sm mt-2 text-gray-600">
                We are committed to addressing your concerns promptly and transparently.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
