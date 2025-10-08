import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Mail, CheckCircle, ArrowLeft } from 'lucide-react';
import { GraduationCap } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';

const OTPVerificationPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const storedEmail = localStorage.getItem('verificationEmail');
    if (storedEmail) {
      setEmail(storedEmail);
    } else {
      navigate('/register');
    }
  }, [navigate]);

  const handleResendEmail = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
      });

      if (error) {
        toast.error(error.message || 'Failed to resend confirmation email');
      } else {
        toast.success('Confirmation email sent! Please check your inbox.');
      }
    } catch (error) {
      toast.error('Failed to resend email');
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
      {/* Left Side - Email Illustration */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 lg:p-16">
        <div className="max-w-md w-full text-center space-y-8">
          {/* Email Illustration */}
          <div className="relative">
            <div className="w-80 h-80 mx-auto rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
              <div className="relative">
                {/* Envelope */}
                <div className="w-48 h-36 bg-card rounded-lg flex items-center justify-center shadow-xl border-2 border-border">
                  <Mail className="w-20 h-20 text-primary" />
                </div>
                
                {/* Check Mark */}
                <div className="absolute -right-4 -top-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-500 rounded-full flex items-center justify-center shadow-lg">
                    <CheckCircle className="w-10 h-10 text-white" fill="currentColor" />
                  </div>
                </div>
                
                {/* Decorative Elements */}
                <div className="absolute -left-12 top-8 w-3 h-3 bg-primary/40 rounded-full animate-pulse"></div>
                <div className="absolute -right-16 top-16 w-2 h-2 bg-accent/60 rounded-full animate-pulse delay-100"></div>
                <div className="absolute -left-8 -bottom-4 w-2 h-2 bg-primary/30 rounded-full animate-pulse delay-200"></div>
                <div className="absolute right-12 -bottom-2 w-3 h-3 bg-accent/40 rounded-full animate-pulse delay-300"></div>
              </div>
            </div>
          </div>
          
          {/* Text Content */}
          <div className="space-y-4">
            <h2 className="text-4xl font-bold text-foreground">
              Email Sent Successfully
            </h2>
            <p className="text-lg text-muted-foreground font-medium">
              Check your inbox to verify your account
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

      {/* Right Side - Confirmation Message */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="bg-card rounded-2xl shadow-xl p-8 space-y-8">
            {/* Header */}
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center gap-2 mb-6">
                <span className="text-2xl font-bold text-foreground">CRYPTIQ</span>
                <GraduationCap className="w-6 h-6 text-foreground" />
              </div>
              
              <div className="w-20 h-20 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Mail className="w-10 h-10 text-primary" />
              </div>
              
              <h3 className="text-3xl font-bold text-foreground">
                Check Your Email
              </h3>
              
              <div className="space-y-2">
                <p className="text-muted-foreground text-base">
                  We've sent a confirmation link to
                </p>
                <p className="text-base font-semibold text-primary break-all px-4">
                  {email}
                </p>
                <p className="text-sm text-muted-foreground pt-2">
                  Click the link in the email to verify your account and complete your registration.
                </p>
              </div>
            </div>

            {/* Instructions */}
            <div className="bg-muted/30 rounded-lg p-4 space-y-3">
              <p className="text-sm font-semibold text-foreground">Didn't receive the email?</p>
              <ul className="text-xs text-muted-foreground space-y-2 pl-4">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>Check your spam or junk folder</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>Make sure the email address is correct</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>Wait a few minutes and check again</span>
                </li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button
                onClick={handleResendEmail}
                disabled={loading}
                className="w-full h-12 text-base font-medium bg-accent hover:bg-accent/90 text-accent-foreground"
              >
                {loading ? 'SENDING...' : 'RESEND CONFIRMATION EMAIL'}
              </Button>

              <Button
                onClick={handleChangeEmail}
                disabled={loading}
                variant="outline"
                className="w-full h-12 text-base font-medium"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                CHANGE EMAIL ADDRESS
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