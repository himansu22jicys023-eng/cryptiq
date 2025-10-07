import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Clock, Award, CheckCircle, Lock, TrendingUp, Target } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { QuizModal } from '@/components/QuizModal';
import { quizData } from '@/data/quizQuestions';
import { useToast } from '@/hooks/use-toast';

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
  const [selectedQuiz, setSelectedQuiz] = useState<number | null>(null);
  const [quizScores, setQuizScores] = useState<Record<number, number>>({
    1: 90,
    2: 85,
    3: 75,
    4: 80
  });
  const { toast } = useToast();

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

  const handleQuizComplete = (quizId: number, score: number) => {
    setQuizScores(prev => ({ ...prev, [quizId]: score }));
    
    toast({
      title: "Quiz Completed!",
      description: `You scored ${score}%. Great job! 🎉`,
    });
  };

  const handleStartQuiz = (quizId: number, locked: boolean) => {
    if (locked) {
      toast({
        title: "Quiz Locked",
        description: "Complete previous quizzes to unlock this one.",
        variant: "destructive"
      });
      return;
    }
    setSelectedQuiz(quizId);
  };

  const totalXP = Object.values(quizScores).reduce((acc, score) => {
    return acc + Math.round((score / 100) * 100);
  }, 0);

  const selectedQuizData = quizzes.find(q => q.id === selectedQuiz);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold text-foreground">Quiz Arena 🎯</h1>
        <p className="text-muted-foreground text-lg">
          Test your crypto knowledge and earn XP
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-2">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Award className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total XP</p>
                <p className="text-2xl font-bold text-foreground">{totalXP}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-2">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                <Target className="w-6 h-6 text-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold text-foreground">
                  {Object.keys(quizScores).length}/{quizzes.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-2">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg Score</p>
                <p className="text-2xl font-bold text-foreground">
                  {Object.keys(quizScores).length > 0
                    ? Math.round(
                        Object.values(quizScores).reduce((a, b) => a + b, 0) /
                          Object.keys(quizScores).length
                      )
                    : 0}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quiz Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {quizzes.map((quiz) => {
          const userScore = quizScores[quiz.id];
          const isCompleted = userScore !== undefined;

          return (
            <Card 
              key={quiz.id} 
              className="border-2 hover:border-primary/50 transition-all group"
            >
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <BookOpen className="w-7 h-7 text-primary" />
                    </div>
                    {isCompleted && (
                      <CheckCircle className="w-6 h-6 text-green-500" />
                    )}
                    {quiz.locked && (
                      <Lock className="w-6 h-6 text-muted-foreground" />
                    )}
                  </div>
                  <Badge className={getDifficultyColor(quiz.difficulty)}>
                    {quiz.difficulty}
                  </Badge>
                </div>

                <h3 className="text-xl font-bold text-foreground mb-2">
                  {quiz.title}
                </h3>
                <p className="text-muted-foreground text-sm mb-4">
                  {quiz.description}
                </p>

                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                  <div className="flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4" />
                    <span>{quiz.questions} Qs</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4" />
                    <span>{quiz.duration}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-primary" />
                    <span className="text-primary font-medium">{quiz.xp} XP</span>
                  </div>
                </div>

                {isCompleted && (
                  <div className="mb-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-foreground">Best Score:</p>
                      <p className="text-lg font-bold text-green-500">{userScore}%</p>
                    </div>
                  </div>
                )}

                <Button 
                  onClick={() => handleStartQuiz(quiz.id, quiz.locked || false)}
                  disabled={quiz.locked}
                  className="w-full"
                  size="lg"
                >
                  {quiz.locked ? (
                    <>
                      <Lock className="w-4 h-4 mr-2" />
                      Locked
                    </>
                  ) : isCompleted ? (
                    'Retake Quiz'
                  ) : (
                    'Start Quiz'
                  )}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quiz Modal */}
      {selectedQuizData && (
        <QuizModal
          open={selectedQuiz !== null}
          onOpenChange={(open) => !open && setSelectedQuiz(null)}
          quizTitle={selectedQuizData.title}
          questions={quizData[selectedQuiz as keyof typeof quizData] || []}
          xpReward={selectedQuizData.xp}
          onComplete={(score) => handleQuizComplete(selectedQuiz!, score)}
        />
      )}
    </div>
  );
};

export default Quiz;
