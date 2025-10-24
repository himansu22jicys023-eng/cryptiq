import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card } from '@/components/ui/card';
import { Clock, CheckCircle2, XCircle, Trophy, Target } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

interface QuizModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  quizTitle: string;
  questions: Question[];
  xpReward: number;
  onComplete: (score: number) => void;
}

export const QuizModal = ({
  open,
  onOpenChange,
  quizTitle,
  questions,
  xpReward,
  onComplete,
}: QuizModalProps) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answers, setAnswers] = useState<number[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [showExplanation, setShowExplanation] = useState(false);

  // --- NEW: State for final results ---
  const [finalScore, setFinalScore] = useState(0);
  const [finalCorrectCount, setFinalCorrectCount] = useState(0);

  const validQuestions = Array.isArray(questions) ? questions : [];
  const totalQuestions = validQuestions.length > 0 ? validQuestions.length : 1;

  const progress = ((currentQuestion + 1) / totalQuestions) * 100;
  const currentQ = validQuestions[currentQuestion];

  useEffect(() => {
    if (!open) {
      resetQuiz();
    }
  }, [open]);

  // --- calculateResults: Now accepts final answers array ---
  const calculateResults = (finalAnswers: number[]) => {
    if (validQuestions.length === 0) {
      setFinalScore(0);
      setFinalCorrectCount(0);
      onComplete(0);
      setShowResults(true);
      return;
    }
    
    const correctCount = finalAnswers.filter(
      (answer, index) => validQuestions[index] && answer === validQuestions[index].correctAnswer
    ).length;
    const score = Math.round((correctCount / validQuestions.length) * 100);
    
    setFinalScore(score); // Store the final score in state
    setFinalCorrectCount(correctCount); // Store the final count in state
    onComplete(score);     // Report score to parent
    setShowResults(true);  // Show the results screen
  };

  // Timer logic - calls handleNextQuestion on timeout (which acts as a skip)
  useEffect(() => {
    if (open && !showResults && !showExplanation && validQuestions.length > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleNextQuestion(); // This will trigger skip logic
            return 30;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [open, showResults, currentQuestion, showExplanation, validQuestions.length]);

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setAnswers([]);
    setShowResults(false);
    setTimeLeft(30);
    setShowExplanation(false);
    setFinalScore(0);
    setFinalCorrectCount(0);
  };

  const handleAnswerSelect = (answerIndex: number) => {
    if (!showExplanation) {
      setSelectedAnswer(answerIndex);
    }
  };

  // --- handleSubmitAnswer: Only shows explanation and saves answer ---
  const handleSubmitAnswer = () => {
    if (selectedAnswer === null) return;
    
    setShowExplanation(true);
    setAnswers([...answers, selectedAnswer]); // This is async, but OK
  };

  // --- handleNextQuestion: Handles Skip, Next, and See Results ---
  const handleNextQuestion = () => {
    let newAnswers = [...answers];

    if (showExplanation) {
      // This is a 'Next' or 'See Results' click
      // `answers` state is assumed to be up-to-date from handleSubmitAnswer
      newAnswers = answers; 
    } else if (selectedAnswer === null) {
      // This is a SKIP (or timeout)
      // `selectedAnswer` is null AND `showExplanation` is false
      newAnswers.push(-1);
      setAnswers(newAnswers); // Update state for this skip
    }
    // If selectedAnswer is not null AND showExplanation is false, do nothing (user must hit submit)

    if (currentQuestion < validQuestions.length - 1) {
      // Move to next question
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setTimeLeft(30);
      setShowExplanation(false);
    } else {
      // Last question, time to show results
      calculateResults(newAnswers); // Pass the final array
    }
  };

  // --- getScore removed ---

  if (showResults) {
    // --- UPDATED: Use state variables ---
    const score = finalScore;
    const correctCount = finalCorrectCount;
    // ---
    
    const isPass = score >= 70;
    const earnedXP = isPass ? xpReward : 0;

    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl">
          <div className="text-center space-y-6 py-8">
            <div className={cn(
              "w-24 h-24 mx-auto rounded-full flex items-center justify-center",
              isPass ? "bg-gradient-to-br from-primary/20 to-accent/20" : "bg-muted"
            )}>
              <Trophy 
                className={cn("w-12 h-12", isPass ? "text-primary" : "text-muted-foreground")} 
              />
            </div>
            
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-2">
                {isPass ? "Quiz Complete!" : "Quiz Failed"}
              </h2>
              <p className="text-muted-foreground">
                {isPass 
                  ? `Great job on completing ${quizTitle}` 
                  : `You need 70% to pass. Keep trying!`}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
              <Card className="p-6 border-2">
                <div className="text-center space-y-2">
                  <Target className={cn("w-8 h-8 mx-auto", isPass ? "text-primary" : "text-destructive")} />
                  <p className="text-sm text-muted-foreground">Your Score</p>
                  <p className={cn(
                    "text-3xl font-bold",
                    isPass ? "text-foreground" : "text-destructive"
                  )}>
                    {score}%
                  </p>
                </div>
              </Card>
              <Card className="p-6 border-2">
                <div className="text-center space-y-2">
                  <CheckCircle2 className="w-8 h-8 mx-auto text-green-500" />
                  <p className="text-sm text-muted-foreground">Correct Answers</p>
                  <p className="text-3xl font-bold text-foreground">
                    {correctCount}/{validQuestions.length}
                  </p>
                </div>
              </Card>
            </div>

            <div className={cn(
              "p-4 rounded-lg max-w-md mx-auto",
              isPass ? "bg-primary/10" : "bg-muted"
            )}>
              <p className="text-sm text-muted-foreground">XP Earned</p>
              <p className={cn(
                "text-2xl font-bold",
                isPass ? "text-primary" : "text-muted-foreground"
              )}>
                +{earnedXP} XP
              </p>
            </div>

            <Button
              onClick={() => onOpenChange(false)}
              size="lg"
              className="w-full max-w-md"
            >
              Continue Learning
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }
  
  // ... (rest of the component is the same) ...
  
  if (!currentQ) {
     return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl">
           <DialogHeader>
            <DialogTitle className="text-2xl">{quizTitle}</DialogTitle>
          </DialogHeader>
          <div className="p-8 text-center">
            <p className="text-muted-foreground">Loading quiz questions...</p>
            {validQuestions.length === 0 && !currentQ && (
              <p className="text-destructive-foreground mt-2">
                Failed to load questions for this quiz.
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>
     );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">{quizTitle}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Progress and Timer */}
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                Question {currentQuestion + 1} of {validQuestions.length}
              </span>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span className={cn(
                  "font-medium",
                  timeLeft <= 10 && "text-destructive"
                )}>
                  {timeLeft}s
                </span>
              </div>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Question */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-foreground">
              {currentQ.question}
            </h3>

            {/* Answer Options */}
            <div className="space-y-3">
              {currentQ.options.map((option, index) => {
                const isSelected = selectedAnswer === index;
                const isCorrect = index === currentQ.correctAnswer;
                const showCorrectness = showExplanation;

                return (
                  <button
                    key={index}
                    onClick={() => handleAnswerSelect(index)}
                    disabled={showExplanation}
                    className={cn(
                      "w-full p-4 text-left rounded-xl border-2 transition-all",
                      "hover:border-primary/50 disabled:cursor-not-allowed",
                      isSelected && !showCorrectness && "border-primary bg-primary/5",
                      showCorrectness && isCorrect && "border-green-500 bg-green-500/10",
                      showCorrectness && isSelected && !isCorrect && "border-destructive bg-destructive/10",
                      !isSelected && !showCorrectness && "border-border"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-foreground font-medium">{option}</span>
                      {showCorrectness && isCorrect && (
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                      )}
                      {showCorrectness && isSelected && !isCorrect && (
                        <XCircle className="w-5 h-5 text-destructive" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Explanation */}
            {showExplanation && (
              <div className="p-4 bg-muted/50 rounded-lg space-y-2 animate-in fade-in slide-in-from-bottom-2">
                <p className="font-semibold text-foreground">Explanation:</p>
                <p className="text-sm text-muted-foreground">{currentQ.explanation}</p>
              </div>
            )}
          </div>

          {/* --- UPDATED: Action Buttons --- */}
          <div className="flex gap-3">
            {!showExplanation ? (
              <>
                <Button
                  onClick={handleSubmitAnswer}
                  disabled={selectedAnswer === null}
                  className="flex-1"
                >
                  Submit Answer
                </Button>
                <Button
                  onClick={handleNextQuestion} // Acts as Skip
                  variant="outline"
                >
                  Skip
                </Button>
              </>
            ) : (
              <Button
                onClick={handleNextQuestion} // Acts as Next/Results
                className="flex-1"
              >
                {currentQuestion < validQuestions.length - 1 ? 'Next Question' : 'See Results'}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};