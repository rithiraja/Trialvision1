import React from 'react';
import { Crown, Sparkles, ChevronRight } from 'lucide-react';
import { Button } from './ui/button';

interface SubscriptionBannerProps {
  currentTier: string;
  onViewPlans: () => void;
}

export function SubscriptionBanner({ currentTier, onViewPlans }: SubscriptionBannerProps) {
  if (currentTier === 'expert') {
    return null; // Don't show banner for expert users
  }

  const bannerContent = {
    free: {
      icon: Crown,
      gradient: 'from-green-600 to-emerald-600',
      message: 'Unlock Hospital Matching & More',
      description: 'Upgrade to Pro to connect with 100+ research facilities',
      cta: 'View Plans'
    },
    pro: {
      icon: Sparkles,
      gradient: 'from-green-700 to-emerald-700',
      message: 'Unlock Grant Funding & Expert Consultations',
      description: 'Upgrade to Expert for AI-powered grant matching and 30-min consultations',
      cta: 'Upgrade to Expert'
    }
  };

  const content = bannerContent[currentTier as keyof typeof bannerContent];
  const Icon = content.icon;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 transform transition-all duration-300 hover:scale-[1.02]">
      <div className={`bg-gradient-to-r ${content.gradient} text-white py-4 px-6 shadow-2xl`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-1">
            <div className="bg-white/20 p-3 rounded-lg backdrop-blur-sm">
              <Icon className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span>{content.message}</span>
                <Sparkles className="w-4 h-4" />
              </div>
              <p className="text-sm text-green-100">{content.description}</p>
            </div>
          </div>
          
          <Button
            onClick={onViewPlans}
            className="bg-white text-green-800 hover:bg-green-50 shadow-lg"
          >
            {content.cta}
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}
