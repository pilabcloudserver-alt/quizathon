'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Award, RotateCw, Home, Share2, CheckCircle2, XCircle } from 'lucide-react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
} from 'recharts';
import { useUser, useDatabase } from '@/firebase';
import { ref, push, set, serverTimestamp } from 'firebase/database';
import Link from 'next/link';

export default function ResultsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useUser();
  const database = useDatabase();
  const [saved, setSaved] = useState(false);

  const score = parseInt(searchParams.get('score') || '0', 10);
  const total = parseInt(searchParams.get('total') || '0', 10);
  const subject = searchParams.get('subject') || 'General Knowledge';

  const percentage = total > 0 ? (score / total) * 100 : 0;

  useEffect(() => {
    if (user && !saved && total > 0) {
      const saveResult = async () => {
        try {
          const sanitize = (key: string) => key.replace(/[.#$/\[\]]/g, "-");
          const studentName = sanitize(user.displayName || user.email?.split('@')[0] || 'Unknown Student');
          const dateStr = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
          const subjectName = sanitize(subject);

          // Path: results/StudentName/Date/Subject/AttemptID
          const resultRef = ref(database, `results/${studentName}/${dateStr}/${subjectName}`);
          const newResultRef = push(resultRef);

          await set(newResultRef, {
            marks: score,
            total: total,
            percentage: parseFloat(percentage.toFixed(2)),
            timestamp: serverTimestamp(),
            subject: subject // Store original subject name too
          });

          setSaved(true);
          console.log("Result saved successfully");
        } catch (error) {
          console.error("Error saving result:", error);
        }
      };

      saveResult();
    }
  }, [user, score, total, subject, saved, database, percentage]);


  const getPerformanceMessage = () => {
    if (percentage >= 90) return { text: "Outstanding!", sub: "You're a true master of this subject." };
    if (percentage >= 75) return { text: "Great Job!", sub: "You have a solid understanding." };
    if (percentage >= 50) return { text: "Good Effort", sub: "Keep practicing to improve your score." };
    return { text: "Needs Improvement", sub: "Don't give up! Study the material and try again." };
  };

  const performance = getPerformanceMessage();
  const chartData = [
    { subject: 'Accuracy', A: percentage, fullMark: 100 },
    { subject: 'Completion', A: 100, fullMark: 100 },
    { subject: 'Speed', A: 85, fullMark: 100 }, // Mock data for visual balance
  ];

  return (
    <div className="min-h-[100dvh] w-full bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>

      <Card className="w-full max-w-2xl border-0 shadow-2xl bg-white/80 backdrop-blur-xl overflow-hidden relative z-10">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary to-purple-600"></div>

        <CardHeader className="text-center pb-2 pt-10">
          <div className="mx-auto bg-yellow-100 text-yellow-600 p-6 rounded-full w-fit mb-6 shadow-inner ring-4 ring-white">
            <Award className="h-16 w-16" />
          </div>
          <CardTitle className="text-4xl font-black text-gray-900 tracking-tight mb-2">{performance.text}</CardTitle>
          <CardDescription className="text-lg font-medium text-gray-500">
            {performance.sub}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-8 pt-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-primary/5 border border-primary/10 rounded-2xl p-4 text-center flex flex-col justify-center">
              <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-1">Score</p>
              <p className="text-4xl font-black text-primary">{score}<span className="text-xl text-gray-400">/{total}</span></p>
            </div>
            <div className="bg-green-50 border border-green-100 rounded-2xl p-4 text-center flex flex-col justify-center">
              <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-1">Percentage</p>
              <p className="text-4xl font-black text-green-600">{Math.round(percentage)}%</p>
            </div>
            <div className="bg-purple-50 border border-purple-100 rounded-2xl p-4 text-center flex flex-col justify-center">
              <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-1">Subject</p>
              <p className="text-lg font-bold text-purple-700 leading-tight line-clamp-2">{subject}</p>
            </div>
          </div>

          <div className="h-64 w-full bg-gray-50 rounded-2xl p-4 border border-gray-100">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={chartData}>
                <PolarGrid stroke="#e5e7eb" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#6b7280', fontSize: 12, fontWeight: 600 }} />
                <Radar name="Performance" dataKey="A" stroke="#4f46e5" strokeWidth={3} fill="#4f46e5" fillOpacity={0.2} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col sm:flex-row gap-3 pb-8 px-8">
          <Link href="/" className="w-full">
            <Button variant="outline" size="lg" className="w-full rounded-xl font-bold border-gray-200 hover:bg-gray-50 hover:text-gray-900 h-12">
              <Home className="mr-2 h-4 w-4" /> Go Home
            </Button>
          </Link>
          <Button size="lg" className="w-full rounded-xl font-bold shadow-lg shadow-primary/20 hover:shadow-primary/30 h-12" onClick={() => router.push('/quiz')}>
            <RotateCw className="mr-2 h-4 w-4" />
            Play Again
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
