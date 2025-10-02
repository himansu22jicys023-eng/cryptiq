import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FlaskConical, Clock, Award, CheckCircle, Lock, Code, Zap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

const labs = [
  {
    id: 1,
    title: 'Create Your First Wallet',
    description: 'Set up and secure a cryptocurrency wallet',
    duration: '30 min',
    xp: 150,
    difficulty: 'Beginner',
    completed: true,
    progress: 100,
    tasks: 5
  },
  {
    id: 2,
    title: 'Execute a Smart Contract',
    description: 'Deploy and interact with a basic smart contract',
    duration: '45 min',
    xp: 250,
    difficulty: 'Beginner',
    completed: true,
    progress: 100,
    tasks: 7
  },
  {
    id: 3,
    title: 'Build a DApp Frontend',
    description: 'Create a user interface for blockchain interaction',
    duration: '60 min',
    xp: 300,
    difficulty: 'Intermediate',
    completed: true,
    progress: 100,
    tasks: 10
  },
  {
    id: 4,
    title: 'NFT Minting Lab',
    description: 'Mint and manage your own NFT collection',
    duration: '50 min',
    xp: 350,
    difficulty: 'Intermediate',
    completed: false,
    progress: 0,
    tasks: 8,
    locked: false
  },
  {
    id: 5,
    title: 'DeFi Protocol Integration',
    description: 'Integrate with popular DeFi protocols',
    duration: '90 min',
    xp: 500,
    difficulty: 'Advanced',
    completed: false,
    progress: 0,
    tasks: 12,
    locked: true
  },
  {
    id: 6,
    title: 'Security Audit Challenge',
    description: 'Find vulnerabilities in smart contracts',
    duration: '120 min',
    xp: 600,
    difficulty: 'Advanced',
    completed: false,
    progress: 0,
    tasks: 15,
    locked: true
  }
];

const Labs = () => {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner':
        return 'bg-green-500/20 text-green-400';
      case 'Intermediate':
        return 'bg-yellow-500/20 text-yellow-400';
      case 'Advanced':
        return 'bg-red-500/20 text-red-400';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const completedLabs = labs.filter(lab => lab.completed).length;
  const totalXP = labs.filter(lab => lab.completed).reduce((sum, lab) => sum + lab.xp, 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Practical Labs</h1>
          <p className="text-muted-foreground mt-1">Hands-on experience with blockchain technology</p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-accent text-accent-foreground rounded-2xl">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <FlaskConical className="w-8 h-8" />
              <div>
                <p className="text-sm font-medium">Labs Completed</p>
                <p className="text-2xl font-bold">{completedLabs}/{labs.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-accent text-accent-foreground rounded-2xl">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Award className="w-8 h-8" />
              <div>
                <p className="text-sm font-medium">Total XP</p>
                <p className="text-2xl font-bold">{totalXP} XP</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-accent text-accent-foreground rounded-2xl">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Zap className="w-8 h-8" />
              <div>
                <p className="text-sm font-medium">Completion Rate</p>
                <p className="text-2xl font-bold">{Math.round((completedLabs / labs.length) * 100)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Labs Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {labs.map((lab) => (
          <Card key={lab.id} className="bg-card rounded-2xl hover:bg-card/80 transition-colors">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-12 h-12 bg-accent rounded-xl flex items-center justify-center">
                    <Code className="w-6 h-6 text-accent-foreground" />
                  </div>
                  {lab.completed && (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  )}
                  {lab.locked && (
                    <Lock className="w-5 h-5 text-muted-foreground" />
                  )}
                </div>
                <Badge className={getDifficultyColor(lab.difficulty)}>
                  {lab.difficulty}
                </Badge>
              </div>

              <h3 className="text-xl font-bold text-foreground mb-2">{lab.title}</h3>
              <p className="text-muted-foreground text-sm mb-4">{lab.description}</p>

              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                <div className="flex items-center gap-1">
                  <FlaskConical className="w-4 h-4" />
                  <span>{lab.tasks} tasks</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{lab.duration}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Award className="w-4 h-4" />
                  <span>{lab.xp} XP</span>
                </div>
              </div>

              {!lab.completed && !lab.locked && (
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="text-foreground font-medium">{lab.progress}%</span>
                  </div>
                  <Progress value={lab.progress} className="h-2" />
                </div>
              )}

              {lab.completed && (
                <div className="mb-4 p-3 bg-green-500/20 rounded-lg">
                  <p className="text-sm text-green-400 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    <span className="font-medium">Lab Completed!</span>
                  </p>
                </div>
              )}

              <Button 
                className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
                disabled={lab.locked}
              >
                {lab.locked ? 'Locked' : lab.completed ? 'Review Lab' : lab.progress > 0 ? 'Continue Lab' : 'Start Lab'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Labs;
