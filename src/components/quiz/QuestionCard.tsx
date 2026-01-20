'use client';

import { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '../ui/card';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { cn } from '@/lib/utils';
import type { Question } from '@/lib/types';
import { CheckCircle2, XCircle, ArrowRight, Loader2, HelpCircle, Check, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

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

    <div className="w-full max-w-4xl mx-auto">
      <Card className="border-0 shadow-2xl bg-white/90 backdrop-blur-md overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-gray-100">
          <div
            className="h-full bg-primary transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          ></div>
        </div>

        <CardHeader className="pt-6 md:pt-8 pb-2 space-y-4">
          <div className="flex justify-between items-start">
            <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20 transition-colors uppercase tracking-widest text-[10px] font-bold px-3 py-1">
              Question {questionNumber} / {totalQuestions}
            </Badge>
            <Badge
              variant="outline"
              className={cn(
                "font-bold uppercase tracking-wider text-[10px]",
                question.difficulty === 'Easy' && "text-green-600 border-green-200 bg-green-50",
                question.difficulty === 'Medium' && "text-amber-600 border-amber-200 bg-amber-50",
                question.difficulty === 'Hard' && "text-red-600 border-red-200 bg-red-50",
              )}
            >
              {question.difficulty}
            </Badge>
          </div>

          <h2 className="text-xl md:text-3xl font-black text-gray-900 leading-tight tracking-tight">
            {question.question}
          </h2>
        </CardHeader>

        <CardContent className="space-y-4 pt-6">
          <div className="grid grid-cols-1 gap-3">
            {question.options.map((option, index) => {
              const isSelected = selectedOption === option;

              // Smart Correct Answer Detection
              const isTextCorrect = option === question.correctAnswer;
              const isLetterCorrect = ['A', 'B', 'C', 'D'][index] === question.correctAnswer?.toString().toUpperCase();
              const isCorrect = isTextCorrect || isLetterCorrect;

              const letter = ['A', 'B', 'C', 'D'][index];

              let cardStyle = "border-2 border-gray-100 bg-white hover:border-primary/50 hover:bg-gray-50 text-gray-700";
              let icon = <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-500 font-bold flex items-center justify-center text-sm group-hover:bg-white group-hover:text-primary transition-colors">{letter}</div>;

              if (status === 'feedback') {
                if (isCorrect) {
                  cardStyle = "border-green-500 bg-green-50 text-green-900 font-medium ring-1 ring-green-500";
                  icon = <div className="w-8 h-8 rounded-full bg-green-200 text-green-700 flex items-center justify-center"><Check className="w-5 h-5" /></div>;
                } else if (isSelected && !isCorrect) {
                  cardStyle = "border-red-500 bg-red-50 text-red-900 font-medium ring-1 ring-red-500";
                  icon = <div className="w-8 h-8 rounded-full bg-red-200 text-red-700 flex items-center justify-center"><X className="w-5 h-5" /></div>;
                } else {
                  cardStyle = "opacity-50 border-gray-100 bg-gray-50";
                }
              } else if (isSelected) {
                cardStyle = "border-primary bg-primary/5 text-primary font-medium ring-1 ring-primary";
                icon = <div className="w-8 h-8 rounded-full bg-primary text-white font-bold flex items-center justify-center text-sm">{letter}</div>;
              }

              return (
                <div
                  key={`${question.id}-${index}`}
                  className={cn(
                    "relative group cursor-pointer rounded-2xl p-4 flex items-center gap-4 transition-all duration-200",
                    cardStyle,
                    (status === 'feedback' || status === 'loading') && "cursor-default  active:scale-100"
                  )}
                  onClick={() => !(status === 'feedback' || status === 'loading') && handleOptionSelect(option)}
                >
                  {icon}
                  <span className="text-lg flex-grow leading-relaxed">{option}</span>
                </div>
              );
            })}
          </div>
        </CardContent>

        <CardFooter className="pt-6 pb-6 md:pb-8 bg-gray-50/50 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
          {/* Hint or Helper Text Position */}
          <div className="text-xs text-gray-400 font-medium hidden sm:flex items-center gap-1">
            <HelpCircle className="w-3 h-3" /> Select an option to continue
          </div>

          {status === 'answering' && (
            <Button
              size="lg"
              className="w-full sm:w-auto px-8 rounded-xl font-bold shadow-lg shadow-primary/20 hover:shadow-primary/30 active:scale-95 transition-all text-base"
              onClick={handleSubmit}
              disabled={!selectedOption}
            >
              Submit Answer
            </Button>
          )}
          {status === 'feedback' && (
            <Button
              size="lg"
              className="w-full sm:w-auto px-8 rounded-xl font-bold text-base shadow-lg animate-in fade-in slide-in-from-bottom-2 duration-300"
              onClick={handleNext}
              autoFocus
            >
              Next Question <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          )}
          {status === 'loading' && (
            <Button variant="ghost" disabled className="text-muted-foreground font-medium">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Loading next challenge...
            </Button>
          )}
        </CardFooter>
      </Card>

      <div className="mt-8 flex justify-center gap-2">
        {Array.from({ length: Math.min(totalQuestions, 20) }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "h-1.5 rounded-full transition-all duration-300",
              i < questionNumber ? "w-4 bg-primary" : "w-1.5 bg-gray-200",
              i === questionNumber - 1 && "scale-125"
            )}
          />
        ))}
      </div>
    </div>
  );
}
