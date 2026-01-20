'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useFirestore } from '@/firebase';
import { collection, query, getDocs, orderBy } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, Users, Mail, Calendar, ShieldAlert } from 'lucide-react';
import Header from '@/components/Header';

interface UserProfile {
    uid: string;
    name: string;
    email: string;
    createdAt: string;
    role: string;
}

export default function AdminPage() {
    const router = useRouter();
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();
    const [students, setStudents] = useState<UserProfile[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!isUserLoading) {
            if (!user || user.email !== 'admin@gmail.com') {
                router.push('/quiz');
            } else {
                fetchStudents();
            }
        }
    }, [user, isUserLoading, router]);

    const fetchStudents = async () => {
        try {
            const q = query(collection(firestore, 'users'), orderBy('createdAt', 'desc'));
            const querySnapshot = await getDocs(q);
            const userList = querySnapshot.docs.map(doc => doc.data() as UserProfile);
            setStudents(userList);
        } catch (error) {
            console.error("Error fetching students:", error);
        } finally {
            setIsLoading(false);
        }
    };

    if (isUserLoading || isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        );
    }

    if (user?.email !== 'admin@gmail.com') {
        return (
            <div className="flex min-h-screen items-center justify-center p-4">
                <Card className="max-w-md w-full text-center border-destructive">
                    <CardHeader>
                        <ShieldAlert className="h-12 w-12 text-destructive mx-auto mb-4" />
                        <CardTitle>Access Denied</CardTitle>
                        <CardDescription>Only system administrators can access this panel.</CardDescription>
                    </CardHeader>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />
            <main className="container mx-auto py-6 md:py-10 px-4">
                <div className="mb-6 md:mb-10 space-y-2">
                    <h1 className="text-2xl md:text-4xl font-black tracking-tight text-gray-900 uppercase">Admin Dashboard</h1>
                    <p className="text-sm md:text-base text-gray-500 font-medium">Manage your student database and monitor registrations.</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-6 mb-8 md:mb-10">
                    <Card className="border-none shadow-sm bg-white overflow-hidden relative group">
                        <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Users className="h-12 w-12 text-primary" />
                        </div>
                        <CardContent className="p-4 md:pt-6">
                            <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                                <div className="bg-primary/10 p-2 md:p-3 rounded-xl w-fit">
                                    <Users className="h-4 w-4 md:h-6 md:w-6 text-primary" />
                                </div>
                                <div>
                                    <p className="text-[10px] md:text-sm font-bold text-gray-400 uppercase tracking-wider">Total Students</p>
                                    <p className="text-xl md:text-3xl font-black text-gray-900">{students.length}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-none shadow-sm bg-white overflow-hidden relative group">
                        <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Calendar className="h-12 w-12 text-blue-600" />
                        </div>
                        <CardContent className="p-4 md:pt-6">
                            <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                                <div className="bg-blue-100 p-2 md:p-3 rounded-xl w-fit">
                                    <Calendar className="h-4 w-4 md:h-6 md:w-6 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-[10px] md:text-sm font-bold text-gray-400 uppercase tracking-wider">New This Week</p>
                                    <p className="text-xl md:text-3xl font-black text-gray-900">
                                        {students.filter(s => new Date(s.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="col-span-2 md:col-span-1 border-none shadow-sm bg-white overflow-hidden relative group">
                        <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Mail className="h-12 w-12 text-amber-600" />
                        </div>
                        <CardContent className="p-4 md:pt-6">
                            <div className="flex flex-row md:flex-row md:items-center gap-4">
                                <div className="bg-amber-100 p-2 md:p-3 rounded-xl w-fit">
                                    <Mail className="h-4 w-4 md:h-6 md:w-6 text-amber-600" />
                                </div>
                                <div>
                                    <p className="text-[10px] md:text-sm font-bold text-gray-400 uppercase tracking-wider">Active Emails</p>
                                    <p className="text-xl md:text-3xl font-black text-gray-900">{students.filter(s => s.email).length}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Card className="border-none shadow-xl shadow-gray-200/50 overflow-hidden">
                    <CardHeader className="bg-white border-b border-gray-100">
                        <CardTitle className="text-xl font-bold">Registered Student Directory</CardTitle>
                        <CardDescription>A complete list of all users who have signed up for Quizathon.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        {/* Desktop Table */}
                        <div className="hidden md:block">
                            <Table>
                                <TableHeader className="bg-gray-50/50">
                                    <TableRow>
                                        <TableHead className="font-bold text-gray-900 uppercase tracking-tighter w-[300px]">Full Name</TableHead>
                                        <TableHead className="font-bold text-gray-900 uppercase tracking-tighter">Email Address</TableHead>
                                        <TableHead className="font-bold text-gray-900 uppercase tracking-tighter">Joined Date</TableHead>
                                        <TableHead className="font-bold text-gray-900 uppercase tracking-tighter text-right">Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {students.map((student) => (
                                        <TableRow key={student.uid} className="hover:bg-gray-50/50 transition-colors">
                                            <TableCell className="font-semibold text-gray-900">{student.name || 'Anonymous'}</TableCell>
                                            <TableCell className="text-gray-500">{student.email}</TableCell>
                                            <TableCell className="text-gray-400 font-medium">
                                                {new Date(student.createdAt).toLocaleDateString('en-US', {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    year: 'numeric'
                                                })}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full uppercase">Active</span>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {students.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={4} className="text-center py-10 text-gray-500 font-medium">
                                                No students found in the database.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>

                        {/* Mobile Card List */}
                        <div className="md:hidden divide-y divide-gray-100">
                            {students.map((student) => (
                                <div key={student.uid} className="p-4 flex flex-col gap-2">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-bold text-gray-900">{student.name || 'Anonymous'}</p>
                                            <p className="text-sm text-gray-500">{student.email}</p>
                                        </div>
                                        <span className="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-bold rounded-full uppercase">Active</span>
                                    </div>
                                    <div className="flex items-center text-xs text-gray-400 font-medium gap-2">
                                        <Calendar className="w-3 h-3" />
                                        {new Date(student.createdAt).toLocaleDateString('en-US', {
                                            month: 'short',
                                            day: 'numeric',
                                            year: 'numeric'
                                        })}
                                    </div>
                                </div>
                            ))}
                            {students.length === 0 && (
                                <div className="p-8 text-center text-gray-500 font-medium text-sm">
                                    No students found.
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}
