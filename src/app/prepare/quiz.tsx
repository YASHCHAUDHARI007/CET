"use client";

import { useState, useEffect, useCallback } from "react";
import type { Answers, MarkedForReview, Question } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Bookmark, ChevronLeft, ChevronRight, Timer, X } from "lucide-react";
import { cn } from "@/lib/utils";

type QuizProps = {
  questions: Question[];
  timeLimit: number; // in minutes
  onFinish: (answers: Answers) => void;
  onExit: () => void;
};

export function Quiz({ questions, timeLimit, onFinish, onExit }: QuizProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [timeLeft, setTimeLeft] = useState(timeLimit * 60);
  const [markedForReview, setMarkedForReview] = useState<MarkedForReview>([]);

  const finishQuiz = useCallback(() => {
    onFinish(answers);
  }, [answers, onFinish]);

  useEffect(() => {
    if (timeLeft <= 0) {
      finishQuiz();
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, finishQuiz]);

  const handleAnswerChange = (value: string) => {
    setAnswers((prev) => ({ ...prev, [currentQuestionIndex]: value }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };
  
  const handleGoToQuestion = (index: number) => {
    setCurrentQuestionIndex(index);
  };

  const toggleMarkForReview = () => {
    setMarkedForReview(prev => {
        if(prev.includes(currentQuestionIndex)) {
            return prev.filter(i => i !== currentQuestionIndex);
        } else {
            return [...prev, currentQuestionIndex];
        }
    })
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="flex flex-col md:flex-row gap-8 max-w-7xl mx-auto">
      <div className="flex-grow">
        <Card className="shadow-lg">
          <CardHeader className="border-b">
            <div className="flex justify-between items-center">
                <CardTitle>Question {currentQuestionIndex + 1} of {questions.length}</CardTitle>
                <div className="flex items-center gap-2 bg-primary/10 text-primary font-semibold px-3 py-1.5 rounded-full">
                    <Timer className="w-5 h-5" />
                    <span>{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}</span>
                </div>
            </div>
            <Progress value={progress} className="mt-2"/>
          </CardHeader>
          <CardContent className="pt-6">
            <p className="text-lg font-semibold mb-6">{currentQuestion.question}</p>
            <RadioGroup value={answers[currentQuestionIndex]} onValueChange={handleAnswerChange}>
                {currentQuestion.options.map((option, index) => {
                    const optionLetter = String.fromCharCode(65 + index);
                    return (
                        <div key={index} className="flex items-center space-x-3 p-4 border rounded-md has-[:checked]:bg-primary/10 has-[:checked]:border-primary transition-all">
                            <RadioGroupItem value={optionLetter} id={`option-${index}`} />
                            <Label htmlFor={`option-${index}`} className="text-base flex-grow cursor-pointer">
                                {optionLetter}. {option}
                            </Label>
                        </div>
                    )
                })}
            </RadioGroup>
          </CardContent>
        </Card>
        <div className="mt-6 flex justify-between items-center">
          <Button variant="outline" onClick={handlePrev} disabled={currentQuestionIndex === 0}>
            <ChevronLeft className="mr-2 h-4 w-4"/> Previous
          </Button>
           <Button variant="outline" onClick={toggleMarkForReview} className={cn(markedForReview.includes(currentQuestionIndex) && 'bg-accent text-accent-foreground')}>
            <Bookmark className="mr-2 h-4 w-4"/> Mark for Review
          </Button>
          {currentQuestionIndex === questions.length - 1 ? (
             <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button className="bg-accent hover:bg-accent/90">Finish Test</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure you want to finish?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This will submit all your answers and end the test. You cannot go back.
                    </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={finishQuiz} className="bg-accent hover:bg-accent/90">Yes, Finish Test</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
          ) : (
            <Button onClick={handleNext}>
                Next <ChevronRight className="ml-2 h-4 w-4"/>
            </Button>
          )}
        </div>
      </div>
      <aside className="w-full md:w-64">
        <Card className="shadow-lg">
            <CardHeader>
                <CardTitle className="text-lg">Question Palette</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-5 gap-2">
                    {questions.map((_, index) => {
                        const isAnswered = answers[index] !== undefined;
                        const isMarked = markedForReview.includes(index);
                        const isCurrent = index === currentQuestionIndex;
                        return (
                            <Button 
                                key={index} 
                                variant={isCurrent ? 'default' : 'outline'}
                                size="icon"
                                onClick={() => handleGoToQuestion(index)}
                                className={cn(
                                    isAnswered && 'bg-green-200 text-green-800 border-green-400 hover:bg-green-300',
                                    isMarked && 'bg-yellow-200 text-yellow-800 border-yellow-400 hover:bg-yellow-300',
                                    isCurrent && 'ring-2 ring-primary ring-offset-2'
                                )}
                            >
                                {index + 1}
                            </Button>
                        )
                    })}
                </div>
                 <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="destructive" className="w-full mt-6"><X className="mr-2 h-4 w-4" /> Exit Test</Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure you want to exit?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Your progress will be lost. This action cannot be undone.
                        </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={onExit} variant="destructive">Yes, Exit</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </CardContent>
        </Card>
      </aside>
    </div>
  );
}
