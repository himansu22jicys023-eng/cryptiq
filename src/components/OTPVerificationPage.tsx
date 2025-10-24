import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { MailCheck, ArrowLeft, Loader2, GraduationCap } from 'lucide-react'; // Added Loader2 and GraduationCap
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card" // Import Card components
import { supabase } from '@/integrations/supabase/client';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';

const OTPVerificationPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false); // Changed to 'loading' for consistency
  const navigate = useNavigate();

  useEffect(() => {
    // Retrieve email from localStorage, set by RegisterPage
    const storedEmail = localStorage.getItem('verificationEmail');
    if (storedEmail) {
      setEmail(storedEmail);
    } else {
      // If no email found, redirect back to register as we can't resend
      toast.error("No email found for verification. Please register again.");
      navigate('/register');
    }
  }, [navigate]);

  const handleResendEmail = async () => {
    setLoading(true);
    try {
      // Use resend to send the verification email again for 'signup' type
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
        options: {
           // Redirect URL after clicking the link in the *new* email
           emailRedirectTo: `${window.location.origin}/dashboard`,
        }
      });

      if (error) {
        throw error; // Let the catch block handle it
      } else {
        toast.success('Verification email resent! Please check your inbox.');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to resend confirmation email');
    } finally {
      setLoading(false);
    }
  };

  const handleChangeEmail = () => {
    // Clear the stored email and go back to register
    localStorage.removeItem('verificationEmail');
    navigate('/register');
  };

  return (
    // Use the muted background consistent with Login/Register
    <div className="flex items-center justify-center min-h-screen bg-muted/40 p-4">
       {/* Use a standard Card component */}
      <Card className="max-w-md w-full">
        <CardHeader className="text-center space-y-4">
           {/* Simple Icon Header */}
           <div className="flex justify-center mb-4">
             <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center border border-primary/20">
              <MailCheck className="w-10 h-10 text-primary" />
             </div>
          </div>
          <CardTitle className="text-3xl font-bold">Check your email</CardTitle>
          <CardDescription>
            We've sent a verification link to <br />
            <span className="font-medium text-foreground break-all">{email}</span>.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground text-center px-4">
            Click the link in the email to verify your account and complete your registration. Remember to check your spam folder!
          </p>
           {/* Resend Button */}
           <Button
            onClick={handleResendEmail}
            disabled={loading}
            className="w-full" // Standard button style
          >
            {loading ? (
               <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            Resend Verification Email
          </Button>
        </CardContent>

        <CardFooter className="flex-col gap-4 pt-4 border-t">
           {/* Change Email Button */}
           <Button
            onClick={handleChangeEmail}
            disabled={loading}
            variant="outline" // Outline style
            className="w-full"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Use a different email
          </Button>

          {/* Back to Login Link */}
          <div className="text-center text-sm">
            <span className="text-muted-foreground">Already verified? </span>
            <Link to="/login" className="text-primary hover:underline font-medium">
              Sign In
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default OTPVerificationPage;