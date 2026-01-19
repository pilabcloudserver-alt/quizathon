'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { Question } from '@/lib/types';
import QuestionCard from './QuestionCard';
import { Loader2, AlertTriangle } from 'lucide-react';
import { useFirestore, useDatabase } from '@/firebase';
import { ref, get } from 'firebase/database';
import { collection, getDocs, query, where, limit } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

interface QuizFlowProps {
  totalQuestions: number;
}

type AnsweredQuestion = {
  question: Question;
  selectedAnswer: string;
  isCorrect: boolean;
};

export default function QuizFlow({ totalQuestions }: QuizFlowProps) {
  const router = useRouter();
  const firestore = useFirestore();
  const database = useDatabase();
  const [allQuestions, setAllQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [answeredQuestions, setAnsweredQuestions] = useState<AnsweredQuestion[]>([]);
  const [score, setScore] = useState(0);
  const [currentDifficulty, setCurrentDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Easy');
  const [status, setStatus] = useState<'answering' | 'feedback' | 'loading' | 'error'>('loading');

  const questionNumber = answeredQuestions.length + 1;

  const fetchQuestion = async (difficulty: 'Easy' | 'Medium' | 'Hard', excludeIds: (string | number)[] = []) => {
    setStatus('loading');
    try {
      let questionsToSelectFrom: Question[] = [];

      // If we haven't loaded all questions yet, fetch them from RTDB
      if (allQuestions.length === 0) {
        const snapshot = await get(ref(database, 'questions'));
        if (snapshot.exists()) {
          const data = snapshot.val();
          // RTDB might return an object or array. Ensure it's an array for parsing.
          const questionsList: Question[] = Array.isArray(data)
            ? data.map((q, idx) => ({ ...q, id: q.id || idx.toString() }))
            : Object.keys(data).map(key => ({ ...data[key], id: key }));

          setAllQuestions(questionsList);
          questionsToSelectFrom = questionsList;
        } else {
          // Fallback to Firestore if RTDB is empty
          const querySnapshot = await getDocs(collection(firestore, 'questions'));
          const fsQuestions = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Question));
          setAllQuestions(fsQuestions);
          questionsToSelectFrom = fsQuestions;
        }
      } else {
        questionsToSelectFrom = allQuestions;
      }

      // Filter by difficulty and exclude already answered
      let potentialQuestions = questionsToSelectFrom.filter(q =>
        q.difficulty?.toLowerCase() === difficulty.toLowerCase() &&
        !excludeIds.includes(q.id)
      );

      // If no questions of desired difficulty, try any difficulty (excluding answered)
      if (potentialQuestions.length === 0) {
        potentialQuestions = questionsToSelectFrom.filter(q => !excludeIds.includes(q.id));
      }

      if (potentialQuestions.length > 0) {
        const nextQuestion = potentialQuestions[Math.floor(Math.random() * potentialQuestions.length)];
        setCurrentQuestion(nextQuestion);
        setStatus('answering');
      } else {
        // No more unique questions available
        if (answeredQuestions.length > 0) {
          router.push(`/quiz/results?score=${score}&total=${answeredQuestions.length}`);
        } else {
          setStatus('error');
        }
      }
    } catch (error) {
      console.error("Error fetching question:", error);
      setStatus('error');
    }
  };

  useEffect(() => {
    fetchQuestion('Easy');
  }, []);

  useEffect(() => {
    if (questionNumber > totalQuestions && status !== 'loading') {
      router.push(`/quiz/results?score=${score}&total=${totalQuestions}`);
    }
  }, [answeredQuestions, totalQuestions, score, router, status, questionNumber]);

  const handleAnswerSubmit = (selectedAnswer: string) => {
    if (!currentQuestion) return;

    // Smart Match Logic:
    // 1. Direct Text Match
    // 2. Index-based Letter Match (A, B, C, D)
    const isDirectMatch = selectedAnswer.trim().toLowerCase() === currentQuestion.correctAnswer?.toString().trim().toLowerCase();

    const optionIndex = currentQuestion.options.indexOf(selectedAnswer);
    const letterMatch = ['A', 'B', 'C', 'D'][optionIndex] === currentQuestion.correctAnswer?.toString().trim().toUpperCase();

    const isCorrect = isDirectMatch || letterMatch;

    if (isCorrect) {
      setScore(prev => prev + 1);
    }
    setAnsweredQuestions(prev => [
      ...prev,
      { question: currentQuestion, selectedAnswer, isCorrect },
    ]);
    setStatus('feedback');
  };

  const handleNextQuestion = async () => {
    if (questionNumber > totalQuestions) {
      router.push(`/quiz/results?score=${score}&total=${totalQuestions}`);
      return;
    }

    setStatus('loading');

    const performance = answeredQuestions.length > 0 ? (score / answeredQuestions.length) * 100 : 0;

    // Simple local difficulty adjustment logic instead of AI to avoid API key issues
    let newDifficulty = currentDifficulty;
    if (performance > 80 && currentDifficulty === 'Easy') newDifficulty = 'Medium';
    else if (performance > 80 && currentDifficulty === 'Medium') newDifficulty = 'Hard';
    else if (performance < 40 && currentDifficulty === 'Hard') newDifficulty = 'Medium';
    else if (performance < 40 && currentDifficulty === 'Medium') newDifficulty = 'Easy';

    setCurrentDifficulty(newDifficulty);

    const answeredIds = answeredQuestions.map(aq => aq.question.id);
    await fetchQuestion(newDifficulty, answeredIds);
  };

  if (status === 'loading' && !currentQuestion) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-muted-foreground">Loading first question...</p>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="container mx-auto flex h-full items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <div className="mx-auto bg-destructive/10 text-destructive p-3 rounded-full w-fit">
              <AlertTriangle className="h-8 w-8" />
            </div>
            <CardTitle className="mt-4">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Could not load any questions. Please upload questions or try again later.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-muted-foreground">Preparing your quiz...</p>
      </div>
    );
  }


  return (
    <QuestionCard
      question={currentQuestion}
      questionNumber={questionNumber}
      totalQuestions={totalQuestions}
      onAnswerSubmit={handleAnswerSubmit}
      onNext={handleNextQuestion}
      status={status}
      key={currentQuestion.id}
    />
  );
}
