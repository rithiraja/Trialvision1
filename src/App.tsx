import { useState, useEffect } from 'react';
import { AuthPage } from './components/AuthPage';
import { Dashboard } from './components/Dashboard';
import { TrialForm } from './components/TrialForm';
import { ResultsView } from './components/ResultsView';
import { Profile } from './components/Profile';
import { Settings } from './components/Settings';
import { AboutUs } from './components/AboutUs';
import { Eligibility } from './components/Eligibility';
import { TermsOfService } from './components/TermsOfService';
import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from './utils/supabase/info';

const supabase = createClient(
  `https://${projectId}.supabase.co`,
  publicAnonKey
);

type View = 'auth' | 'dashboard' | 'form' | 'results' | 'profile' | 'settings' | 'about' | 'eligibility' | 'terms';

export default function App() {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<View>('auth');
  const [selectedTrialId, setSelectedTrialId] = useState<string>('');
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [previousView, setPreviousView] = useState<View>('dashboard');

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const { data, error } = await supabase.auth.getSession();
      
      if (data.session?.access_token) {
        setAccessToken(data.session.access_token);
        setCurrentView('dashboard');
      }
    } catch (err) {
      console.error('Error checking session:', err);
    } finally {
      setIsCheckingSession(false);
    }
  };

  const handleAuthSuccess = (token: string) => {
    setAccessToken(token);
    setCurrentView('dashboard');
  };

  const handleLogout = () => {
    setAccessToken(null);
    setCurrentView('auth');
  };

  const handleStartNewTrial = () => {
    setCurrentView('form');
  };

  const handleFormBack = () => {
    setCurrentView('dashboard');
  };

  const handleFormSuccess = (trialId: string) => {
    setSelectedTrialId(trialId);
    setCurrentView('results');
  };

  const handleViewTrial = (trialId: string) => {
    setSelectedTrialId(trialId);
    setCurrentView('results');
  };

  const handleResultsBack = () => {
    setCurrentView('dashboard');
  };

  const handleNavigate = (view: string) => {
    setPreviousView(currentView);
    setCurrentView(view as View);
  };

  const handleBackToDashboard = () => {
    setCurrentView('dashboard');
  };

  const handleShowTerms = () => {
    setPreviousView(currentView);
    setCurrentView('terms');
  };

  const handleAcceptTerms = () => {
    setCurrentView(previousView);
  };

  const handleDeclineTerms = () => {
    setCurrentView(previousView);
  };

  if (isCheckingSession) {
    return (
      <div className="size-full flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (currentView === 'auth') {
    return <AuthPage onAuthSuccess={handleAuthSuccess} />;
  }

  if (!accessToken) {
    return <AuthPage onAuthSuccess={handleAuthSuccess} />;
  }

  if (currentView === 'dashboard') {
    return (
      <Dashboard
        accessToken={accessToken}
        onStartNewTrial={handleStartNewTrial}
        onViewTrial={handleViewTrial}
        onNavigate={handleNavigate}
        onLogout={handleLogout}
      />
    );
  }

  if (currentView === 'form') {
    return (
      <TrialForm
        accessToken={accessToken}
        onBack={handleFormBack}
        onSubmitSuccess={handleFormSuccess}
        onShowTerms={handleShowTerms}
      />
    );
  }

  if (currentView === 'results' && selectedTrialId) {
    return (
      <ResultsView
        accessToken={accessToken}
        trialId={selectedTrialId}
        onBack={handleResultsBack}
      />
    );
  }

  if (currentView === 'profile') {
    return (
      <Profile
        accessToken={accessToken}
        onBack={handleBackToDashboard}
      />
    );
  }

  if (currentView === 'settings') {
    return (
      <Settings
        onBack={handleBackToDashboard}
      />
    );
  }

  if (currentView === 'about') {
    return (
      <AboutUs
        onBack={handleBackToDashboard}
      />
    );
  }

  if (currentView === 'eligibility') {
    return (
      <Eligibility
        onBack={handleBackToDashboard}
      />
    );
  }

  if (currentView === 'terms') {
    return (
      <TermsOfService
        onAccept={handleAcceptTerms}
        onDecline={handleDeclineTerms}
      />
    );
  }

  return (
    <Dashboard
      accessToken={accessToken}
      onStartNewTrial={handleStartNewTrial}
      onViewTrial={handleViewTrial}
      onNavigate={handleNavigate}
      onLogout={handleLogout}
    />
  );
}
