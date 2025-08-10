"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import type { Answers, MarkedForReview, Question } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Bookmark, ChevronLeft, ChevronRight, Timer, X, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

type QuizProps = {
  questions: Question[];
  timeLimit: number; // in minutes
  onFinish: (answers: Answers) => void;
  onExit: () => void;
};

type Section = {
  name: string;
  questions: Question[];
  time: number; // in seconds
};

export function Quiz({ questions, timeLimit, onFinish, onExit }: QuizProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [sections, setSections] = useState<Section[]>([]);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(timeLimit * 60);
  const [markedForReview, setMarkedForReview] = useState<MarkedForReview>([]);
  const quizContainerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const isPcmTest = questions.some(q => q.subject === "Mathematics") && questions.length === 150;

  useEffect(() => {
    if (isPcmTest) {
      const pncQuestions = questions.filter(q => q.subject === 'Physics' || q.subject === 'Chemistry');
      const mathQuestions = questions.filter(q => q.subject === 'Mathematics');
      const pcmSections = [
        { name: 'Physics & Chemistry', questions: pncQuestions, time: 90 * 60 },
        { name: 'Mathematics', questions: mathQuestions, time: 90 * 60 },
      ];
      setSections(pcmSections);
      setTimeLeft(pcmSections[0].time);
    } else {
       const singleSection = [{ name: 'Test', questions: questions, time: timeLimit * 60 }];
       setSections(singleSection);
       setTimeLeft(singleSection[0].time);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [questions, timeLimit, isPcmTest]);
  
  const currentSection = sections[currentSectionIndex];
  const questionsInCurrentSection = currentSection?.questions || [];
  
  const globalQuestionIndex = useMemo(() => {
    if (currentSectionIndex === 0 || !isPcmTest) {
      return currentQuestionIndex;
    }
    // For section 2, offset index by length of section 1
    return sections[0].questions.length + currentQuestionIndex;
  }, [currentQuestionIndex, currentSectionIndex, sections, isPcmTest]);


  const finishQuiz = useCallback(() => {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(err => console.error("Could not exit fullscreen", err));
    }
    onFinish(answers);
  }, [answers, onFinish]);

  const finishSection = useCallback(() => {
    if (isPcmTest && currentSectionIndex < sections.length - 1) {
      setCurrentSectionIndex(prev => prev + 1);
      setCurrentQuestionIndex(0);
      setMarkedForReview([]);
      setTimeLeft(prevTime => prevTime + sections[currentSectionIndex + 1].time);
    } else {
      finishQuiz();
    }
  }, [isPcmTest, currentSectionIndex, sections, finishQuiz]);

  useEffect(() => {
    const elem = quizContainerRef.current;
    if (elem) {
      elem.requestFullscreen().catch(err => {
        console.warn(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
        toast({
            variant: "destructive",
            title: "Fullscreen Required",
            description: "Please enable fullscreen mode to continue the test for a secure experience.",
        });
      });
    }

    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        toast({
          variant: "destructive",
          title: "Test Finished",
          description: "You have exited fullscreen mode, so the test has been submitted automatically.",
        });
        finishQuiz();
      }
    };
    
    const preventCopy = (e: ClipboardEvent) => e.preventDefault();
    
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener('copy', preventCopy);
    document.addEventListener('cut', preventCopy);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener('copy', preventCopy);
      document.removeEventListener('cut', preventCopy);
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(err => console.error("Cleanup could not exit fullscreen", err));
      }
    };
  }, [finishQuiz, toast]);


  useEffect(() => {
    if (timeLeft <= 0) {
      finishSection();
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, finishSection]);

  const handleAnswerChange = (value: string) => {
    setAnswers((prev) => ({ ...prev, [globalQuestionIndex]: value }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < questionsInCurrentSection.length - 1) {
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
  
  if (!currentSection) {
    return <div className="text-center p-8"><Timer className="h-8 w-8 animate-spin" /> <p>Loading test...</p></div>
  }

  const currentQuestion = questionsInCurrentSection[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questionsInCurrentSection.length) * 100;
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div ref={quizContainerRef} className="flex flex-col md:flex-row gap-8 max-w-7xl mx-auto bg-background p-4 rounded-lg" onCopy={(e) => e.preventDefault()}>
      <div className="flex-grow">
        <Card className="shadow-lg">
          <CardHeader className="border-b">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Question {currentQuestionIndex + 1} of {questionsInCurrentSection.length}</CardTitle>
                {isPcmTest && <p className="text-sm text-muted-foreground mt-1">Section: {currentSection.name}</p>}
              </div>
              <div className="flex items-center gap-2 bg-primary/10 text-primary font-semibold px-3 py-1.5 rounded-full">
                  <Timer className="w-5 h-5" />
                  <span>{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}</span>
              </div>
            </div>
            <Progress value={progress} className="mt-2"/>
          </CardHeader>
          <CardContent className="pt-6">
            <p className="text-lg font-semibold mb-6">{currentQuestion.question}</p>
            <RadioGroup key={globalQuestionIndex} value={answers[globalQuestionIndex]} onValueChange={handleAnswerChange}>
                {currentQuestion.options.map((option, index) => {
                    const optionLetter = String.fromCharCode(65 + index);
                    return (
                        <div key={index} className="flex items-center space-x-3 p-4 border rounded-md has-[:checked]:bg-primary/10 has-[:checked]:border-primary transition-all">
                            <RadioGroupItem value={optionLetter} id={`q${globalQuestionIndex}-option-${index}`} />
                            <Label htmlFor={`q${globalQuestionIndex}-option-${index}`} className="text-base flex-grow cursor-pointer">
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
          {currentQuestionIndex === questionsInCurrentSection.length - 1 ? (
             <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button className="bg-accent hover:bg-accent/90">
                      {isPcmTest && currentSectionIndex < sections.length - 1 ? "Finish Section" : "Finish Test"}
                      {isPcmTest && currentSectionIndex < sections.length - 1 && <ArrowRight className="ml-2 h-4 w-4" />}
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                       {isPcmTest && currentSectionIndex < sections.length - 1 
                        ? "You are about to finish this section. You will not be able to return to it." 
                        : "This will submit all your answers and end the test. You cannot go back."}
                    </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={finishSection} className="bg-accent hover:bg-accent/90">
                      Yes, {isPcmTest && currentSectionIndex < sections.length - 1 ? "Proceed" : "Finish Test"}
                    </AlertDialogAction>
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
                {isPcmTest && <p className="text-sm text-muted-foreground">{currentSection.name}</p>}
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-5 gap-2">
                    {questionsInCurrentSection.map((_, index) => {
                        const globalIdx = isPcmTest && currentSectionIndex === 1 ? index + sections[0].questions.length : index;
                        const isAnswered = answers[globalIdx] !== undefined;
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

    