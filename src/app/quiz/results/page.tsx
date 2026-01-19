'use client';

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
import { Award, RotateCw } from 'lucide-react';
import {
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
} from 'recharts';

export default function ResultsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const score = parseInt(searchParams.get('score') || '0', 10);
  const total = parseInt(searchParams.get('total') || '0', 10);

  const percentage = total > 0 ? (score / total) * 100 : 0;

  const getPerformanceMessage = () => {
    if (percentage >= 80) return "Excellent work! You're a true QuizMaster!";
    if (percentage >= 50) return "Great job! Keep practicing to reach the top.";
    return "Good effort! Every quiz is a step forward.";
  };

  const chartData = [
    { subject: 'Score', A: percentage, fullMark: 100 },
  ];

  return (
    <div className="container mx-auto flex h-full items-center justify-center p-4">
      <Card className="w-full max-w-2xl text-center">
        <CardHeader>
          <div className="mx-auto bg-accent/20 text-accent p-4 rounded-full w-fit mb-4">
            <Award className="h-10 w-10" />
          </div>
          <CardTitle className="text-3xl font-bold">Quiz Complete!</CardTitle>
          <CardDescription className="text-lg">
            {getPerformanceMessage()}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col md:flex-row items-center justify-center gap-8">
            <div className='flex-1'>
                 <p className="text-6xl font-bold text-primary">{score}<span className="text-3xl font-medium text-muted-foreground">/{total}</span></p>
                 <p className="text-lg font-semibold mt-2">Correct Answers</p>
            </div>
            <div className="w-full md:w-1/2 h-60">
              <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: 'hsl(var(--foreground))' }} />
                    <Radar name="Performance" dataKey="A" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.6} />
                  </RadarChart>
              </ResponsiveContainer>
              <p className="text-2xl font-bold">{Math.round(percentage)}%</p>
              <p className="text-sm text-muted-foreground">Overall Score</p>
            </div>
        </CardContent>
        <CardFooter>
          <Button size="lg" className="w-full" onClick={() => router.push('/quiz')}>
            <RotateCw className="mr-2 h-4 w-4" />
            Play Again
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
