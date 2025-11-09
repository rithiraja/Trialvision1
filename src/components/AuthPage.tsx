import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { getSupabaseClient } from '../utils/supabase/client';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { AlertCircle, TrendingUp } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';

const supabase = getSupabaseClient();

interface AuthPageProps {
  onAuthSuccess: (accessToken: string) => void;
}

export function AuthPage({ onAuthSuccess }: AuthPageProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [signupData, setSignupData] = useState({
    legalName: '',
    birthDate: '',
    placeOfEmployment: '',
    licenseReceived: '',
    degree: '',
    email: '',
    password: ''
  });
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // First, create the user via our backend
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-f5a2c76d/signup`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`
          },
          body: JSON.stringify(signupData)
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Signup failed');
      }

      // Now sign in with the created user
      const { data: sessionData, error: signInError } = await supabase.auth.signInWithPassword({
        email: signupData.email,
        password: signupData.password
      });

      if (signInError) {
        throw signInError;
      }

      if (sessionData.session?.access_token) {
        onAuthSuccess(sessionData.session.access_token);
      }
    } catch (err: any) {
      console.error('Signup error:', err);
      setError(err.message || 'Failed to create account');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: loginData.email,
        password: loginData.password
      });

      if (signInError) {
        throw signInError;
      }

      if (data.session?.access_token) {
        onAuthSuccess(data.session.access_token);
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Failed to log in');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-green-100 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <TrendingUp className="w-10 h-10 text-green-700" />
            <h1 className="text-3xl text-green-700">TrialVision</h1>
          </div>
          <p className="text-gray-600">Clinical Trial Feasibility Assessment Platform</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Welcome</CardTitle>
            <CardDescription>Sign in or create an account to get started</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="you@example.com"
                      value={loginData.email}
                      onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Password</Label>
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="••••••••"
                      value={loginData.password}
                      onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                      required
                    />
                  </div>
                  {error && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? 'Logging in...' : 'Log In'}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-legal-name">Medical Professional Legal Name *</Label>
                    <Input
                      id="signup-legal-name"
                      type="text"
                      placeholder="Dr. Jane Smith"
                      value={signupData.legalName}
                      onChange={(e) => setSignupData({ ...signupData, legalName: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-birth-date">Birth Date *</Label>
                    <Input
                      id="signup-birth-date"
                      type="date"
                      value={signupData.birthDate}
                      onChange={(e) => setSignupData({ ...signupData, birthDate: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-employment">Place of Employment *</Label>
                    <Input
                      id="signup-employment"
                      type="text"
                      placeholder="City General Hospital"
                      value={signupData.placeOfEmployment}
                      onChange={(e) => setSignupData({ ...signupData, placeOfEmployment: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-license">License Received Date *</Label>
                    <Input
                      id="signup-license"
                      type="date"
                      value={signupData.licenseReceived}
                      onChange={(e) => setSignupData({ ...signupData, licenseReceived: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-degree">Degree *</Label>
                    <Input
                      id="signup-degree"
                      type="text"
                      placeholder="MD, PhD, etc."
                      value={signupData.degree}
                      onChange={(e) => setSignupData({ ...signupData, degree: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email *</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="you@example.com"
                      value={signupData.email}
                      onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password *</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="••••••••"
                      value={signupData.password}
                      onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                      required
                      minLength={6}
                    />
                  </div>
                  {error && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? 'Creating account...' : 'Create Account'}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-gray-500 mt-4">
          For prototyping purposes only. Not for production use with sensitive data.
        </p>
      </div>
    </div>
  );
}
