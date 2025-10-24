import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp"
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

const OTPVerificationPage = () => {
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  // Get email from location state
  const email = location.state?.email;

  if (!email) {
    // Redirect to login if email is not present (e.g., direct navigation)
    // We can't verify without an email
    navigate('/login');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: 'email', // This handles both 'signup' and 'magic_link' types
      });

      if (error) throw error;

      // On successful verification
      toast({
        title: "Success! 🎉",
        description: "Your email has been verified. You are now logged in.",
      });
      
      // data.session and data.user should be available
      // The AuthProvider's onAuthStateChange will handle session update
      // Navigate to the dashboard
      navigate('/dashboard');

    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Invalid or expired OTP. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setIsResending(true);
    try {
      // We use 'magiclink' here to resend a sign-in link,
      // or 'signup' if you need to resend a verification email for a new account.
      // For a simple OTP login, 'magiclink' is often used.
      const { error } = await supabase.auth.signInWithOtp({ email });
      if (error) throw error;
      toast({
        title: "Code Resent",
        description: "A new 6-digit code has been sent to your email.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to resend code. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-muted/40 p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">Check your email</CardTitle>
          <CardDescription>
            We've sent a 6-digit code to <br />
            <span className="font-medium text-foreground">{email}</span>.
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex justify-center">
              <InputOTP
                maxLength={6}
                value={otp}
                onChange={(value) => setOtp(value)}
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            </div>
            
            <Button type="submit" className="w-full" disabled={isLoading || otp.length < 6}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Verify"}
            </Button>
          </form>
        </CardContent>
        
        <CardFooter className="flex-col gap-4">
          <div className="text-center text-sm">
            <p className="text-muted-foreground">
              Didn't get a code?
              <Button 
                variant="link" 
                size="sm" 
                onClick={handleResend} 
                disabled={isResending}
                className="font-medium"
              >
                {isResending ? "Resending..." : "Resend"}
              </Button>
            </p>
          </div>
          <Button variant="outline" className="w-full" asChild>
            <Link to="/login">Back to Login</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default OTPVerificationPage;