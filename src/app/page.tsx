import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { BookOpen, LogIn, Mail, Sparkles, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const Header = () => (
  <header className="absolute top-0 left-0 right-0 p-4 bg-transparent z-10">
    <div className="container mx-auto flex justify-between items-center">
      <div className="flex items-center gap-2">
        <BookOpen className="w-8 h-8 text-primary" />
        <h1 className="text-2xl font-bold text-foreground">CET Prep</h1>
      </div>
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
        <Card className="w-full max-w-3xl h-[600px] shadow-lg">
           <iframe
              src="https://docs.google.com/forms/d/e/1FAIpQLSehS4B82eq_z0bLIICcmm6WXzQI69TR7aRWXWKSbPAiWhjW_w/viewform?embedded=true"
              width="100%"
              height="100%"
              frameBorder="0"
              marginHeight={0}
              marginWidth={0}>
              Loading…
            </iframe>
        </Card>
        <div className="mt-6">
            <p className="text-sm text-muted-foreground mb-4">
            After submitting the form, click the button below to proceed.
            </p>
            <Button asChild size="lg">
                <Link href="/prepare">
                    Continue to Test <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
            </Button>
        </div>
      </main>
    </div>
  );
}
