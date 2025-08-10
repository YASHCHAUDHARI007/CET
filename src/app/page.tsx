import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { BookOpen, LogIn, Mail, Sparkles } from 'lucide-react';
import Link from 'next/link';

const Header = () => (
  <header className="absolute top-0 left-0 right-0 p-4 bg-transparent z-10">
    <div className="container mx-auto flex justify-between items-center">
      <div className="flex items-center gap-2">
        <BookOpen className="w-8 h-8 text-primary" />
        <h1 className="text-2xl font-bold text-foreground">CET Prep</h1>
      </div>
      <Button variant="ghost" asChild>
        <Link href="/prepare">
          Log In
          <LogIn className="ml-2 h-4 w-4" />
        </Link>
      </Button>
    </div>
  </header>
);

export default function Home() {
  return (
    <div className="relative min-h-screen w-full bg-background overflow-hidden">
      <div
        className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(to_bottom,white_10%,transparent_90%)]"
        style={{
          backgroundSize: '40px 40px',
          backgroundImage: 'radial-gradient(circle, hsl(var(--primary) / 0.1) 1px, transparent 1px)',
        }}
      ></div>
      <Header />
      <main className="relative z-1 container mx-auto flex flex-col items-center justify-center min-h-screen px-4 text-center">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="text-primary w-6 h-6" />
          <p className="font-semibold text-primary">AI-Powered Test Generation</p>
        </div>
        <h2 className="text-4xl md:text-6xl font-extrabold tracking-tighter mb-4 text-foreground font-headline">
          Master the MHT CET with Personalized Practice
        </h2>
        <p className="max-w-2xl mx-auto text-lg text-muted-foreground mb-8">
          Generate unlimited, customized test series from any chapter, with adjustable difficulty. Our AI crafts unique questions to sharpen your skills for exam day.
        </p>
        <Card className="w-full max-w-md shadow-lg">
          <CardContent className="p-6 flex flex-col gap-4">
            <Button size="lg" asChild className="w-full">
              <Link href="/prepare">
                <svg role="img" viewBox="0 0 24 24" className="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg"><title>Google</title><path d="M12.48 10.92v3.28h7.84c-.24 1.84-.85 3.18-1.73 4.1-1.02 1.02-2.6 1.84-4.84 1.84-5.84 0-10.62-4.7-10.62-10.54s4.78-10.54 10.62-10.54c3.33 0 5.43 1.33 6.68 2.54l2.62-2.62C19.8 1.09 16.7.2 12.48.2 5.58.2.2 5.7.2 12.6s5.38 12.4 12.28 12.4c3.6 0 6.33-1.23 8.4-3.35 2.15-2.2 2.78-5.3 2.78-8.62 0-.74-.06-1.47-.2-2.18h-11Z" fill="currentColor"/></svg>
                Continue with Google
              </Link>
            </Button>
            <Button size="lg" variant="secondary" asChild className="w-full">
               <Link href="/prepare">
                <Mail className="mr-2 h-4 w-4" />
                Continue with Email
              </Link>
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
