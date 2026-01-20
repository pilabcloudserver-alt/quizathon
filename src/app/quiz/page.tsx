'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useFirestore, useDatabase } from '@/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { ref, get } from 'firebase/database';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Rocket, Brain, Sparkles, BookOpen, Layers } from 'lucide-react';

export default function QuizDashboard() {
  const [numQuestions, setNumQuestions] = useState('10');
  const [subject, setSubject] = useState<string>('');
  const [subjects, setSubjects] = useState<{ id: string; name: string }[]>([]);
  const router = useRouter();
  const firestore = useFirestore();
  const database = useDatabase();

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        // Try Firestore first
        const querySnapshot = await getDocs(collection(firestore, 'subjects'));
        let subjectList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          name: doc.data().name || doc.id
        }));

        // If Firestore empty, try RTDB
        if (subjectList.length === 0) {
          const snapshot = await get(ref(database, 'subjects'));
          if (snapshot.exists()) {
            const data = snapshot.val();
            subjectList = Object.keys(data).map(key => ({
              id: key,
              name: data[key].name || key
            }));
          }
        }

        setSubjects(subjectList);
        if (subjectList.length > 0) {
          setSubject(subjectList[0].name);
        }
      } catch (error) {
        console.error("Error fetching subjects:", error);
      }
    };
    fetchSubjects();
  }, [firestore, database]);

  const handleStartQuiz = () => {
    let url = `/quiz/start?count=${numQuestions}`;
    if (subject) {
      url += `&subject=${encodeURIComponent(subject)}`;
    }
    router.push(url);
  };

  return (

    <div className="min-h-[100dvh] w-full bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex flex-col items-center justify-center p-4 pb-24 md:p-4">
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>

      <Card className="w-full max-w-4xl border-0 shadow-2xl bg-white/80 backdrop-blur-xl overflow-hidden grid md:grid-cols-2 relative z-10">

        {/* Left Side - Visual */}
        {/* Left Side - Visual - Hidden on Mobile */}
        <div className="hidden md:flex bg-primary/5 p-8 flex-col justify-center items-center text-center space-y-6 md:border-r border-gray-100">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full"></div>
            <div className="bg-white p-6 rounded-3xl shadow-xl relative transform transition-transform hover:scale-105 duration-500">
              <Brain className="w-20 h-20 text-primary" strokeWidth={1.5} />
            </div>
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">Ready to excel?</h2>
            <p className="text-sm text-gray-500 font-medium">Challenge yourself with our curated question bank.</p>
          </div>

          <div className="grid grid-cols-2 gap-3 w-full max-w-xs mt-4">
            <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center gap-1">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <span className="text-xs font-bold text-gray-600">Smart Scoring</span>
            </div>
            <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center gap-1">
              <Layers className="w-5 h-5 text-blue-500" />
              <span className="text-xs font-bold text-gray-600">Topic Wise</span>
            </div>
          </div>
        </div>

        {/* Right Side - Form */}
        {/* Right Side - Form */}
        <div className="p-5 md:p-8 flex flex-col justify-center space-y-4 md:space-y-8">
          <CardHeader className="p-0 space-y-2">
            <div className="md:hidden flex flex-col items-center mb-4 text-center">
              <div className="bg-primary/10 p-3 rounded-full mb-2">
                <Brain className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-xl font-black text-gray-900">Quizathon</h2>
            </div>
            <Badge variant="outline" className="w-fit text-primary border-primary/20 bg-primary/5 px-3 py-1 uppercase tracking-widest text-[10px] font-bold">Quiz Configuration</Badge>
            <CardTitle className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">Setup Your Session</CardTitle>
            <CardDescription className="text-sm md:text-base text-gray-500 font-medium run-in">
              Customize your experience to fit your learning goals.
            </CardDescription>
          </CardHeader>

          <div className="space-y-6">
            <div className="space-y-3">
              <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-primary" />
                Select Subject
              </label>
              <Select value={subject} onValueChange={setSubject}>
                <SelectTrigger className="h-10 md:h-12 border-gray-200 bg-gray-50/50 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all rounded-xl font-medium">
                  <SelectValue placeholder="Choose a subject..." />
                </SelectTrigger>
                <SelectContent>
                  {subjects.length > 0 ? (
                    subjects.map((sub) => (
                      <SelectItem key={sub.id} value={sub.name} className="font-medium cursor-pointer">{sub.name}</SelectItem>
                    ))
                  ) : (
                    <div className="p-3 text-sm text-center text-muted-foreground">Loading subjects...</div>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                <Layers className="w-4 h-4 text-primary" />
                Question Count
              </label>
              <Select value={numQuestions} onValueChange={setNumQuestions}>
                <SelectTrigger className="h-10 md:h-12 border-gray-200 bg-gray-50/50 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all rounded-xl font-medium">
                  <SelectValue placeholder="How many questions?" />
                </SelectTrigger>
                <SelectContent>
                  {[5, 10, 15, 20, 25, 30].map((num) => (
                    <SelectItem key={num} value={num.toString()} className="font-medium cursor-pointer">{num} Questions</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              size="lg"
              className="w-full h-12 md:h-14 rounded-xl text-lg font-bold shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all duration-300"
              onClick={handleStartQuiz}
              disabled={!subject}
            >
              Start Quiz <Rocket className="ml-2 w-5 h-5 animate-pulse" />
            </Button>

            {!subject && subjects.length > 0 && (
              <p className="text-xs text-center text-amber-600 font-medium bg-amber-50 p-2 rounded-lg">
                * Please select a subject to proceed.
              </p>
            )}
          </div>
        </div>
      </Card>

      {/* Decorative background elements */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-200/30 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-200/30 rounded-full blur-[100px]"></div>
      </div>
    </div>
  );
}
