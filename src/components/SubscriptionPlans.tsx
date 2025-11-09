import React, { useState, useEffect } from 'react';
import { Check, X, Crown, Sparkles, Zap, ArrowLeft } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface SubscriptionPlansProps {
  currentTier?: string;
  onClose?: () => void;
  accessToken: string;
}

export function SubscriptionPlans({ currentTier = 'free', onClose, accessToken }: SubscriptionPlansProps) {
  const [selectedTier, setSelectedTier] = useState(currentTier);
  const [loading, setLoading] = useState(false);

  const plans = [
    {
      id: 'free',
      name: 'Free',
      icon: Zap,
      price: '$0',
      period: 'forever',
      description: 'Get started with basic trial feasibility assessment',
      features: [
        { name: 'AI-Powered Feasibility Analysis', included: true },
        { name: 'Medical, Financial & Administrative Scoring', included: true },
        { name: 'Basic Trial Recommendations', included: true },
        { name: 'Document Upload & Auto-fill', included: true },
        { name: 'Profile & Settings Management', included: true },
        { name: 'Privacy & Compliance Tools', included: true },
        { name: 'Multi-language Support (20 languages)', included: true },
        { name: 'Accessibility Features', included: true },
        { name: 'View & Manage Assessments', included: true },
        { name: 'Hospital/Clinic Matching Program', included: false },
        { name: 'Grant Funding Matchmaker', included: false },
        { name: '30-min Expert Consultation', included: false }
      ],
      color: 'bg-gray-100',
      borderColor: 'border-gray-300',
      buttonVariant: 'outline' as const,
      popular: false
    },
    {
      id: 'pro',
      name: 'Pro',
      icon: Crown,
      price: '$49',
      period: 'per month',
      description: 'Unlock hospital matching and advanced features',
      features: [
        { name: 'Everything in Free, plus:', included: true },
        { name: 'Hospital/Clinic Matching Program', included: true },
        { name: 'Access to 100+ Research Facilities', included: true },
        { name: 'Patient Population Data', included: true },
        { name: 'Equipment & Staff Capacity Info', included: true },
        { name: 'Send Match Invitations to Facilities', included: true },
        { name: 'Priority Trial Analysis', included: true },
        { name: 'Advanced Analytics Dashboard', included: true },
        { name: 'Unlimited Trial Assessments', included: true },
        { name: 'Export Analysis Reports (PDF)', included: true },
        { name: 'Email Support', included: true },
        { name: 'Grant Funding Matchmaker', included: false },
        { name: '30-min Expert Consultation', included: false }
      ],
      color: 'bg-green-50',
      borderColor: 'border-green-500',
      buttonVariant: 'default' as const,
      popular: true
    },
    {
      id: 'expert',
      name: 'Expert',
      icon: Sparkles,
      price: '$99',
      period: 'per month',
      description: 'Complete solution with grant funding and expert consultations',
      features: [
        { name: 'Everything in Pro, plus:', included: true },
        { name: 'Grant Funding Matchmaker', included: true },
        { name: 'AI-Generated Funding Proposals', included: true },
        { name: 'Access to Federal & Private Grants', included: true },
        { name: 'Budget Gap Analysis & ROI Insights', included: true },
        { name: 'Grant Application Timeline Tracking', included: true },
        { name: '30-min Expert Consultation', included: true },
        { name: 'Book with 6+ Medical Professionals', included: true },
        { name: 'Zoom Call Appointments', included: true },
        { name: 'Personalized Trial Feedback', included: true },
        { name: 'Priority Email & Phone Support', included: true },
        { name: 'White-glove Onboarding', included: true },
        { name: 'Dedicated Account Manager', included: true }
      ],
      color: 'bg-gradient-to-br from-green-100 to-emerald-100',
      borderColor: 'border-green-600',
      buttonVariant: 'default' as const,
      popular: false
    }
  ];

  const handleUpgrade = async (tier: string) => {
    if (tier === currentTier) {
      onClose?.();
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-f5a2c76d/subscription`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
          },
          body: JSON.stringify({ tier })
        }
      );

      if (!response.ok) {
        throw new Error('Failed to update subscription');
      }

      // Reload the page to refresh user data
      window.location.reload();
    } catch (error) {
      console.error('Error updating subscription:', error);
      alert('Failed to update subscription. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-green-50 p-8">
      <div className="max-w-7xl mx-auto">
        {onClose && (
          <Button variant="ghost" onClick={onClose} className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        )}
        
        <div className="text-center mb-12">
          <h1 className="text-green-800 mb-4">Choose Your Plan</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Unlock powerful features to streamline your clinical trial feasibility assessment 
            and connect with hospitals, funding sources, and expert consultations.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-8">
          {plans.map((plan) => {
            const Icon = plan.icon;
            const isCurrentPlan = plan.id === currentTier;

            return (
              <Card 
                key={plan.id}
                className={`relative ${plan.color} ${plan.borderColor} border-2 transition-all hover:shadow-xl ${
                  plan.popular ? 'ring-2 ring-green-500 ring-offset-2' : ''
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-green-600 text-white px-4 py-1">Most Popular</Badge>
                  </div>
                )}
                {isCurrentPlan && (
                  <div className="absolute -top-4 right-4">
                    <Badge className="bg-blue-600 text-white px-4 py-1">Current Plan</Badge>
                  </div>
                )}

                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`p-2 rounded-lg ${plan.id === 'expert' ? 'bg-green-600' : 'bg-green-100'}`}>
                      <Icon className={`w-6 h-6 ${plan.id === 'expert' ? 'text-white' : 'text-green-800'}`} />
                    </div>
                    <CardTitle className="text-green-800">{plan.name}</CardTitle>
                  </div>
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-green-900">{plan.price}</span>
                    <span className="text-gray-600">/ {plan.period}</span>
                  </div>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>

                <CardContent>
                  <ul className="space-y-3">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2">
                        {feature.included ? (
                          <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        ) : (
                          <X className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                        )}
                        <span className={`text-sm ${feature.included ? 'text-gray-800' : 'text-gray-400'}`}>
                          {feature.name}
                        </span>
                      </li>
                    ))}
                  </ul>
                </CardContent>

                <CardFooter>
                  <Button
                    className="w-full"
                    variant={plan.buttonVariant}
                    onClick={() => handleUpgrade(plan.id)}
                    disabled={loading || isCurrentPlan}
                  >
                    {loading ? 'Processing...' : isCurrentPlan ? 'Current Plan' : `Upgrade to ${plan.name}`}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
