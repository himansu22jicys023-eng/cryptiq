import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card } from '@/components/ui/card';
import { CheckCircle2, Circle, Trophy, Award, Code } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Task {
  id: number;
  title: string;
  description: string;
  completed: boolean;
}

interface LabModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  labTitle: string;
  labDescription: string;
  tasks: Task[];
  xpReward: number;
  onComplete: () => void;
}

export const LabModal = ({
  open,
  onOpenChange,
  labTitle,
  labDescription,
  tasks,
  xpReward,
  onComplete,
}: LabModalProps) => {
  const [completedTasks, setCompletedTasks] = useState<number[]>([]);
  const [showResults, setShowResults] = useState(false);

  const progress = (completedTasks.length / tasks.length) * 100;

  const toggleTask = (taskId: number) => {
    setCompletedTasks(prev =>
      prev.includes(taskId)
        ? prev.filter(id => id !== taskId)
        : [...prev, taskId]
    );
  };

  const handleComplete = () => {
    if (completedTasks.length === tasks.length) {
      setShowResults(true);
      onComplete();
    }
  };

  const handleClose = () => {
    setCompletedTasks([]);
    setShowResults(false);
    onOpenChange(false);
  };

  if (showResults) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="max-w-2xl">
          <div className="text-center space-y-6 py-8">
            <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
              <Trophy className="w-12 h-12 text-primary" />
            </div>
            
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-2">
                Lab Complete! 🎉
              </h2>
              <p className="text-muted-foreground">
                Excellent work on completing {labTitle}
              </p>
            </div>

            <Card className="p-6 border-2 max-w-md mx-auto">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Tasks Completed</span>
                  <span className="text-2xl font-bold text-foreground">
                    {tasks.length}/{tasks.length}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-4 border-t">
                  <span className="text-muted-foreground">XP Earned</span>
                  <span className="text-2xl font-bold text-primary">
                    +{xpReward} XP
                  </span>
                </div>
              </div>
            </Card>

            <Button onClick={handleClose} size="lg" className="w-full max-w-md">
              Continue Learning
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">{labTitle}</DialogTitle>
          <p className="text-muted-foreground">{labDescription}</p>
        </DialogHeader>

        <div className="space-y-6">
          {/* Progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                Progress: {completedTasks.length} of {tasks.length} tasks
              </span>
              <span className="font-medium text-foreground">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          <Tabs defaultValue="tasks" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="tasks">Tasks</TabsTrigger>
              <TabsTrigger value="resources">Resources</TabsTrigger>
            </TabsList>

            <TabsContent value="tasks" className="space-y-4 mt-6">
              {tasks.map((task, index) => {
                const isCompleted = completedTasks.includes(task.id);
                
                return (
                  <Card
                    key={task.id}
                    className={cn(
                      "border-2 transition-all cursor-pointer",
                      isCompleted && "border-green-500/50 bg-green-500/5"
                    )}
                    onClick={() => toggleTask(task.id)}
                  >
                    <div className="p-4">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 mt-1">
                          {isCompleted ? (
                            <CheckCircle2 className="w-6 h-6 text-green-500" />
                          ) : (
                            <Circle className="w-6 h-6 text-muted-foreground" />
                          )}
                        </div>
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium text-muted-foreground">
                              TASK {index + 1}
                            </span>
                          </div>
                          <h3 className={cn(
                            "text-lg font-semibold",
                            isCompleted && "line-through text-muted-foreground"
                          )}>
                            {task.title}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {task.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </TabsContent>

            <TabsContent value="resources" className="mt-6">
              <Card className="p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <Code className="w-6 h-6 text-primary" />
                  <h3 className="text-lg font-semibold">Learning Resources</h3>
                </div>
                <div className="space-y-3">
                  <div className="p-4 bg-muted rounded-lg">
                    <h4 className="font-medium mb-2">Documentation</h4>
                    <p className="text-sm text-muted-foreground">
                      Official documentation and API references for this lab
                    </p>
                  </div>
                  <div className="p-4 bg-muted rounded-lg">
                    <h4 className="font-medium mb-2">Video Tutorial</h4>
                    <p className="text-sm text-muted-foreground">
                      Step-by-step video guide to help you complete this lab
                    </p>
                  </div>
                  <div className="p-4 bg-muted rounded-lg">
                    <h4 className="font-medium mb-2">Code Examples</h4>
                    <p className="text-sm text-muted-foreground">
                      Sample code and templates to get you started
                    </p>
                  </div>
                </div>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            <Button
              onClick={handleComplete}
              disabled={completedTasks.length !== tasks.length}
              className="flex-1"
              size="lg"
            >
              {completedTasks.length === tasks.length ? (
                <>
                  <Award className="w-4 h-4 mr-2" />
                  Complete Lab
                </>
              ) : (
                `Complete ${completedTasks.length}/${tasks.length} tasks to finish`
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
