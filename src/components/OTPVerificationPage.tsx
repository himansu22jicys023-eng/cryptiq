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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Left Side - Illustration */}
        <div className="flex flex-col items-center justify-center space-y-8">
          {/* Animated Email Icon */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-accent via-primary to-accent opacity-20 blur-3xl rounded-full animate-pulse"></div>
            <div className="relative w-72 h-72 md:w-96 md:h-96 bg-card/50 backdrop-blur-sm rounded-3xl flex items-center justify-center border-2 border-accent/20 shadow-2xl">
              {/* Mail Envelope */}
              <div className="relative">
                <div className="w-40 h-32 bg-gradient-to-br from-card to-card/80 rounded-2xl flex items-center justify-center shadow-xl border-2 border-border transform hover:scale-105 transition-transform duration-300">
                  <Mail className="w-16 h-16 text-accent" />
                </div>
                
                {/* Success Check Badge */}
                <div className="absolute -right-6 -top-6 animate-bounce">
                  <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-2xl ring-4 ring-green-400/20">
                    <CheckCircle className="w-12 h-12 text-white" fill="currentColor" />
                  </div>
                </div>
                
                {/* Floating Particles */}
                <div className="absolute -left-16 top-4 w-4 h-4 bg-accent rounded-full animate-ping"></div>
                <div className="absolute -right-20 top-12 w-3 h-3 bg-primary rounded-full animate-pulse"></div>
                <div className="absolute -left-12 -bottom-8 w-3 h-3 bg-accent/60 rounded-full animate-bounce"></div>
                <div className="absolute right-16 -bottom-4 w-4 h-4 bg-primary/60 rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>
          
          {/* Text Content */}
          <div className="space-y-4 text-center">
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-accent via-primary to-accent bg-clip-text text-transparent animate-gradient">
              Email Sent!
            </h1>
            <p className="text-xl text-muted-foreground font-medium max-w-md">
              Check your inbox and verify your account to get started
            </p>
          </div>
          
          {/* Progress Dots */}
          <div className="flex gap-3">
            <div className="w-3 h-3 rounded-full bg-accent shadow-lg shadow-accent/50"></div>
            <div className="w-3 h-3 rounded-full bg-muted-foreground/40"></div>
            <div className="w-3 h-3 rounded-full bg-muted-foreground/40"></div>
            <div className="w-3 h-3 rounded-full bg-muted-foreground/40"></div>
          </div>
        </div>

        {/* Right Side - Verification Card */}
        <div className="flex items-center justify-center">
          <div className="w-full max-w-md">
            <div className="bg-card/80 backdrop-blur-xl rounded-3xl shadow-2xl border-2 border-border/50 p-8 md:p-10 space-y-8">
              {/* Header */}
              <div className="text-center space-y-6">
                <div className="flex items-center justify-center gap-2 mb-6">
                  <span className="text-3xl font-bold bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">CRYPTIQ</span>
                  <GraduationCap className="w-8 h-8 text-accent" />
                </div>
                
                <div className="w-24 h-24 mx-auto bg-gradient-to-br from-accent/20 to-primary/20 rounded-3xl flex items-center justify-center mb-6 ring-4 ring-accent/10 shadow-xl">
                  <Mail className="w-12 h-12 text-accent" />
                </div>
                
                <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                  Check Your Email
                </h2>
                
                <div className="space-y-3">
                  <p className="text-muted-foreground">
                    We've sent a confirmation link to
                  </p>
                  <div className="bg-accent/10 rounded-xl p-4 border border-accent/20">
                    <p className="text-base font-semibold text-accent break-all">
                      {email}
                    </p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Click the link in the email to verify your account and start learning!
                  </p>
                </div>
              </div>

              {/* Instructions Card */}
              <div className="bg-muted/30 backdrop-blur-sm rounded-2xl p-5 space-y-3 border border-border/50">
                <p className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <span className="text-accent">💡</span>
                  Didn't receive the email?
                </p>
                <ul className="text-xs text-muted-foreground space-y-2 pl-4">
                  <li className="flex items-start gap-2">
                    <span className="text-accent mt-0.5 font-bold">•</span>
                    <span>Check your spam or junk folder</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-accent mt-0.5 font-bold">•</span>
                    <span>Verify the email address is correct</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-accent mt-0.5 font-bold">•</span>
                    <span>Wait a few minutes for delivery</span>
                  </li>
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <Button
                  onClick={handleResendEmail}
                  disabled={loading}
                  className="w-full h-14 text-base font-semibold bg-gradient-to-r from-accent to-accent/80 hover:from-accent/90 hover:to-accent/70 text-accent-foreground shadow-lg shadow-accent/20 transition-all transform hover:scale-[1.02]"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      SENDING...
                    </span>
                  ) : (
                    'RESEND CONFIRMATION EMAIL'
                  )}
                </Button>

                <Button
                  onClick={handleChangeEmail}
                  disabled={loading}
                  variant="outline"
                  className="w-full h-14 text-base font-semibold border-2 hover:bg-accent/5 hover:border-accent/50 transition-all"
                >
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  CHANGE EMAIL ADDRESS
                </Button>
              </div>

              {/* Footer */}
              <div className="text-center pt-4 border-t border-border/50">
                <span className="text-muted-foreground">Already verified? </span>
                <Link to="/login" className="text-accent hover:text-accent/80 font-semibold hover:underline transition-colors">
                  Sign In Here
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OTPVerificationPage;