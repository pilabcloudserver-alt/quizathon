'use client';

import { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useFirestore, useUser, useDatabase } from '@/firebase';
import { collection, writeBatch, doc } from 'firebase/firestore';
import { ref, set } from 'firebase/database';
import { Loader2, UploadCloud, CheckCircle, AlertTriangle } from 'lucide-react';
import { Question } from '@/lib/types';
import { useRouter } from 'next/navigation';

export default function UploadPage() {
  const router = useRouter();
  const { user, isUserLoading } = useUser();
  const [file, setFile] = useState<File | null>(null);
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

  const handleUpload = async () => {
    if (!file) return;

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
          };
        });

        let rtdbOk = false;
        let fsOk = false;

        // 1. Try RTDB
        try {
          await set(ref(database, 'questions'), parsedQuestions);
          console.log("RTDB save successful");
          rtdbOk = true;
        } catch (err: any) {
          console.error("RTDB Save Error:", err.message);
        }

        // 2. Try Firestore
        try {
          const batch = writeBatch(firestore);
          const questionsRef = collection(firestore, 'questions');
          parsedQuestions.forEach((q) => {
            const docRef = doc(questionsRef);
            batch.set(docRef, q);
          });
          await batch.commit();
          console.log("Firestore save successful");
          fsOk = true;
        } catch (err: any) {
          console.error("Firestore Save Error:", err.message);
        }

        setUploadStatus({ fs: fsOk, rtdb: rtdbOk });

        if (rtdbOk || fsOk) {
          toast({
            title: 'Upload Result',
            description: `Successfully saved to: ${[rtdbOk ? 'Realtime DB' : '', fsOk ? 'Firestore' : ''].filter(Boolean).join(' & ')}`,
          });
          setFile(null);
        } else {
          toast({
            variant: 'destructive',
            title: 'Upload Failed Completely',
            description: 'Both Firestore and Realtime Database rejected the write. Please check your Firebase Security Rules.',
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
    <div className="container mx-auto flex h-full items-center justify-center p-4">
      <Card className="w-full max-w-lg border-2 border-primary/20 shadow-xl bg-white/80 backdrop-blur-sm">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto bg-primary/10 text-primary p-4 rounded-xl w-fit mb-4">
            <UploadCloud className="h-12 w-12" />
          </div>
          <CardTitle className="text-3xl font-bold tracking-tight text-gray-800">Populate Quiz Library</CardTitle>
          <CardDescription className="text-base text-gray-500">
            Import bulk MCQs from your Excel workbook.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-4">
          <div className="space-y-3 bg-blue-50/50 p-5 rounded-xl border border-blue-100">
            <p className='text-sm font-semibold text-blue-900 flex items-center gap-2'>
              <CheckCircle className="h-4 w-4" /> Required Format:
            </p>
            <div className="flex flex-wrap gap-2">
              {['Question', 'Option A', 'Option B', 'Option C', 'Option D', 'Correct Answer'].map(col => (
                <span key={col} className="bg-white px-2 py-1 rounded border text-[10px] font-mono text-blue-600 uppercase">{col}</span>
              ))}
            </div>
          </div>

          <div className="relative group">
            <Input id="excel-file" type="file" onChange={handleFileChange} accept=".xlsx, .xls" disabled={isUploading} className="cursor-pointer file:cursor-pointer file:bg-primary file:text-white file:border-0 file:rounded-md file:px-4 file:py-2 file:mr-4 hover:border-primary transition-all duration-300" />
          </div>

          {uploadStatus && (
            <div className="space-y-2">
              <div className={`p-3 rounded-lg flex items-center gap-3 text-sm ${uploadStatus.rtdb ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                {uploadStatus.rtdb ? <CheckCircle className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
                Realtime Database: {uploadStatus.rtdb ? 'SUCCESS' : 'PERMISSION DENIED'}
              </div>
              <div className={`p-3 rounded-lg flex items-center gap-3 text-sm ${uploadStatus.fs ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                {uploadStatus.fs ? <CheckCircle className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
                Firestore: {uploadStatus.fs ? 'SUCCESS' : 'PERMISSION DENIED'}
              </div>
            </div>
          )}

          <Button onClick={handleUpload} disabled={!file || isUploading} className="w-full h-12 text-lg font-semibold shadow-lg hover:shadow-primary/20 transition-all duration-300 active:scale-[0.98]">
            {isUploading ? <><Loader2 className="mr-3 h-5 w-5 animate-spin" /> Transferring Data...</> : 'Launch Upload'}
          </Button>

          {!uploadStatus?.fs && uploadStatus !== null && (
            <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-xs text-amber-800 font-medium text-center">
                ⚠️ To enable Firestore, ensure the rules in the Firebase Console match your local <code>firestore.rules</code> file.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
