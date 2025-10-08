import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Shield, CheckCircle } from 'lucide-react';
import { GraduationCap } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';

const OTPVerificationPage = () => {
  const [otp, setOtp] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleVerify = async () => {
    if (otp.length !== 6) {
      toast.error('Please enter a valid 6-digit code');
      return;
    }

    setLoading(true);
    try {
      const storedEmail = localStorage.getItem('verificationEmail');
      if (!storedEmail) {
        toast.error('Email not found. Please sign up again.');
        navigate('/register');
        return;
      }

      const { data, error } = await supabase.auth.verifyOtp({
        email: storedEmail,
        token: otp,
        type: 'email',
      });

      if (error) {
        toast.error(error.message || 'Invalid verification code');
        return;
      }

      toast.success('Email verified successfully!');
      localStorage.removeItem('verificationEmail');
      navigate('/dashboard');
    } catch (error) {
      toast.error('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    const storedEmail = localStorage.getItem('verificationEmail');
    if (!storedEmail) {
      toast.error('Email not found. Please sign up again.');
      navigate('/register');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: storedEmail,
      });

      if (error) {
        toast.error(error.message || 'Failed to resend code');
        return;
      }

      toast.success('Verification code sent to your email');
    } catch (error) {
      toast.error('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleChangeEmail = () => {
    localStorage.removeItem('verificationEmail');
    navigate('/register');
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Side - Security Illustration */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 lg:p-16">
        <div className="max-w-md w-full text-center space-y-8">
          {/* Security Illustration */}
          <div className="relative">
            <div className="w-80 h-80 mx-auto rounded-full bg-gradient-to-br from-green-200/50 to-green-300/30 flex items-center justify-center">
              <div className="relative">
                {/* Person Icon */}
                <div className="w-32 h-32 bg-card rounded-full flex items-center justify-center mb-4">
                  <div className="w-16 h-16 bg-foreground rounded-full flex items-center justify-center">
                    <div className="w-8 h-8 bg-card rounded-full"></div>
                  </div>
                </div>
                
                {/* Security Shield */}
                <div className="absolute -right-8 -top-4">
                  <div className="w-24 h-28 bg-gradient-to-b from-green-400 to-green-500 rounded-t-full rounded-b-lg flex items-center justify-center shadow-lg">
                    <Shield className="w-12 h-12 text-white" fill="currentColor" />
                  </div>
                  <div className="absolute bottom-2 right-2">
                    <CheckCircle className="w-6 h-6 text-green-600" fill="white" />
                  </div>
                </div>
                
                {/* Decorative Elements */}
                <div className="absolute -left-12 top-8 w-2 h-2 bg-blue-400 rounded-full"></div>
                <div className="absolute -right-16 top-16 w-3 h-3 bg-blue-300 rounded-full"></div>
                <div className="absolute -left-8 -bottom-4 w-2 h-2 bg-blue-500 rounded-full"></div>
                <div className="absolute right-12 -bottom-2 w-2 h-2 bg-blue-400 rounded-full"></div>
              </div>
            </div>
          </div>
          
          {/* Text Content */}
          <div className="space-y-4">
            <h2 className="text-4xl font-bold text-foreground">
              Your Security Matters
            </h2>
            <p className="text-lg text-muted-foreground font-medium">
              A verification step to protect your account
            </p>
          </div>
          
          {/* Dots Indicator */}
          <div className="flex justify-center space-x-2">
            <div className="w-2 h-2 bg-foreground rounded-full"></div>
            <div className="w-2 h-2 bg-muted-foreground rounded-full"></div>
            <div className="w-2 h-2 bg-muted-foreground rounded-full"></div>
            <div className="w-2 h-2 bg-muted-foreground rounded-full"></div>
          </div>
        </div>
      </div>

      {/* Right Side - OTP Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="bg-card rounded-2xl shadow-xl p-8 space-y-8">
            {/* Header */}
            <div className="text-center space-y-2">
              <div className="flex items-center justify-center gap-2 mb-6">
                <span className="text-2xl font-bold text-foreground">CRYPTIQ</span>
                <GraduationCap className="w-6 h-6 text-foreground" />
              </div>
              <h3 className="text-3xl font-bold text-foreground mb-4">
                Check Your Email
              </h3>
              <p className="text-muted-foreground text-base">
                We've sent a 6-digit code to your registered email address.
              </p>
            </div>

            {/* OTP Input */}
            <div className="space-y-6">
              <div className="flex justify-center">
                <InputOTP
                  maxLength={6}
                  value={otp}
                  onChange={(value) => setOtp(value)}
                >
                  <InputOTPGroup className="gap-3">
                    <InputOTPSlot 
                      index={0} 
                      className="w-14 h-14 text-xl font-semibold border-2 border-border rounded-lg focus:border-accent focus:ring-2 focus:ring-accent/20" 
                    />
                    <InputOTPSlot 
                      index={1} 
                      className="w-14 h-14 text-xl font-semibold border-2 border-border rounded-lg focus:border-accent focus:ring-2 focus:ring-accent/20" 
                    />
                    <InputOTPSlot 
                      index={2} 
                      className="w-14 h-14 text-xl font-semibold border-2 border-border rounded-lg focus:border-accent focus:ring-2 focus:ring-accent/20" 
                    />
                    <InputOTPSlot 
                      index={3} 
                      className="w-14 h-14 text-xl font-semibold border-2 border-border rounded-lg focus:border-accent focus:ring-2 focus:ring-accent/20" 
                    />
                    <InputOTPSlot 
                      index={4} 
                      className="w-14 h-14 text-xl font-semibold border-2 border-border rounded-lg focus:border-accent focus:ring-2 focus:ring-accent/20" 
                    />
                    <InputOTPSlot 
                      index={5} 
                      className="w-14 h-14 text-xl font-semibold border-2 border-border rounded-lg focus:border-accent focus:ring-2 focus:ring-accent/20" 
                    />
                  </InputOTPGroup>
                </InputOTP>
              </div>

              {/* Action Links */}
              <div className="flex justify-between text-sm">
                <button 
                  onClick={handleResendCode}
                  disabled={loading}
                  className="text-muted-foreground hover:text-accent hover:underline font-medium disabled:opacity-50"
                >
                  Resend Code
                </button>
                <button 
                  onClick={handleChangeEmail}
                  disabled={loading}
                  className="text-muted-foreground hover:text-accent hover:underline font-medium disabled:opacity-50"
                >
                  Change Email
                </button>
              </div>

              {/* Verify Button */}
              <Button 
                className="w-full h-12 text-base font-medium bg-accent hover:bg-accent/90 text-accent-foreground"
                onClick={handleVerify}
                disabled={otp.length !== 6 || loading}
              >
                {loading ? 'VERIFYING...' : 'VERIFY ACCOUNT'}
              </Button>
            </div>

            {/* Footer */}
            <div className="text-center pt-4">
              <span className="text-muted-foreground">Already verified? </span>
              <Link to="/login" className="text-accent hover:underline font-medium">
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OTPVerificationPage;