'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Rocket } from 'lucide-react';

export default function QuizDashboard() {
  const [numQuestions, setNumQuestions] = useState('10');
  const router = useRouter();

  const handleStartQuiz = () => {
    router.push(`/quiz/start?count=${numQuestions}`);
  };

  return (
    <div className="container mx-auto flex h-full items-center justify-center p-4">
      <Card className="w-full max-w-lg text-center">
        <CardHeader>
          <div className="mx-auto bg-primary/10 text-primary p-4 rounded-full w-fit mb-4">
            <Rocket className="h-10 w-10" />
          </div>
          <CardTitle className="text-3xl font-bold">Prepare Your Quiz</CardTitle>
          <CardDescription className="text-lg">
            Customize your Quizathon challenge and test your skills!
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="font-medium">Select the number of questions:</p>
          <div className="w-48 mx-auto">
            <Select value={numQuestions} onValueChange={setNumQuestions}>
              <SelectTrigger>
                <SelectValue placeholder="Number of questions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5 Questions</SelectItem>
                <SelectItem value="10">10 Questions</SelectItem>
                <SelectItem value="15">15 Questions</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
        <CardFooter>
          <Button size="lg" className="w-full" onClick={handleStartQuiz}>
            Start Quiz
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
