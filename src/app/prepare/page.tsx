'use client';

import { useState } from 'react';
import { ConfigurationForm } from './configuration';
import { Quiz } from './quiz';
import { Results } from './results';
import type { Question, Answers } from '@/lib/types';
import { BookOpen, LogIn } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

type GameState = 'configuring' | 'taking_quiz' | 'viewing_results';

const Header = () => (
  <header className="py-4 bg-transparent">
    <div className="container mx-auto flex justify-between items-center">
      <Link href="/" className="flex items-center gap-2 text-foreground hover:text-primary transition-colors">
        <BookOpen className="w-8 h-8 text-primary" />
        <h1 className="text-2xl font-bold">CET Prep</h1>
      </Link>
      <Button variant="ghost">
        <LogIn className="mr-2 h-4 w-4" />
        User Profile
      </Button>
    </div>
  </header>
);

export default function PreparePage() {
  const [gameState, setGameState] = useState<GameState>('configuring');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [timeLimit, setTimeLimit] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Answers>({});

  const handleTestGenerated = (generatedQuestions: Question[], configuredTime: number) => {
    setQuestions(generatedQuestions);
    setTimeLimit(configuredTime);
    setGameState('taking_quiz');
  };

  const handleQuizFinish = (finalAnswers: Answers) => {
    setUserAnswers(finalAnswers);
    setGameState('viewing_results');
  };

  const handleRestart = () => {
    setGameState('configuring');
    setQuestions([]);
    setTimeLimit(0);
    setUserAnswers({});
  };
  
  const handleExit = () => {
    handleRestart();
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        {gameState === 'configuring' && <ConfigurationForm onTestGenerated={handleTestGenerated} />}
        {gameState === 'taking_quiz' && <Quiz questions={questions} timeLimit={timeLimit} onFinish={handleQuizFinish} onExit={handleExit} />}
        {gameState === 'viewing_results' && <Results questions={questions} answers={userAnswers} onRestart={handleRestart} />}
      </main>
    </div>
  );
}
