import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ArrowRight, Lock, Mail, MessageSquare, AlertCircle, ArrowLeft, Loader2 } from 'lucide-react';
import { createPageUrl } from '../utils';

export default function PatientLogin() {
  const [step, setStep] = useState('credentials'); // credentials, mfa-selection, mfa-verify
  const [formData, setFormData] = useState({
    lastName: '',
    dob: '',
    mfaMethod: 'text',
    code: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleCredentialsSubmit = (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      if (formData.lastName && formData.dob) {
        setStep('mfa-selection');
      } else {
        setError('Please enter your last name and date of birth.');
      }
      setIsLoading(false);
    }, 800);
  };

  const handleMfaSelectionSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setStep('mfa-verify');
      setIsLoading(false);
    }, 600);
  };

  const handleVerifySubmit = (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    setTimeout(() => {
      if (formData.code === '123456') {
        window.location.href = createPageUrl('PatientDashboard');
      } else {
        setError('Invalid code. Please try again.');
      }
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="mb-8 text-center">
        <img 
          src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/user_68b4602065e9569078753897/50e1878da_DCA_Logo_Updated.png" 
          alt="DCA Pharmacy" 
          className="h-16 mx-auto mb-4"
        />
        <h1 className="text-2xl font-bold text-gray-900">Patient Portal</h1>
      </div>

      <Card className="w-full max-w-md bg-white shadow-xl border-gray-200">
        <CardHeader className="space-y-1">
          {step === 'credentials' && (
            <>
              <CardTitle className="text-2xl font-bold text-center">Sign In</CardTitle>
              <CardDescription className="text-center">
                Enter your details to access your account
              </CardDescription>
            </>
          )}
          {step === 'mfa-selection' && (
            <>
              <CardTitle className="text-2xl font-bold text-center">Verify It's You</CardTitle>
              <CardDescription className="text-center">
                We need to verify your identity
              </CardDescription>
            </>
          )}
          {step === 'mfa-verify' && (
            <>
              <CardTitle className="text-2xl font-bold text-center">Enter Code</CardTitle>
              <CardDescription className="text-center">
                We sent a code to your {formData.mfaMethod === 'text' ? 'phone' : 'email'}
              </CardDescription>
            </>
          )}
        </CardHeader>
        <CardContent>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center gap-2 text-sm">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          {step === 'credentials' && (
            <form onSubmit={handleCredentialsSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  placeholder="Enter your last name"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dob">Date of Birth</Label>
                <Input
                  id="dob"
                  type="date"
                  value={formData.dob}
                  onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                  className="h-11"
                />
              </div>
              <Button 
                type="submit" 
                className="w-full h-11 bg-[#8B1F1F] hover:bg-[#721919] text-lg mt-2"
                disabled={isLoading}
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Continue'}
              </Button>
            </form>
          )}

          {step === 'mfa-selection' && (
            <form onSubmit={handleMfaSelectionSubmit} className="space-y-6">
              <RadioGroup 
                value={formData.mfaMethod} 
                onValueChange={(val) => setFormData({ ...formData, mfaMethod: val })}
                className="space-y-3"
              >
                <div className={`flex items-center space-x-3 border p-4 rounded-lg cursor-pointer transition-all ${formData.mfaMethod === 'text' ? 'border-[#8B1F1F] bg-red-50' : 'border-gray-200 hover:bg-gray-50'}`}>
                  <RadioGroupItem value="text" id="text" />
                  <Label htmlFor="text" className="flex-1 flex items-center gap-3 cursor-pointer">
                    <div className="bg-white p-2 rounded-full border border-gray-100">
                      <MessageSquare className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">Text Message</div>
                      <div className="text-sm text-gray-500">Code sent to ***-***-1234</div>
                    </div>
                  </Label>
                </div>
                <div className={`flex items-center space-x-3 border p-4 rounded-lg cursor-pointer transition-all ${formData.mfaMethod === 'email' ? 'border-[#8B1F1F] bg-red-50' : 'border-gray-200 hover:bg-gray-50'}`}>
                  <RadioGroupItem value="email" id="email" />
                  <Label htmlFor="email" className="flex-1 flex items-center gap-3 cursor-pointer">
                    <div className="bg-white p-2 rounded-full border border-gray-100">
                      <Mail className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">Email</div>
                      <div className="text-sm text-gray-500">Code sent to ***@***.com</div>
                    </div>
                  </Label>
                </div>
              </RadioGroup>
              <div className="flex gap-3">
                <Button 
                  type="button" 
                  variant="outline"
                  className="flex-1 h-11"
                  onClick={() => setStep('credentials')}
                  disabled={isLoading}
                >
                  Back
                </Button>
                <Button 
                  type="submit" 
                  className="flex-1 h-11 bg-[#8B1F1F] hover:bg-[#721919]"
                  disabled={isLoading}
                >
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Send Code'}
                </Button>
              </div>
            </form>
          )}

          {step === 'mfa-verify' && (
            <form onSubmit={handleVerifySubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="code" className="text-center block text-gray-600">
                  Please enter the 6-digit code sent to your {formData.mfaMethod}
                </Label>
                <div className="flex justify-center">
                  <Input
                    id="code"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="h-14 text-center text-2xl tracking-widest font-mono w-48"
                    placeholder="000000"
                    maxLength={6}
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <Button 
                  type="button" 
                  variant="outline"
                  className="flex-1 h-11"
                  onClick={() => setStep('mfa-selection')}
                  disabled={isLoading}
                >
                  Back
                </Button>
                <Button 
                  type="submit" 
                  className="flex-1 h-11 bg-[#8B1F1F] hover:bg-[#721919]"
                  disabled={isLoading}
                >
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Verify & Sign In'}
                </Button>
              </div>
              <div className="text-center">
                <button type="button" className="text-sm text-[#8B1F1F] hover:underline" onClick={() => setStep('mfa-selection')}>
                  Didn't receive a code? Resend
                </button>
              </div>
            </form>
          )}
        </CardContent>
        {step === 'credentials' && (
          <CardFooter className="justify-center border-t border-gray-100 py-4 bg-gray-50/50 rounded-b-xl">
            <a href="#" onClick={(e) => { e.preventDefault(); alert('Please contact support at 1-800-DCA-HELP'); }} className="text-sm text-[#8B1F1F] hover:underline font-medium">
              Trouble signing in?
            </a>
          </CardFooter>
        )}
      </Card>
      
      <div className="mt-8 text-center text-sm text-gray-500">
        <p>&copy; {new Date().getFullYear()} DCA Pharmacy. All rights reserved.</p>
        <div className="flex gap-4 justify-center mt-2">
          <a href="#" className="hover:text-gray-900">Privacy Policy</a>
          <a href="#" className="hover:text-gray-900">Terms of Service</a>
        </div>
      </div>
    </div>
  );
}