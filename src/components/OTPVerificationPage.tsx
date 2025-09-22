import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Shield, CheckCircle } from 'lucide-react';

const OTPVerificationPage = () => {
  const [otp, setOtp] = useState('');

  const handleVerify = () => {
    // Handle OTP verification logic here
    console.log('Verifying OTP:', otp);
  };

  const handleResendCode = () => {
    // Handle resend code logic
    console.log('Resending code...');
  };

  return (
    <div className="min-h-screen bg-cryptiq-mint flex">
      {/* Left Side - Security Illustration */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 lg:p-16">
        <div className="max-w-md w-full text-center space-y-8">
          {/* Security Illustration */}
          <div className="relative">
            <div className="w-80 h-80 mx-auto rounded-full bg-gradient-to-br from-green-200/50 to-green-300/30 flex items-center justify-center">
              <div className="relative">
                {/* Person Icon */}
                <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center mb-4">
                  <div className="w-16 h-16 bg-cryptiq-dark rounded-full flex items-center justify-center">
                    <div className="w-8 h-8 bg-white rounded-full"></div>
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
            <h2 className="text-4xl font-bold text-cryptiq-dark">
              Your Security Matters
            </h2>
            <p className="text-lg text-cryptiq-dark/70 font-medium">
              A verification step to protect your account
            </p>
          </div>
          
          {/* Dots Indicator */}
          <div className="flex justify-center space-x-2">
            <div className="w-2 h-2 bg-cryptiq-dark rounded-full"></div>
            <div className="w-2 h-2 bg-cryptiq-dark/30 rounded-full"></div>
            <div className="w-2 h-2 bg-cryptiq-dark/30 rounded-full"></div>
            <div className="w-2 h-2 bg-cryptiq-dark/30 rounded-full"></div>
          </div>
        </div>
      </div>

      {/* Right Side - OTP Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl p-8 space-y-8">
            {/* Header */}
            <div className="text-center space-y-2">
              <div className="flex items-center justify-center gap-2 mb-6">
                <span className="text-2xl font-bold text-cryptiq-dark">CRYPTIQ</span>
              </div>
              <h3 className="text-3xl font-bold text-cryptiq-dark mb-4">
                Check Your Email
              </h3>
              <p className="text-cryptiq-muted text-base">
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
                      className="w-14 h-14 text-xl font-semibold border-2 border-gray-200 rounded-lg focus:border-cryptiq-green focus:ring-2 focus:ring-cryptiq-green/20" 
                    />
                    <InputOTPSlot 
                      index={1} 
                      className="w-14 h-14 text-xl font-semibold border-2 border-gray-200 rounded-lg focus:border-cryptiq-green focus:ring-2 focus:ring-cryptiq-green/20" 
                    />
                    <InputOTPSlot 
                      index={2} 
                      className="w-14 h-14 text-xl font-semibold border-2 border-gray-200 rounded-lg focus:border-cryptiq-green focus:ring-2 focus:ring-cryptiq-green/20" 
                    />
                    <InputOTPSlot 
                      index={3} 
                      className="w-14 h-14 text-xl font-semibold border-2 border-gray-200 rounded-lg focus:border-cryptiq-green focus:ring-2 focus:ring-cryptiq-green/20" 
                    />
                    <InputOTPSlot 
                      index={4} 
                      className="w-14 h-14 text-xl font-semibold border-2 border-gray-200 rounded-lg focus:border-cryptiq-green focus:ring-2 focus:ring-cryptiq-green/20" 
                    />
                    <InputOTPSlot 
                      index={5} 
                      className="w-14 h-14 text-xl font-semibold border-2 border-gray-200 rounded-lg focus:border-cryptiq-green focus:ring-2 focus:ring-cryptiq-green/20" 
                    />
                  </InputOTPGroup>
                </InputOTP>
              </div>

              {/* Action Links */}
              <div className="flex justify-between text-sm">
                <button 
                  onClick={handleResendCode}
                  className="text-cryptiq-muted hover:text-cryptiq-green hover:underline font-medium"
                >
                  Resend Code
                </button>
                <button className="text-cryptiq-muted hover:text-cryptiq-green hover:underline font-medium">
                  Change Email
                </button>
              </div>

              {/* Verify Button */}
              <Button 
                variant="cryptiq" 
                size="lg" 
                className="w-full h-12 text-base font-medium"
                onClick={handleVerify}
                disabled={otp.length !== 6}
              >
                VERIFY ACCOUNT
              </Button>
            </div>

            {/* Footer */}
            <div className="text-center pt-4">
              <span className="text-cryptiq-muted">Are you new? </span>
              <a href="#" className="text-cryptiq-green hover:underline font-medium">
                Create an Account
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OTPVerificationPage;