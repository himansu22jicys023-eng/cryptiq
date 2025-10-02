import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Clock, Award, CheckCircle, Lock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const quizzes = [
  {
    id: 1,
    title: 'Blockchain Basics',
    description: 'Learn the fundamentals of blockchain technology',
    questions: 10,
    duration: '15 min',
    xp: 100,
    difficulty: 'Beginner',
    completed: true,
    score: 90
  },
  {
    id: 2,
    title: 'Cryptocurrency Fundamentals',
    description: 'Understanding Bitcoin, Ethereum, and altcoins',
    questions: 15,
    duration: '20 min',
    xp: 150,
    difficulty: 'Beginner',
    completed: true,
    score: 85
  },
  {
    id: 3,
    title: 'Smart Contracts',
    description: 'Deep dive into smart contract development',
    questions: 12,
    duration: '18 min',
    xp: 200,
    difficulty: 'Intermediate',
    completed: true,
    score: 75
  },
  {
    id: 4,
    title: 'DeFi Protocols',
    description: 'Explore decentralized finance ecosystems',
    questions: 20,
    duration: '25 min',
    xp: 250,
    difficulty: 'Intermediate',
    completed: true,
    score: 80
  },
  {
    id: 5,
    title: 'NFT & Web3',
    description: 'Non-fungible tokens and Web3 applications',
    questions: 15,
    duration: '20 min',
    xp: 300,
    difficulty: 'Advanced',
    completed: false,
    locked: false
  },
  {
    id: 6,
    title: 'Crypto Security',
    description: 'Advanced security practices and wallet management',
    questions: 18,
    duration: '22 min',
    xp: 350,
    difficulty: 'Advanced',
    completed: false,
    locked: true
  }
];

const Quiz = () => {
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Quiz Arena</h1>
          <p className="text-muted-foreground mt-1">Test your crypto knowledge and earn XP</p>
        </div>
        <Card className="bg-accent text-accent-foreground rounded-xl">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5" />
              <div>
                <p className="text-sm font-medium">Total XP Earned</p>
                <p className="text-2xl font-bold">430 XP</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {quizzes.map((quiz) => (
          <Card key={quiz.id} className="bg-card rounded-2xl hover:bg-card/80 transition-colors">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-12 h-12 bg-accent rounded-xl flex items-center justify-center">
                    <BookOpen className="w-6 h-6 text-accent-foreground" />
                  </div>
                  {quiz.completed && (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  )}
                  {quiz.locked && (
                    <Lock className="w-5 h-5 text-muted-foreground" />
                  )}
                </div>
                <Badge className={getDifficultyColor(quiz.difficulty)}>
                  {quiz.difficulty}
                </Badge>
              </div>

              <h3 className="text-xl font-bold text-foreground mb-2">{quiz.title}</h3>
              <p className="text-muted-foreground text-sm mb-4">{quiz.description}</p>

              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                <div className="flex items-center gap-1">
                  <BookOpen className="w-4 h-4" />
                  <span>{quiz.questions} questions</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{quiz.duration}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Award className="w-4 h-4" />
                  <span>{quiz.xp} XP</span>
                </div>
              </div>

              {quiz.completed && quiz.score && (
                <div className="mb-4 p-3 bg-accent/20 rounded-lg">
                  <p className="text-sm text-foreground">
                    Your Score: <span className="font-bold">{quiz.score}%</span>
                  </p>
                </div>
              )}

              <Button 
                className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
                disabled={quiz.locked}
              >
                {quiz.locked ? 'Locked' : quiz.completed ? 'Retake Quiz' : 'Start Quiz'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Quiz;
