import React from 'react';
import { Crown, Sparkles, ChevronRight, Zap } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

interface SubscriptionBannerProps {
  currentTier: string;
  onViewPlans: () => void;
}

export function SubscriptionBanner({ currentTier, onViewPlans }: SubscriptionBannerProps) {
  const tierDisplay = {
    free: { name: 'Free Plan', icon: Zap, color: 'bg-gray-600' },
    pro: { name: 'Pro Plan', icon: Crown, color: 'bg-green-600' },
    expert: { name: 'Expert Plan', icon: Sparkles, color: 'bg-green-700' }
  };

  const bannerContent = {
    free: {
      icon: Crown,
      gradient: 'from-green-600 to-emerald-600',
      message: 'Unlock Hospital Matching & More',
      description: 'Upgrade to Pro ($49/mo) to connect with 100+ research facilities',
      cta: 'View Plans',
      showUpgrade: true
    },
    pro: {
      icon: Sparkles,
      gradient: 'from-green-700 to-emerald-700',
      message: 'Unlock Grant Funding & Expert Consultations',
      description: 'Upgrade to Expert ($99/mo) for AI-powered grant matching and consultations',
      cta: 'Upgrade to Expert',
      showUpgrade: true
    },
    expert: {
      icon: Sparkles,
      gradient: 'from-green-800 to-emerald-800',
      message: 'You have full access to all TrialVision features',
      description: 'Enjoy unlimited assessments, hospital matching, grant funding, and expert consultations',
      cta: 'Manage Plan',
      showUpgrade: false
    }
  };

  const content = bannerContent[currentTier as keyof typeof bannerContent];
  const currentPlan = tierDisplay[currentTier as keyof typeof tierDisplay];
  const Icon = content.icon;
  const TierIcon = currentPlan.icon;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      <div className={`bg-gradient-to-r ${content.gradient} text-white shadow-2xl`}>
        {/* Current Subscription Tier Display */}
        <div className="bg-black/20 py-2 px-6 border-b border-white/10">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge className={`${currentPlan.color} text-white border-0 px-3 py-1`}>
                <TierIcon className="w-3 h-3 mr-1.5" />
                Current Plan: {currentPlan.name}
              </Badge>
            </div>
            <button 
              onClick={onViewPlans}
              className="text-xs text-white/80 hover:text-white underline transition-colors"
            >
              View All Plans
            </button>
          </div>
        </div>

        {/* Upgrade Message */}
        <div className="py-4 px-6">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 flex-1">
              <div className="bg-white/20 p-3 rounded-lg backdrop-blur-sm">
                <Icon className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium">{content.message}</span>
                  {content.showUpgrade && <Sparkles className="w-4 h-4" />}
                </div>
                <p className="text-sm text-white/90">{content.description}</p>
              </div>
            </div>
            
            {content.showUpgrade && (
              <Button
                onClick={onViewPlans}
                className="bg-white text-green-800 hover:bg-green-50 shadow-lg"
              >
                {content.cta}
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
