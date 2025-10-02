import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trophy, Award, Star, Gift, Coins, CheckCircle, Lock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const achievements = [
  {
    id: 1,
    title: 'First Steps',
    description: 'Complete your first quiz',
    icon: Star,
    xp: 50,
    earned: true,
    earnedDate: '2024-01-15'
  },
  {
    id: 2,
    title: 'Quick Learner',
    description: 'Complete 5 quizzes',
    icon: Award,
    xp: 100,
    earned: true,
    earnedDate: '2024-01-20'
  },
  {
    id: 3,
    title: 'Lab Expert',
    description: 'Complete 3 practical labs',
    icon: Trophy,
    xp: 150,
    earned: true,
    earnedDate: '2024-01-25'
  },
  {
    id: 4,
    title: 'Knowledge Master',
    description: 'Score 90% or higher in 3 quizzes',
    icon: Star,
    xp: 200,
    earned: true,
    earnedDate: '2024-02-01'
  },
  {
    id: 5,
    title: 'DeFi Pioneer',
    description: 'Complete all DeFi-related content',
    icon: Award,
    xp: 250,
    earned: false,
    locked: false
  },
  {
    id: 6,
    title: 'Blockchain Guru',
    description: 'Complete all quizzes and labs',
    icon: Trophy,
    xp: 500,
    earned: false,
    locked: true
  }
];

const redeemableRewards = [
  {
    id: 1,
    title: 'CryptIQ Certification',
    description: 'Official blockchain fundamentals certificate',
    cost: 1000,
    icon: Award,
    available: false
  },
  {
    id: 2,
    title: 'Premium Course Access',
    description: '30 days of advanced content',
    cost: 500,
    icon: Gift,
    available: false
  },
  {
    id: 3,
    title: 'Exclusive NFT Badge',
    description: 'Limited edition achievement NFT',
    cost: 750,
    icon: Star,
    available: false
  },
  {
    id: 4,
    title: '10% Course Discount',
    description: 'Discount on next premium course',
    cost: 250,
    icon: Gift,
    available: false
  }
];

const Rewards = () => {
  const totalCoins = 430; // This would come from user data
  const earnedAchievements = achievements.filter(a => a.earned).length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Rewards & Achievements</h1>
          <p className="text-muted-foreground mt-1">Track your progress and redeem rewards</p>
        </div>
      </div>

      {/* Coins Balance */}
      <Card className="bg-gradient-to-r from-accent to-accent/80 text-accent-foreground rounded-2xl">
        <CardContent className="p-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium mb-2">Your Balance</p>
              <div className="flex items-center gap-3">
                <Coins className="w-10 h-10" />
                <p className="text-5xl font-bold">{totalCoins}</p>
                <span className="text-2xl font-medium">Coins</span>
              </div>
              <p className="text-sm mt-2 opacity-90">Earn more by completing quizzes and labs</p>
            </div>
            <div className="text-right">
              <div className="bg-background/20 rounded-xl p-4">
                <p className="text-sm font-medium">Achievements</p>
                <p className="text-3xl font-bold">{earnedAchievements}/{achievements.length}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Achievements Section */}
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-4">Achievements</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {achievements.map((achievement) => {
            const IconComponent = achievement.icon;
            return (
              <Card 
                key={achievement.id} 
                className={`rounded-2xl transition-all ${
                  achievement.earned 
                    ? 'bg-accent text-accent-foreground' 
                    : achievement.locked 
                    ? 'bg-card/50 opacity-60' 
                    : 'bg-card hover:bg-card/80'
                }`}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      achievement.earned 
                        ? 'bg-background/20' 
                        : 'bg-accent'
                    }`}>
                      <IconComponent className={`w-6 h-6 ${
                        achievement.earned 
                          ? 'text-accent-foreground' 
                          : 'text-accent-foreground'
                      }`} />
                    </div>
                    {achievement.earned && (
                      <CheckCircle className="w-5 h-5 text-green-400" />
                    )}
                    {achievement.locked && (
                      <Lock className="w-5 h-5 text-muted-foreground" />
                    )}
                  </div>
                  <h3 className="font-bold mb-1">{achievement.title}</h3>
                  <p className={`text-sm mb-3 ${
                    achievement.earned ? 'text-accent-foreground/80' : 'text-muted-foreground'
                  }`}>
                    {achievement.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <Badge className={achievement.earned ? 'bg-background/20' : ''}>
                      +{achievement.xp} XP
                    </Badge>
                    {achievement.earned && achievement.earnedDate && (
                      <span className="text-xs opacity-70">
                        {new Date(achievement.earnedDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Redeemable Rewards Section */}
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-4">Redeem Rewards</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {redeemableRewards.map((reward) => {
            const IconComponent = reward.icon;
            const canAfford = totalCoins >= reward.cost;
            
            return (
              <Card key={reward.id} className="bg-card rounded-2xl hover:bg-card/80 transition-colors">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-14 h-14 bg-accent rounded-xl flex items-center justify-center flex-shrink-0">
                      <IconComponent className="w-7 h-7 text-accent-foreground" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-foreground mb-1">{reward.title}</h3>
                      <p className="text-sm text-muted-foreground">{reward.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Coins className="w-5 h-5 text-accent" />
                      <span className="text-lg font-bold text-foreground">{reward.cost}</span>
                    </div>
                    <Button 
                      className="bg-accent hover:bg-accent/90 text-accent-foreground"
                      disabled={!canAfford}
                    >
                      {canAfford ? 'Redeem' : 'Not Enough Coins'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Rewards;
