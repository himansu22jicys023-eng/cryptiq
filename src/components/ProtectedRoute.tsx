import React, { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean; // true for dashboard, false for login/register
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireAuth = true 
}) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      if (requireAuth && !user) {
        navigate('/login');
      } else if (!requireAuth && user) {
        navigate('/dashboard');
      }
    }
  }, [user, loading, requireAuth, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-cryptiq-mint flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-4 border-cryptiq-green border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-cryptiq-dark">Loading...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;