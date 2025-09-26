import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent } from '@/components/ui/card';
import { Edit, Trophy, Flame } from 'lucide-react';
import cryptiqIllustration from '@/assets/cryptiq-learning-illustration.png';

const Dashboard = () => {
  const { user, signOut } = useAuth();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-foreground">
          Welcome, {user?.email?.split('@')[0] || 'User'}!
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Section */}
        <div className="lg:col-span-2">
          <div className="flex items-start gap-6 mb-8">
            <div className="w-32 h-32 bg-card rounded-2xl flex items-center justify-center">
              <img 
                src={cryptiqIllustration} 
                alt="Profile illustration"
                className="w-20 h-20 object-contain"
              />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-bold text-foreground">
                  {user?.email?.split('@')[0] || 'User'}
                </h2>
                <Edit className="w-4 h-4 text-accent cursor-pointer" />
              </div>
              <p className="text-muted-foreground">{user?.email}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-lg text-foreground">3000/4000 Xp</span>
                <Flame className="w-5 h-5 text-orange-500" />
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-foreground">Rank : #3</span>
                <Trophy className="w-4 h-4 text-orange-500" />
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-3 gap-4">
            <Card className="bg-accent text-accent-foreground rounded-2xl">
              <CardContent className="p-6 text-center">
                <h3 className="text-lg font-semibold mb-2">Quizzes</h3>
                <p className="text-2xl font-bold">4/5</p>
              </CardContent>
            </Card>
            <Card className="bg-accent text-accent-foreground rounded-2xl">
              <CardContent className="p-6 text-center">
                <h3 className="text-lg font-semibold mb-2">Labs</h3>
                <p className="text-2xl font-bold">3/4</p>
              </CardContent>
            </Card>
            <Card className="bg-accent text-accent-foreground rounded-2xl">
              <CardContent className="p-6 text-center">
                <h3 className="text-lg font-semibold mb-2">Rewards</h3>
                <p className="text-2xl font-bold">10 coins</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Leaderboard */}
        <div className="lg:col-span-1">
          <Card className="bg-card rounded-2xl">
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold text-foreground mb-4 text-center">
                Leaderboard
              </h3>
              <div className="space-y-3">
                <div className="bg-accent text-accent-foreground rounded-full px-4 py-3 flex justify-between items-center">
                  <span className="font-medium">1.Yuvraj</span>
                  <span className="font-semibold">200Xp</span>
                </div>
                <div className="bg-accent text-accent-foreground rounded-full px-4 py-3 flex justify-between items-center">
                  <span className="font-medium">2.Vishal</span>
                  <span className="font-semibold">200Xp</span>
                </div>
                <div className="bg-accent/50 text-accent-foreground rounded-full px-4 py-3"></div>
                <div className="bg-accent/50 text-accent-foreground rounded-full px-4 py-3"></div>
                <div className="bg-accent/50 text-accent-foreground rounded-full px-4 py-3"></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;