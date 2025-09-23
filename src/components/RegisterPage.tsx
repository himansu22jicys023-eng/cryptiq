import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { GraduationCap, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import cryptiqIllustration from '@/assets/cryptiq-learning-illustration.png';

const RegisterPage = () => {
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const { signUp, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Register form submitted with:', { fullName, username, email, password: '***' });
    
    if (!fullName || !username || !email || !password || !confirmPassword) {
      toast({
        title: "Error",
        description: "Please fill in all fields.",
        variant: "destructive",
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: "Error", 
        description: "Passwords do not match.",
        variant: "destructive",
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters long.",
        variant: "destructive", 
      });
      return;
    }

    setLoading(true);
    const { error } = await signUp(email, password, fullName, username);
    
    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      navigate('/verify-otp', { state: { email } });
    }
    setLoading(false);
  };
  return (
    <div className="min-h-screen bg-cryptiq-mint flex overflow-hidden">
      {/* Left Side - Brand and Illustration */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 lg:p-16">
        <div className="max-w-md w-full text-center space-y-8">
          {/* Logo and Tagline */}
          <div className="space-y-4">
            <h1 className="text-6xl font-bold text-cryptiq-dark">
              Crypt<span className="font-normal">IQ</span>
            </h1>
            <p className="text-xl text-cryptiq-dark font-medium">
              Assess. Practice. Master.
            </p>
          </div>
          
          {/* Illustration */}
          <div className="relative">
            <div className="w-80 h-80 mx-auto rounded-full bg-gradient-to-br from-green-200/50 to-green-300/30 flex items-center justify-center">
              <img 
                src={cryptiqIllustration} 
                alt="CryptIQ Learning Platform Illustration"
                className="w-150 h-150 object-contain" // Adjusted to fit better, assuming original w-150 was a custom or error; use standard Tailwind
              />
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Register Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl p-6 space-y-4"> {/* Reduced padding to p-6 to save space */}
            {/* Header */}
            <div className="text-center space-y-2">
              <div className="flex items-center justify-center gap-2 mb-4">
                <span className="text-2xl font-bold text-cryptiq-dark">CRYPTIQ</span>
                <GraduationCap className="w-6 h-6 text-cryptiq-dark" />
              </div>
              <p className="text-cryptiq-muted text-lg">Create your CryptIQ account</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <Input
                  type="text"
                  placeholder="Full Name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full h-11 px-4 border-0 border-b border-gray-300 rounded-none bg-transparent focus:border-cryptiq-green focus:ring-0 placeholder:text-cryptiq-muted"
                  required
                />
              </div>
              
              <div>
                <Input
                  type="text"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full h-11 px-4 border-0 border-b border-gray-300 rounded-none bg-transparent focus:border-cryptiq-green focus:ring-0 placeholder:text-cryptiq-muted"
                  required
                />
              </div>

              <div>
                <Input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-11 px-4 border-0 border-b border-gray-300 rounded-none bg-transparent focus:border-cryptiq-green focus:ring-0 placeholder:text-cryptiq-muted"
                  required
                />
              </div>

              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-11 px-4 pr-12 border-0 border-b border-gray-300 rounded-none bg-transparent focus:border-cryptiq-green focus:ring-0 placeholder:text-cryptiq-muted"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-0 top-1/2 -translate-y-1/2 p-2 text-cryptiq-muted hover:text-cryptiq-green"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              <div className="relative">
                <Input
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full h-11 px-4 pr-12 border-0 border-b border-gray-300 rounded-none bg-transparent focus:border-cryptiq-green focus:ring-0 placeholder:text-cryptiq-muted"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-0 top-1/2 -translate-y-1/2 p-2 text-cryptiq-muted hover:text-cryptiq-green"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              
              <Button 
                type="submit"
                variant="cryptiq" 
                size="lg" 
                className="w-full h-11 text-base font-medium"
                disabled={loading}
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </Button>
              
              <div className="relative my-4"> {/* Reduced my-4 */}
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-cryptiq-muted">or</span>
                </div>
              </div>
              
              <Button 
                variant="google" 
                size="lg" 
                className="w-full h-11 text-base font-medium gap-3"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Sign Up With Google
              </Button>
              
              <div className="text-center pt-3">
                <span className="text-cryptiq-muted">Already have an account? </span>
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="text-cryptiq-green hover:underline font-medium"
                >
                  Sign In
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;