'use client';
import QuizFlow from '@/components/quiz/QuizFlow';
import { useSearchParams } from 'next/navigation';

export default function StartPage() {
  const searchParams = useSearchParams();
  const totalQuestions = parseInt(searchParams.get('count') || '10', 10);
  const subject = searchParams.get('subject') || undefined;

  return (
    <div className="container mx-auto flex flex-col items-center justify-center flex-grow p-4">
      <QuizFlow totalQuestions={totalQuestions} subject={subject} />
    </div>
  );
}
