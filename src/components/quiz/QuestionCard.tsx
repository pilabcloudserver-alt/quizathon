'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { cn } from '@/lib/utils';
import type { Question } from '@/lib/types';
import { CheckCircle2, XCircle, ArrowRight, Loader2 } from 'lucide-react';

interface QuestionCardProps {
  question: Question;
  questionNumber: number;
  totalQuestions: number;
  onAnswerSubmit: (selectedAnswer: string) => void;
  onNext: () => void;
  status: 'answering' | 'feedback' | 'loading';
}

export default function QuestionCard({
  question,
  questionNumber,
  totalQuestions,
  onAnswerSubmit,
  onNext,
  status,
}: QuestionCardProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const handleOptionSelect = (option: string) => {
    if (status === 'answering') {
      setSelectedOption(option);
    }
  };

  const handleSubmit = () => {
    if (selectedOption) {
      onAnswerSubmit(selectedOption);
    }
  };

  const handleNext = () => {
    setSelectedOption(null);
    onNext();
  }

  const progress = (questionNumber / totalQuestions) * 100;

  return (
    <Card className="w-full max-w-3xl">
      <CardHeader>
        <div className="flex justify-between items-center mb-2">
          <CardDescription>Question {questionNumber} of {totalQuestions}</CardDescription>
          <CardDescription>Difficulty: <span className="font-semibold text-foreground">{question.difficulty}</span></CardDescription>
        </div>
        <Progress value={progress} className="w-full" />
        <CardTitle className="pt-6 text-2xl">{question.question}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {question.options.map((option, index) => {
          const isSelected = selectedOption === option;

          // Smart Correct Answer Detection
          const isTextCorrect = option === question.correctAnswer;
          const isLetterCorrect = ['A', 'B', 'C', 'D'][index] === question.correctAnswer?.toString().toUpperCase();
          const isCorrect = isTextCorrect || isLetterCorrect;

          return (
            <Button
              key={`${question.id}-${index}`}
              variant="outline"
              className={cn(
                'w-full justify-start h-auto py-3 text-left whitespace-normal',
                status === 'feedback' && isCorrect && 'bg-accent/20 border-accent text-accent-foreground hover:bg-accent/30',
                status === 'feedback' && isSelected && !isCorrect && 'bg-destructive/20 border-destructive text-destructive-foreground hover:bg-destructive/30',
                isSelected && status === 'answering' && 'ring-2 ring-primary'
              )}
              onClick={() => handleOptionSelect(option)}
              disabled={status === 'feedback' || status === 'loading'}
            >
              {status === 'feedback' && isSelected && !isCorrect && <XCircle className="mr-2 h-5 w-5" />}
              {status === 'feedback' && isCorrect && <CheckCircle2 className="mr-2 h-5 w-5" />}
              {option}
            </Button>
          );
        })}
      </CardContent>
      <CardFooter>
        {status === 'answering' && (
          <Button className="w-full" onClick={handleSubmit} disabled={!selectedOption}>
            Submit Answer
          </Button>
        )}
        {status === 'feedback' && (
          <Button className="w-full" onClick={handleNext} autoFocus>
            Next Question <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        )}
        {status === 'loading' && (
          <Button className="w-full" disabled>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Loading...
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
