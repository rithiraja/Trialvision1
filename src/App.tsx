import { useState, useEffect } from 'react';
import { AuthPage } from './components/AuthPage';
import { Dashboard } from './components/Dashboard';
import { MedicalProfessionalForm } from './components/MedicalProfessionalForm';
import { ClinicalTrialForm } from './components/ClinicalTrialForm';
import { ResultsView } from './components/ResultsView';
import { Profile } from './components/Profile';
import { Settings } from './components/Settings';
import { AboutUs } from './components/AboutUs';
import { Eligibility } from './components/Eligibility';
import { PrivacyCompliance } from './components/PrivacyCompliance';
import { TermsOfService } from './components/TermsOfService';
import { TrialCreationDialog } from './components/TrialCreationDialog';
import { AccessibilityMenu } from './components/AccessibilityMenu';
import { LanguageSelector } from './components/LanguageSelector';
import { getSupabaseClient } from './utils/supabase/client';

const supabase = getSupabaseClient();

type View = 'auth' | 'dashboard' | 'medicalProfessionalForm' | 'clinicalTrialForm' | 'results' | 'profile' | 'settings' | 'about' | 'eligibility' | 'privacy' | 'terms';

export default function App() {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<View>('auth');
  const [selectedTrialId, setSelectedTrialId] = useState<string>('');
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [previousView, setPreviousView] = useState<View>('dashboard');
  const [medicalProfessionalData, setMedicalProfessionalData] = useState<any>(null);
  const [parsedDocumentData, setParsedDocumentData] = useState<any>(null);
  const [showTrialCreationDialog, setShowTrialCreationDialog] = useState(false);

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      console.log('Checking for existing session...');
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Session check error:', error);
        setIsCheckingSession(false);
        return;
      }
      
      if (data.session?.access_token) {
        console.log('Valid session found, access token present');
        setAccessToken(data.session.access_token);
        setCurrentView('dashboard');
      } else {
        console.log('No valid session found');
      }
    } catch (err) {
      console.error('Error checking session:', err);
    } finally {
      setIsCheckingSession(false);
    }
  };

  // Add session refresh listener
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event);
      
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        if (session?.access_token) {
          console.log('Updating access token from auth state change');
          setAccessToken(session.access_token);
        }
      } else if (event === 'SIGNED_OUT') {
        console.log('User signed out');
        setAccessToken(null);
        setCurrentView('auth');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleAuthSuccess = (token: string) => {
    console.log('Auth success, token received');
    setAccessToken(token);
    setCurrentView('dashboard');
  };

  // Helper function to get a fresh access token
  const getFreshToken = async (): Promise<string | null> => {
    try {
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Error getting fresh token:', error);
        return null;
      }
      
      if (data.session?.access_token) {
        console.log('Fresh token retrieved');
        setAccessToken(data.session.access_token);
        return data.session.access_token;
      }
      
      console.warn('No session available for fresh token');
      return null;
    } catch (err) {
      console.error('Exception getting fresh token:', err);
      return null;
    }
  };

  const handleLogout = () => {
    setAccessToken(null);
    setCurrentView('auth');
  };

  const handleStartNewTrial = () => {
    setMedicalProfessionalData(null);
    setParsedDocumentData(null);
    setShowTrialCreationDialog(true);
  };

  const handleManualEntry = () => {
    setParsedDocumentData(null);
    setCurrentView('medicalProfessionalForm');
  };

  const handleDocumentParsed = (data: any) => {
    setParsedDocumentData(data);
    // Show medical professional form first to review/complete that data
    setCurrentView('medicalProfessionalForm');
  };

  const handleMedicalProfessionalFormBack = () => {
    setCurrentView('dashboard');
  };

  const handleMedicalProfessionalFormNext = (data: any) => {
    setMedicalProfessionalData(data);
    setCurrentView('clinicalTrialForm');
  };

  const handleClinicalTrialFormBack = () => {
    setCurrentView('medicalProfessionalForm');
  };

  const handleFormSuccess = (trialId: string) => {
    console.log('=== APP: Trial submitted successfully ===');
    console.log('Trial ID received:', trialId);
    console.log('Setting selectedTrialId and navigating to results');
    setSelectedTrialId(trialId);
    setMedicalProfessionalData(null);
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
      <div className="size-full flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-green-100">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (currentView === 'auth') {
    return (
      <>
        <AuthPage onAuthSuccess={handleAuthSuccess} />
        <AccessibilityMenu />
        <LanguageSelector />
      </>
    );
  }

  if (!accessToken) {
    return <AuthPage onAuthSuccess={handleAuthSuccess} />;
  }

  if (currentView === 'dashboard') {
    return (
      <>
        <Dashboard
          accessToken={accessToken}
          onStartNewTrial={handleStartNewTrial}
          onViewTrial={handleViewTrial}
          onNavigate={handleNavigate}
          onLogout={handleLogout}
        />
        <TrialCreationDialog
          open={showTrialCreationDialog}
          onClose={() => setShowTrialCreationDialog(false)}
          onManualEntry={handleManualEntry}
          onDocumentParsed={handleDocumentParsed}
          accessToken={accessToken}
        />
        <AccessibilityMenu />
        <LanguageSelector />
      </>
    );
  }

  if (currentView === 'medicalProfessionalForm') {
    return (
      <>
        <MedicalProfessionalForm
          onBack={handleMedicalProfessionalFormBack}
          onNext={handleMedicalProfessionalFormNext}
          initialData={parsedDocumentData}
        />
        <AccessibilityMenu />
        <LanguageSelector />
      </>
    );
  }

  if (currentView === 'clinicalTrialForm') {
    return (
      <>
        <ClinicalTrialForm
          accessToken={accessToken}
          medicalProfessionalData={medicalProfessionalData}
          onBack={handleClinicalTrialFormBack}
          onSubmitSuccess={handleFormSuccess}
          onShowTerms={handleShowTerms}
          initialData={parsedDocumentData}
        />
        <AccessibilityMenu />
        <LanguageSelector />
      </>
    );
  }

  if (currentView === 'results' && selectedTrialId) {
    console.log('=== APP: Rendering ResultsView ===');
    console.log('Selected Trial ID:', selectedTrialId);
    return (
      <>
        <ResultsView
          accessToken={accessToken}
          trialId={selectedTrialId}
          onBack={handleResultsBack}
        />
        <AccessibilityMenu />
        <LanguageSelector />
      </>
    );
  }

  if (currentView === 'profile') {
    return (
      <>
        <Profile
          accessToken={accessToken}
          onBack={handleBackToDashboard}
        />
        <AccessibilityMenu />
        <LanguageSelector />
      </>
    );
  }

  if (currentView === 'settings') {
    return (
      <>
        <Settings
          onBack={handleBackToDashboard}
        />
        <AccessibilityMenu />
        <LanguageSelector />
      </>
    );
  }

  if (currentView === 'about') {
    return (
      <>
        <AboutUs
          onBack={handleBackToDashboard}
        />
        <AccessibilityMenu />
        <LanguageSelector />
      </>
    );
  }

  if (currentView === 'eligibility') {
    return (
      <>
        <Eligibility
          onBack={handleBackToDashboard}
        />
        <AccessibilityMenu />
        <LanguageSelector />
      </>
    );
  }

  if (currentView === 'privacy') {
    return (
      <>
        <PrivacyCompliance
          onBack={handleBackToDashboard}
        />
        <AccessibilityMenu />
        <LanguageSelector />
      </>
    );
  }

  if (currentView === 'terms') {
    return (
      <>
        <TermsOfService
          onAccept={handleAcceptTerms}
          onDecline={handleDeclineTerms}
        />
        <AccessibilityMenu />
        <LanguageSelector />
      </>
    );
  }

  return (
    <>
      <Dashboard
        accessToken={accessToken}
        onStartNewTrial={handleStartNewTrial}
        onViewTrial={handleViewTrial}
        onNavigate={handleNavigate}
        onLogout={handleLogout}
      />
      <TrialCreationDialog
        open={showTrialCreationDialog}
        onClose={() => setShowTrialCreationDialog(false)}
        onManualEntry={handleManualEntry}
        onDocumentParsed={handleDocumentParsed}
        accessToken={accessToken}
      />
      <AccessibilityMenu />
      <LanguageSelector />
    </>
  );
}
