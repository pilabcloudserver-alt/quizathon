'use client';

import { Suspense } from 'react';
import QuizFlow from '@/components/quiz/QuizFlow';
import { useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';

function StartQuizContent() {
  const searchParams = useSearchParams();
  const totalQuestions = parseInt(searchParams.get('count') || '10', 10);
  const subject = searchParams.get('subject') || undefined;

  return (
    <div className="container mx-auto flex flex-col items-center justify-center flex-grow p-4">
      <QuizFlow totalQuestions={totalQuestions} subject={subject} />
    </div>
  );
}

export default function StartPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center h-screen w-full">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    }>
      <StartQuizContent />
    </Suspense>
  );
}
