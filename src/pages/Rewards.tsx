import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trophy, Award, Star, Gift, Coins, CheckCircle, Lock, TrendingUp, Target } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';

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
  const [totalCoins, setTotalCoins] = useState(430);
  const { toast } = useToast();
  const earnedAchievements = achievements.filter(a => a.earned).length;

  const handleRedeem = (reward: typeof redeemableRewards[0]) => {
    if (totalCoins >= reward.cost) {
      setTotalCoins(prev => prev - reward.cost);
      toast({
        title: "Reward Redeemed! 🎉",
        description: `You've successfully redeemed ${reward.title}`,
      });
    }
  };

  const nextMilestone = 500;
  const progressToNext = (totalCoins / nextMilestone) * 100;

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold text-foreground">Rewards & Achievements 🏆</h1>
        <p className="text-muted-foreground text-lg">
          Track your progress and redeem exclusive rewards
        </p>
      </div>

      {/* Coins Balance */}
      <Card className="border-2 overflow-hidden">
        <CardContent className="p-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div>
                <p className="text-sm text-muted-foreground mb-2">Your Balance</p>
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                    <Coins className="w-8 h-8 text-primary" />
                  </div>
                  <p className="text-5xl font-bold text-foreground">{totalCoins}</p>
                  <span className="text-2xl font-medium text-muted-foreground">Coins</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Next Milestone</span>
                  <span className="font-medium text-foreground">{totalCoins}/{nextMilestone}</span>
                </div>
                <Progress value={progressToNext} className="h-2" />
                <p className="text-xs text-muted-foreground">
                  Earn {nextMilestone - totalCoins} more coins to unlock premium rewards
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <Card className="border-2">
                <CardContent className="p-4 text-center space-y-2">
                  <Target className="w-8 h-8 mx-auto text-primary" />
                  <p className="text-sm text-muted-foreground">Achievements</p>
                  <p className="text-3xl font-bold text-foreground">
                    {earnedAchievements}/{achievements.length}
                  </p>
                </CardContent>
              </Card>
              <Card className="border-2">
                <CardContent className="p-4 text-center space-y-2">
                  <TrendingUp className="w-8 h-8 mx-auto text-accent" />
                  <p className="text-sm text-muted-foreground">Completion</p>
                  <p className="text-3xl font-bold text-foreground">
                    {Math.round((earnedAchievements / achievements.length) * 100)}%
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Achievements Section */}
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
          <Trophy className="w-6 h-6 text-primary" />
          Achievements
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {achievements.map((achievement) => {
            const IconComponent = achievement.icon;
            return (
              <Card 
                key={achievement.id} 
                className={`border-2 transition-all ${
                  achievement.earned 
                    ? 'border-green-500/50 bg-green-500/5' 
                    : achievement.locked 
                    ? 'opacity-60' 
                    : 'hover:border-primary/50'
                }`}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${
                      achievement.earned 
                        ? 'bg-green-500/20' 
                        : 'bg-gradient-to-br from-primary/10 to-accent/10'
                    }`}>
                      <IconComponent className={`w-7 h-7 ${
                        achievement.earned 
                          ? 'text-green-500' 
                          : 'text-primary'
                      }`} />
                    </div>
                    {achievement.earned && (
                      <CheckCircle className="w-6 h-6 text-green-500" />
                    )}
                    {achievement.locked && (
                      <Lock className="w-6 h-6 text-muted-foreground" />
                    )}
                  </div>
                  <h3 className="font-bold text-lg mb-2">{achievement.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {achievement.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <Badge variant={achievement.earned ? "default" : "secondary"}>
                      +{achievement.xp} XP
                    </Badge>
                    {achievement.earned && achievement.earnedDate && (
                      <span className="text-xs text-muted-foreground">
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
        <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
          <Gift className="w-6 h-6 text-primary" />
          Redeem Rewards
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {redeemableRewards.map((reward) => {
            const IconComponent = reward.icon;
            const canAfford = totalCoins >= reward.cost;
            
            return (
              <Card key={reward.id} className="border-2 hover:border-primary/50 transition-all group">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                      <IconComponent className="w-8 h-8 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-foreground mb-1">{reward.title}</h3>
                      <p className="text-sm text-muted-foreground">{reward.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="flex items-center gap-2">
                      <Coins className="w-6 h-6 text-primary" />
                      <span className="text-xl font-bold text-foreground">{reward.cost}</span>
                      <span className="text-sm text-muted-foreground">coins</span>
                    </div>
                    <Button 
                      onClick={() => handleRedeem(reward)}
                      disabled={!canAfford}
                      size="lg"
                    >
                      {canAfford ? 'Redeem' : 'Insufficient Coins'}
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
