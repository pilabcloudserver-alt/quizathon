'use client';

import { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useFirestore, useUser, useDatabase } from '@/firebase';
import { collection, writeBatch, doc, setDoc, increment, serverTimestamp } from 'firebase/firestore';
import { ref, set, push, update, child } from 'firebase/database';
import { Loader2, UploadCloud, CheckCircle, AlertTriangle, ArrowLeft, Home, Brain } from 'lucide-react';
import { Question } from '@/lib/types';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Label } from '@/components/ui/label';

export default function UploadPage() {
  const router = useRouter();
  const { user, isUserLoading } = useUser();
  const [file, setFile] = useState<File | null>(null);
  const [subjectName, setSubjectName] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<{ fs?: boolean, rtdb?: boolean } | null>(null);
  const { toast } = useToast();
  const firestore = useFirestore();
  const database = useDatabase();

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || selectedFile.type === 'application/vnd.ms-excel') {
        setFile(selectedFile);
        setUploadStatus(null);
      } else {
        toast({
          variant: 'destructive',
          title: 'Invalid File Type',
          description: 'Please upload a valid Excel file.',
        });
      }
    }
  };



  const sanitizeKey = (key: string) => {
    return key.replace(/[.#$/\[\]]/g, "-");
  };

  const handleUpload = async () => {
    if (!file) return;
    if (!subjectName.trim()) {
      toast({
        variant: 'destructive',
        title: 'Missing Subject Name',
        description: 'Please enter a name for the subject (e.g., Mathematics, Physics).',
      });
      return;
    }

    setIsUploading(true);
    setUploadStatus(null);

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json<any>(worksheet);

        if (json.length === 0) throw new Error("Excel sheet is empty.");

        const parsedQuestions: Omit<Question, 'id'>[] = json.map((row, index) => {
          const qText = row['Question']?.toString().trim() || "";
          const optA = row['Option A']?.toString().trim() || "";
          const optB = row['Option B']?.toString().trim() || "";
          const optC = row['Option C']?.toString().trim() || "";
          const optD = row['Option D']?.toString().trim() || "";
          const ans = row['Correct Answer']?.toString().trim() || "";

          const options = [optA, optB, optC, optD].filter(Boolean);
          let correctAnswer = ans;

          // Convert letter to text if necessary
          if (ans.toUpperCase() === 'A') correctAnswer = optA;
          else if (ans.toUpperCase() === 'B') correctAnswer = optB;
          else if (ans.toUpperCase() === 'C') correctAnswer = optC;
          else if (ans.toUpperCase() === 'D') correctAnswer = optD;

          return {
            question: qText,
            options: options,
            correctAnswer: correctAnswer,

            difficulty: 'Medium',
            topic: 'General',
            subject: subjectName.trim(),
          };
        });

        let rtdbOk = false;

        // let fsOk = false; // Firestore disabled per requirement

        // 1. Try RTDB
        try {
          // Use update to append questions instead of set (which overwrites)
          const updates: any = {};
          const sanitizedSubject = sanitizeKey(subjectName.trim());

          parsedQuestions.forEach((q) => {
            const newKey = push(child(ref(database), `questions/${sanitizedSubject}`)).key;
            if (newKey) {
              updates[`/questions/${sanitizedSubject}/${newKey}`] = q;
            }
          });

          // Also update subject metadata
          updates[`/subjects/${sanitizedSubject}/name`] = subjectName.trim();
          updates[`/subjects/${sanitizedSubject}/lastUpdated`] = new Date().toISOString();

          await update(ref(database), updates);

          console.log("RTDB save successful");
          rtdbOk = true;
        } catch (err: any) {
          console.error("RTDB Save Error:", err.message);
        }

        // 2. Firestore saving disabled as per requirement
        // try { ... } catch (err) { ... }

        setUploadStatus({ fs: true, rtdb: rtdbOk });

        if (rtdbOk) {
          toast({
            title: 'Upload Result',
            description: 'Successfully saved to Realtime Database.',
          });
          setFile(null);
        } else {
          toast({
            variant: 'destructive',
            title: 'Upload Failed',
            description: 'Realtime Database rejected the write.',
          });
        }



      } catch (error: any) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: error.message,
        });
      } finally {
        setIsUploading(false);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  if (isUserLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] w-full bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4 relative">
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>

      {/* Back Button */}
      <Link href="/quiz" className="hidden md:block absolute top-4 left-4 md:top-8 md:left-8 z-50">
        <Button variant="ghost" className="bg-white/50 backdrop-blur-sm hover:bg-white text-gray-600 hover:text-primary border border-gray-200/50 shadow-sm transition-all rounded-full px-4 h-10 group">
          <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          <span className="font-bold">Home</span>
        </Button>
      </Link>

      <Card className="w-full max-w-5xl border-0 shadow-2xl bg-white/80 backdrop-blur-xl overflow-hidden grid md:grid-cols-2 relative z-10">

        {/* Left Side - Visual - Hidden on Mobile */}
        <div className="hidden md:flex bg-primary/5 p-10 flex-col justify-center items-center text-center space-y-8 border-r border-gray-100">
          <div className="relative group">
            <div className="absolute inset-0 bg-blue-400/20 blur-3xl rounded-full group-hover:bg-blue-400/30 transition-all duration-500"></div>
            <div className="bg-white p-8 rounded-[2rem] shadow-xl relative transform transition-transform hover:scale-105 duration-500">
              <UploadCloud className="w-24 h-24 text-primary" strokeWidth={1.5} />
            </div>
          </div>

          <div className="space-y-3 max-w-xs">
            <h2 className="text-3xl font-black text-gray-900 tracking-tight">Bulk Import</h2>
            <p className="text-gray-500 font-medium">Seamlessly populate your question bank using standard Excel sheets.</p>
          </div>

          <div className="grid grid-cols-1 gap-4 w-full max-w-xs text-left">
            <div className="flex items-center gap-3 p-3 bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="bg-green-100 p-2 rounded-lg"><CheckCircle className="w-4 h-4 text-green-600" /></div>
              <span className="text-xs font-bold text-gray-600">Auto-Validation</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="bg-purple-100 p-2 rounded-lg"><CheckCircle className="w-4 h-4 text-purple-600" /></div>
              <span className="text-xs font-bold text-gray-600">Subject Categorization</span>
            </div>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="p-6 md:p-10 flex flex-col justify-center space-y-8">
          <CardHeader className="p-0 space-y-2">
            <div className="md:hidden flex flex-col items-center mb-4">
              <div className="bg-primary/10 p-3 rounded-full mb-2">
                <UploadCloud className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-xl font-black text-gray-900">Import Questions</h2>
            </div>
            <CardTitle className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">Upload Data</CardTitle>
            <CardDescription className="text-sm md:text-base text-gray-500 font-medium run-in">
              Please ensure your file matches the required schema.
            </CardDescription>
          </CardHeader>

          <CardContent className="p-0 space-y-6">
            <div className="space-y-3 bg-blue-50/50 p-5 rounded-2xl border border-blue-100/50">
              <p className='text-xs font-bold text-blue-900 flex items-center gap-2 uppercase tracking-wider'>
                <AlertTriangle className="h-3 w-3" /> Required Columns
              </p>
              <div className="flex flex-wrap gap-2">
                {['Question', 'Option A', 'Option B', 'Option C', 'Option D', 'Correct Answer'].map(col => (
                  <span key={col} className="bg-white px-2 py-1 rounded-md border border-blue-100 text-[10px] font-bold text-blue-600 shadow-sm">{col}</span>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="subject-name" className="text-sm font-bold text-gray-700">Subject Name</Label>
                <Input
                  id="subject-name"
                  placeholder="e.g. Mathematics"
                  value={subjectName}
                  onChange={(e) => setSubjectName(e.target.value)}
                  disabled={isUploading}
                  className="h-12 border-gray-200 bg-gray-50/50 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all rounded-xl font-medium"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="excel-file" className="text-sm font-bold text-gray-700">Excel File (.xlsx)</Label>
                <div className="relative group">
                  <Input
                    id="excel-file"
                    type="file"
                    onChange={handleFileChange}
                    accept=".xlsx, .xls"
                    disabled={isUploading}
                    className="h-12 pt-2.5 cursor-pointer file:cursor-pointer file:bg-primary file:text-white file:border-0 file:rounded-lg file:px-3 file:py-1 file:mr-4 file:text-xs file:font-bold hover:border-primary transition-all duration-300 rounded-xl bg-gray-50/50 border-gray-200"
                  />
                </div>
              </div>
            </div>

            {uploadStatus && (
              <div className={`p-4 rounded-xl flex items-center gap-3 text-sm font-bold border ${uploadStatus.rtdb ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                {uploadStatus.rtdb ? <CheckCircle className="h-5 w-5" /> : <AlertTriangle className="h-5 w-5" />}
                <div>
                  <p>Realtime Database</p>
                  <p className="text-[10px] opacity-80 font-normal uppercase">{uploadStatus.rtdb ? 'Upload Successful' : 'Upload Failed'}</p>
                </div>
              </div>
            )}

            <Button
              onClick={handleUpload}
              disabled={!file || isUploading}
              className="w-full h-14 rounded-xl text-lg font-bold shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all duration-300"
            >
              {isUploading ? <><Loader2 className="mr-3 h-5 w-5 animate-spin" /> Processing...</> : 'Start Import'}
            </Button>
          </CardContent>
        </div>
      </Card>


    </div >
  );
}
