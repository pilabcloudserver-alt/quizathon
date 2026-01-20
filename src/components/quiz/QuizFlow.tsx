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
  subject?: string;
}

type AnsweredQuestion = {
  question: Question;
  selectedAnswer: string;
  isCorrect: boolean;
};

export default function QuizFlow({ totalQuestions, subject }: QuizFlowProps) {
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
  const displayQuestionNumber = status === 'feedback' ? answeredQuestions.length : questionNumber;

  const fetchQuestion = async (difficulty: 'Easy' | 'Medium' | 'Hard', excludeIds: (string | number)[] = []) => {
    setStatus('loading');
    try {
      let questionsToSelectFrom: Question[] = [];

      // If we haven't loaded all questions yet, fetch them from RTDB
      if (allQuestions.length === 0) {
        // Fallback to Firestore if RTDB is empty or if we prefer Firestore query
        // Check if we should use Firestore query for subject
        let fsQuestions: Question[] = [];

        try {
          const sanitizeKey = (key: string) => key.replace(/[.#$/\[\]]/g, "-");

          if (subject) {
            // Fetch from subcollection: questions/{subject}/items
            const sanitizedSubject = sanitizeKey(subject);
            const questionsRef = collection(firestore, 'questions', sanitizedSubject, 'items');
            const q = query(questionsRef);
            const querySnapshot = await getDocs(q);
            fsQuestions = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Question));
          } else {
            // For "All", fetching from subcollections requires collectionGroup(firestore, 'items')
            // But we might conflict with other 'items'. 
            // For now, let's allow "All" to fall back to RTDB which handles nested structure efficiently.
            // So we leave fsQuestions as empty array here.
          }
        } catch (e) {
          console.error("Firestore fetch error", e);
        }

        if (fsQuestions.length > 0) {
          setAllQuestions(fsQuestions);
          questionsToSelectFrom = fsQuestions;
        } else {
          // Try RTDB as fallback or primary if Firestore empty

          const sanitizeKey = (key: string) => key.replace(/[.#$/\[\]]/g, "-");

          let rtdbPath = 'questions';
          if (subject) {
            rtdbPath = `questions/${sanitizeKey(subject)}`;
          }

          const snapshot = await get(ref(database, rtdbPath));
          if (snapshot.exists()) {
            const data = snapshot.val();
            let questionsList: Question[] = [];

            if (subject) {
              // If specific subject, data is likely { key: Question, key2: Question }
              questionsList = Object.keys(data).map(key => ({ ...data[key], id: key }));
            } else {
              // If all questions, data might be { subject1: { q1: ... }, subject2: { ... } } or flat { q1: ... }
              // We attempt to flatten
              Object.keys(data).forEach(key => {
                const item = data[key];
                if (item.question && item.options) {
                  // It's a question (flat structure)
                  questionsList.push({ ...item, id: key });
                } else {
                  // It's likely a subject container
                  Object.keys(item).forEach(innerKey => {
                    const subItem = item[innerKey];
                    if (subItem.question) {
                      questionsList.push({ ...subItem, id: innerKey });
                    }
                  });
                }
              });
            }

            setAllQuestions(questionsList);
            questionsToSelectFrom = questionsList;
          }
        }
      } else {
        questionsToSelectFrom = allQuestions;
      }

      // Filter by difficulty and exclude already answered
      let potentialQuestions = questionsToSelectFrom.filter(q =>
        q.difficulty?.toLowerCase() === difficulty.toLowerCase() &&
        !excludeIds.includes(q.id)
      );

      // Filter by subject if provided
      if (subject) {
        potentialQuestions = potentialQuestions.filter(q => q.subject === subject);
      }

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
          router.push(`/quiz/results?score=${score}&total=${answeredQuestions.length}&subject=${encodeURIComponent(subject || 'General')}`);
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
      router.push(`/quiz/results?score=${score}&total=${totalQuestions}&subject=${encodeURIComponent(subject || 'General')}`);
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
      router.push(`/quiz/results?score=${score}&total=${totalQuestions}&subject=${encodeURIComponent(subject || 'General')}`);
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
      questionNumber={displayQuestionNumber}
      totalQuestions={totalQuestions}
      onAnswerSubmit={handleAnswerSubmit}
      onNext={handleNextQuestion}
      status={status}
      key={currentQuestion.id}
    />
  );
}
