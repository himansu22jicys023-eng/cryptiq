import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GraduationCap, User, BookOpen, Award, Settings } from 'lucide-react';

const Dashboard = () => {
  const { user, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-cryptiq-mint">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-cryptiq-dark">CRYPTIQ</span>
              <GraduationCap className="w-6 h-6 text-cryptiq-dark" />
            </div>
            <div className="flex items-center gap-4">
              <span className="text-cryptiq-muted">Welcome, {user?.user_metadata?.full_name || user?.email}</span>
              <Button variant="outline" onClick={signOut}>
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Welcome Section */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold text-cryptiq-dark">
              Welcome to CryptIQ
            </h1>
            <p className="text-xl text-cryptiq-dark/70">
              Assess. Practice. Master your cryptographic knowledge.
            </p>
          </div>

          {/* Dashboard Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Profile Card */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5 text-cryptiq-green" />
                  Profile
                </CardTitle>
                <CardDescription>
                  Manage your account settings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm text-cryptiq-muted">
                    <strong>Email:</strong> {user?.email}
                  </p>
                  <p className="text-sm text-cryptiq-muted">
                    <strong>Name:</strong> {user?.user_metadata?.full_name || 'Not set'}
                  </p>
                  <p className="text-sm text-cryptiq-muted">
                    <strong>Username:</strong> {user?.user_metadata?.username || 'Not set'}
                  </p>
                </div>
                <Button variant="outline" className="w-full mt-4">
                  Edit Profile
                </Button>
              </CardContent>
            </Card>

            {/* Courses Card */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-cryptiq-green" />
                  Courses
                </CardTitle>
                <CardDescription>
                  Explore cryptography courses
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-cryptiq-dark">0</p>
                    <p className="text-sm text-cryptiq-muted">Courses Enrolled</p>
                  </div>
                  <Button variant="cryptiq" className="w-full">
                    Browse Courses
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Achievements Card */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-cryptiq-green" />
                  Achievements
                </CardTitle>
                <CardDescription>
                  Track your progress
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-cryptiq-dark">0</p>
                    <p className="text-sm text-cryptiq-muted">Badges Earned</p>
                  </div>
                  <Button variant="outline" className="w-full">
                    View All
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-cryptiq-green" />
                Quick Actions
              </CardTitle>
              <CardDescription>
                Get started with CryptIQ
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
                  <BookOpen className="w-6 h-6 text-cryptiq-green" />
                  <span>Take Assessment</span>
                </Button>
                <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
                  <User className="w-6 h-6 text-cryptiq-green" />
                  <span>Complete Profile</span>
                </Button>
                <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
                  <Award className="w-6 h-6 text-cryptiq-green" />
                  <span>View Progress</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;