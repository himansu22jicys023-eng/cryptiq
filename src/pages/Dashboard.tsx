import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, Flame, BookOpen, FlaskConical, Gift, TrendingUp, Target, Award } from 'lucide-react';
import cryptiqIllustration from '@/assets/cryptiq-learning-illustration.png';
import { Progress } from '@/components/ui/progress';

const Dashboard = () => {
  const { user } = useAuth();

  const stats = [
    { title: 'Quizzes Completed', value: '4', total: '5', icon: BookOpen, color: 'text-primary' },
    { title: 'Labs Finished', value: '3', total: '4', icon: FlaskConical, color: 'text-accent' },
    { title: 'Rewards Earned', value: '10', unit: 'coins', icon: Gift, color: 'text-orange-500' },
  ];

  const leaderboardData = [
    { rank: 1, name: 'Yuvraj', xp: 4500, isUser: false },
    { rank: 2, name: 'Vishal', xp: 4200, isUser: false },
    { rank: 3, name: user?.email?.split('@')[0] || 'You', xp: 3000, isUser: true },
    { rank: 4, name: 'Priya', xp: 2800, isUser: false },
    { rank: 5, name: 'Arjun', xp: 2500, isUser: false },
  ];

  const xpProgress = (3000 / 4000) * 100;

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Welcome Header */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold text-foreground">
          Welcome back, {user?.email?.split('@')[0] || 'User'}! 👋
        </h1>
        <p className="text-muted-foreground text-lg">
          Track your progress and keep learning
        </p>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Profile & Stats */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Card */}
          <Card className="border-2 overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-start gap-6">
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center flex-shrink-0">
                  <img 
                    src={cryptiqIllustration} 
                    alt="Profile"
                    className="w-16 h-16 object-contain"
                  />
                </div>
                <div className="flex-1 space-y-4">
                  <div>
                    <h2 className="text-2xl font-bold text-foreground">
                      {user?.email?.split('@')[0] || 'User'}
                    </h2>
                    <p className="text-sm text-muted-foreground">{user?.email}</p>
                  </div>
                  
                  {/* XP Progress */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-foreground font-medium flex items-center gap-2">
                        <Flame className="w-4 h-4 text-orange-500" />
                        Level Progress
                      </span>
                      <span className="text-muted-foreground">3000 / 4000 XP</span>
                    </div>
                    <Progress value={xpProgress} className="h-2" />
                  </div>

                  {/* Quick Stats */}
                  <div className="flex items-center gap-6 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <Trophy className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs">Rank</p>
                        <p className="font-semibold text-foreground">#3</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center">
                        <TrendingUp className="w-4 h-4 text-accent" />
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs">Streak</p>
                        <p className="font-semibold text-foreground">7 days</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {stats.map((stat, index) => (
              <Card key={index} className="border-2 hover:border-primary/50 transition-colors">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center`}>
                      <stat.icon className={`w-6 h-6 ${stat.color}`} />
                    </div>
                    {stat.total && (
                      <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded-full">
                        {stat.value}/{stat.total}
                      </span>
                    )}
                  </div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">
                    {stat.title}
                  </h3>
                  <p className="text-3xl font-bold text-foreground">
                    {stat.value}
                    {stat.unit && <span className="text-lg text-muted-foreground ml-1">{stat.unit}</span>}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Right Column - Leaderboard */}
        <div className="lg:col-span-1">
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5 text-primary" />
                Leaderboard
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {leaderboardData.map((entry) => (
                <div
                  key={entry.rank}
                  className={`flex items-center justify-between p-4 rounded-xl transition-all ${
                    entry.isUser
                      ? 'bg-primary/10 border-2 border-primary/50'
                      : 'bg-muted/50 hover:bg-muted'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                        entry.rank === 1
                          ? 'bg-yellow-500/20 text-yellow-600'
                          : entry.rank === 2
                          ? 'bg-slate-400/20 text-slate-600'
                          : entry.rank === 3
                          ? 'bg-orange-500/20 text-orange-600'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {entry.rank}
                    </div>
                    <span className={`font-medium ${entry.isUser ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {entry.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className={`font-semibold ${entry.isUser ? 'text-primary' : 'text-foreground'}`}>
                      {entry.xp}
                    </span>
                    <span className="text-xs text-muted-foreground">XP</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;