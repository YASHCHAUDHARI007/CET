"use client";

import type { Question, Answers } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { CheckCircle2, Award, Clock, XCircle, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

type ResultsProps = {
  questions: Question[];
  answers: Answers;
  onRestart: () => void;
};

export function Results({ questions, answers, onRestart }: ResultsProps) {
  const correctAnswers = questions.reduce((acc, question, index) => {
    return answers[index] === question.answer ? acc + 1 : acc;
  }, 0);

  const incorrectAnswers = Object.keys(answers).length - correctAnswers;
  const notAttempted = questions.length - Object.keys(answers).length;
  const scorePercentage = (correctAnswers / questions.length) * 100;

  const getResultIcon = (question: Question, userAnswer: string) => {
    if (userAnswer === undefined) {
      return <Clock className="h-5 w-5 text-yellow-500" />;
    }
    if (userAnswer === question.answer) {
      return <CheckCircle2 className="h-5 w-5 text-accent" />;
    }
    return <XCircle className="h-5 w-5 text-destructive" />;
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="mb-8 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Award className="text-primary"/> Test Results
          </CardTitle>
          <CardDescription>Here's how you performed in this test.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="p-4 bg-primary/10 rounded-lg">
                <p className="text-sm text-muted-foreground">Score</p>
                <p className="text-2xl font-bold text-primary">{scorePercentage.toFixed(2)}%</p>
            </div>
            <div className="p-4 bg-accent/10 rounded-lg">
                <p className="text-sm text-muted-foreground">Correct</p>
                <p className="text-2xl font-bold text-accent">{correctAnswers}</p>
            </div>
             <div className="p-4 bg-destructive/10 rounded-lg">
                <p className="text-sm text-muted-foreground">Incorrect</p>
                <p className="text-2xl font-bold text-destructive">{incorrectAnswers}</p>
            </div>
            <div className="p-4 bg-yellow-400/10 rounded-lg">
                <p className="text-sm text-muted-foreground">Not Attempted</p>
                <p className="text-2xl font-bold text-yellow-500">{notAttempted}</p>
            </div>
        </CardContent>
      </Card>

      <h2 className="text-xl font-bold mb-4">Detailed Analysis</h2>
      <Accordion type="single" collapsible className="w-full">
        {questions.map((question, index) => (
          <AccordionItem value={`item-${index}`} key={index}>
            <AccordionTrigger className="hover:no-underline">
              <div className="flex justify-between items-center w-full pr-4">
                <span className="text-left font-medium">Question {index + 1}</span>
                {getResultIcon(question, answers[index])}
              </div>
            </AccordionTrigger>
            <AccordionContent className="p-4 bg-card rounded-b-md">
              <p className="font-semibold mb-2">{question.question}</p>
              <div className="space-y-2 mb-4">
                {question.options.map((option, optIndex) => {
                    const optionLetter = String.fromCharCode(65 + optIndex);
                    const isCorrect = optionLetter === question.answer;
                    const isUserChoice = optionLetter === answers[index];
                    return (
                        <div key={optIndex} className={cn("p-2 rounded-md border", 
                            isCorrect && "bg-accent/20 border-accent",
                            isUserChoice && !isCorrect && "bg-destructive/20 border-destructive"
                        )}>
                           {optionLetter}. {option}
                        </div>
                    )
                })}
              </div>
              <div className="text-sm">
                <p><span className="font-semibold">Your Answer:</span> {answers[index] || "Not Attempted"}</p>
                <p><span className="font-semibold">Correct Answer:</span> {question.answer}</p>
                <div className="mt-2 p-3 bg-blue-50 border-l-4 border-blue-400 text-blue-800 rounded-r-md">
                    <p className="font-semibold">Explanation:</p>
                    <p>{question.explanation}</p>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
      
      <div className="mt-8 text-center">
        <Button size="lg" onClick={onRestart}>
            <RefreshCw className="mr-2 h-4 w-4"/>
            Take Another Test
        </Button>
      </div>
    </div>
  );
}
