import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FlaskConical, Clock, Award, CheckCircle, Lock, Code, Target } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { LabModal } from '@/components/LabModal';
import { labTasksData } from '@/data/labTasks';
import { useToast } from '@/hooks/use-toast';
import { useLabCompletion } from '@/hooks/useLabCompletion';

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
  const [selectedLab, setSelectedLab] = useState<number | null>(null);
  // canonical source of truth for completed labs (loaded from hook/db)
  const [completedLabIds, setCompletedLabIds] = useState<number[]>([1, 2, 3]);
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

  const { completeLab, getCompletedLabs } = useLabCompletion();

  // load completed labs once on mount
  useEffect(() => {
    let mounted = true;
    const loadCompleted = async () => {
      try {
        const completed = await getCompletedLabs();
        if (mounted && Array.isArray(completed)) {
          setCompletedLabIds(completed);
        }
      } catch (err) {
        // optional: show toast or console
        console.error('Failed to load completed labs', err);
      }
    };
    loadCompleted();
    return () => { mounted = false; };
  }, [getCompletedLabs]);

  const handleLabComplete = async (labId: number) => {
    try {
      const result = await completeLab(labId);
      if (result && result.success && !result.alreadyCompleted) {
        setCompletedLabIds(prev => {
          if (prev.includes(labId)) return prev;
          return [...prev, labId];
        });
        toast({
          title: 'Lab completed',
          description: 'XP awarded!'
        });
      } else if (result && result.alreadyCompleted) {
        toast({
          title: 'Already completed',
          description: 'You had already completed this lab.'
        });
      }
    } catch (err) {
      console.error('Error completing lab', err);
      toast({
        title: 'Error',
        description: 'Failed to mark lab as completed.',
        variant: 'destructive'
      });
    }
  };

  const handleStartLab = (labId: number, locked: boolean) => {
    if (locked) {
      toast({
        title: "Lab Locked",
        description: "Complete previous labs to unlock this one.",
        variant: "destructive"
      });
      return;
    }
    setSelectedLab(labId);
  };

  const completedCount = completedLabIds.length;
  const totalXP = completedLabIds.reduce((sum, labId) => {
    const lab = labs.find(l => l.id === labId);
    return sum + (lab?.xp || 0);
  }, 0);

  const selectedLabData = labs.find(l => l.id === selectedLab);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold text-foreground">Practical Labs 🧪</h1>
        <p className="text-muted-foreground text-lg">
          Hands-on experience with blockchain technology
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-2">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <FlaskConical className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Labs Completed</p>
                <p className="text-2xl font-bold text-foreground">
                  {completedCount}/{labs.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-2">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                <Award className="w-6 h-6 text-accent" />
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
              <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                <Target className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Completion</p>
                <p className="text-2xl font-bold text-foreground">
                  {Math.round((completedCount / labs.length) * 100)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Labs Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {labs.map((lab) => {
          const isCompleted = completedLabIds.includes(lab.id);
          
          return (
            <Card 
              key={lab.id} 
              className="border-2 hover:border-primary/50 transition-all group"
            >
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Code className="w-7 h-7 text-primary" />
                    </div>
                    {isCompleted && (
                      <CheckCircle className="w-6 h-6 text-green-500" />
                    )}
                    {lab.locked && (
                      <Lock className="w-6 h-6 text-muted-foreground" />
                    )}
                  </div>
                  <Badge className={getDifficultyColor(lab.difficulty)}>
                    {lab.difficulty}
                  </Badge>
                </div>

                <h3 className="text-xl font-bold text-foreground mb-2">
                  {lab.title}
                </h3>
                <p className="text-muted-foreground text-sm mb-4">
                  {lab.description}
                </p>

                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                  <div className="flex items-center gap-1.5">
                    <FlaskConical className="w-4 h-4" />
                    <span>{lab.tasks} tasks</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4" />
                    <span>{lab.duration}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-primary" />
                    <span className="text-primary font-medium">{lab.xp} XP</span>
                  </div>
                </div>

                {isCompleted && (
                  <div className="mb-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                    <p className="text-sm text-green-500 flex items-center gap-2 font-medium">
                      <CheckCircle className="w-4 h-4" />
                      Lab Completed!
                    </p>
                  </div>
                )}

                <Button 
                  onClick={() => handleStartLab(lab.id, lab.locked || false)}
                  disabled={lab.locked}
                  className="w-full"
                  size="lg"
                >
                  {lab.locked ? (
                    <>
                      <Lock className="w-4 h-4 mr-2" />
                      Locked
                    </>
                  ) : isCompleted ? (
                    'Review Lab'
                  ) : (
                    'Start Lab'
                  )}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Lab Modal */}
      {selectedLabData && selectedLab !== null && (
        <LabModal
          open={selectedLab !== null}
          onOpenChange={(open) => !open && setSelectedLab(null)}
          labTitle={selectedLabData.title}
          labDescription={selectedLabData.description}
          tasks={labTasksData[selectedLab as any] || []}
          xpReward={selectedLabData.xp}
          onComplete={() => handleLabComplete(selectedLab!)}
        />
      )}
    </div>
  );
};

export default Labs;
