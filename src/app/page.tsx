'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BrainCircuit, Star, Target, ShieldCheck, Zap, Globe } from 'lucide-react';
import { useUser } from '@/firebase';

export default function Home() {
  const { user } = useUser();
  const heroImageUrl = "https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?q=80&w=2070&auto=format&fit=crop";

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Navigation */}
      <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="container mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-primary p-2 rounded-lg shadow-lg">
              <Zap className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-black tracking-tighter text-gray-900">QUIZATHON</span>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
            <Link href="#features" className="hover:text-primary transition-colors">Features</Link>
            <Link href="#stats" className="hover:text-primary transition-colors">Stats</Link>
            {user?.email === 'admin@gmail.com' && (
              <Link href="/admin" className="text-primary font-bold">Admin Panel</Link>
            )}
          </nav>
          <div className="flex items-center gap-3">
            {user ? (
              <Button asChild className="rounded-full px-6 shadow-md shadow-primary/20">
                <Link href="/quiz">Go to Dashboard</Link>
              </Button>
            ) : (
              <>
                <Button variant="ghost" asChild className="rounded-full px-6">
                  <Link href="/login">Log In</Link>
                </Button>
                <Button asChild className="rounded-full px-6 shadow-md shadow-primary/20">
                  <Link href="/signup">Get Started</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="flex-grow pt-20">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-24 lg:py-32">
          <div className="container mx-auto px-4 relative z-10">
            <div className="flex flex-col lg:flex-row items-center gap-16">
              <div className="flex-1 text-center lg:text-left space-y-8">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-xs font-bold tracking-widest uppercase">
                  <Star className="h-3 w-3 fill-primary" />
                  The #1 Competitive Quiz Platform
                </div>
                <h1 className="text-5xl lg:text-7xl font-black text-gray-900 leading-[1.1] tracking-tight">
                  Master Your Knowledge with <span className="text-primary italic">Quizathon.</span>
                </h1>
                <p className="text-xl text-gray-500 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                  Join thousands of students competing in real-time. Fetch questions directly from curated databases and track your progress with professional analytics.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4">
                  <Button size="lg" asChild className="h-14 px-10 rounded-full text-lg font-bold shadow-xl shadow-primary/30 hover:shadow-primary/40 transition-all hover:-translate-y-1">
                    <Link href="/signup">Start Competition</Link>
                  </Button>
                  <Button size="lg" variant="outline" asChild className="h-14 px-10 rounded-full text-lg font-bold border-2 hover:bg-gray-50">
                    <Link href="/login">View Leaderboard</Link>
                  </Button>
                </div>
                <div className="flex items-center justify-center lg:justify-start gap-6 text-sm text-gray-400 font-medium">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-green-500" />
                    Secure
                  </div>
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-amber-500" />
                    Fast Performance
                  </div>
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-blue-500" />
                    Global Reach
                  </div>
                </div>
              </div>
              <div className="flex-1 relative">
                <div className="relative z-10 rounded-3xl overflow-hidden shadow-2xl shadow-black/20 border-8 border-white transform rotate-2 hover:rotate-0 transition-transform duration-500">
                  <Image
                    src={heroImageUrl}
                    alt="Quizathon Hub"
                    width={800}
                    height={600}
                    className="object-cover"
                    priority
                  />
                </div>
                <div className="absolute -top-10 -right-10 w-64 h-64 bg-primary/20 rounded-full blur-3xl -z-10 animate-pulse"></div>
                <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-blue-400/20 rounded-full blur-3xl -z-10 animate-pulse delay-1000"></div>
              </div>
            </div>
          </div>
        </section>

        {/* Info Grid */}
        <section id="features" className="py-24 bg-gray-50 border-y border-gray-100">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
              <h2 className="text-4xl font-black text-gray-900 tracking-tight">Built for Competitive Success.</h2>
              <p className="text-lg text-gray-500">Everything you need to sharpen your skills and dominate the charts.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="border-none shadow-none bg-transparent group">
                <CardHeader className="space-y-4 pt-0">
                  <div className="bg-white p-4 rounded-2xl shadow-md w-fit group-hover:bg-primary group-hover:text-white transition-all duration-300">
                    <BrainCircuit className="h-8 w-8 text-primary group-hover:text-white" />
                  </div>
                  <CardTitle className="text-2xl font-bold text-gray-900">Excel Integration</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-500 leading-relaxed">Directly import questions from Excel sheets. Perfect for teachers and organizers to maintain dynamic question sets.</p>
                </CardContent>
              </Card>
              <Card className="border-none shadow-none bg-transparent group">
                <CardHeader className="space-y-4 pt-0">
                  <div className="bg-white p-4 rounded-2xl shadow-md w-fit group-hover:bg-primary group-hover:text-white transition-all duration-300">
                    <Target className="h-8 w-8 text-primary group-hover:text-white" />
                  </div>
                  <CardTitle className="text-2xl font-bold text-gray-900">Precise Analytics</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-500 leading-relaxed">Detailed breakdowns of your performance. Know your weak spots and transform them into strengths with data-driven insights.</p>
                </CardContent>
              </Card>
              <Card className="border-none shadow-none bg-transparent group">
                <CardHeader className="space-y-4 pt-0">
                  <div className="bg-white p-4 rounded-2xl shadow-md w-fit group-hover:bg-primary group-hover:text-white transition-all duration-300">
                    <Star className="h-8 w-8 text-primary group-hover:text-white" />
                  </div>
                  <CardTitle className="text-2xl font-bold text-gray-900">Student Profiles</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-500 leading-relaxed">Manage your learning journey. Every test, every score, and every milestone is saved securely in your personalized dashoard.</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>

      <footer className="py-12 bg-white border-t border-gray-100">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            < Zap className="h-5 w-5 text-primary" />
            <span className="text-xl font-black tracking-tighter text-gray-900 uppercase">QUIZATHON</span>
          </div>
          <p className="text-sm text-gray-400 font-medium tracking-wide">
            &copy; {new Date().getFullYear()} Quizathon Global. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-sm font-bold text-gray-900">
            <Link href="#" className="hover:text-primary transition-colors">Privacy</Link>
            <Link href="#" className="hover:text-primary transition-colors">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
