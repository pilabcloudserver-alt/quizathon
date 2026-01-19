'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useToast } from '@/hooks/use-toast';
import { useAuth, useUser, initiateEmailSignUp } from '@/firebase';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import Logo from '@/components/icons/Logo';
import { Loader2 } from 'lucide-react';

const signupSchema = z.object({
  name: z.string().min(1, { message: 'Name is required.' }),
  email: z.string().email({ message: 'Please enter a valid email.' }),
  password: z.string().min(8, { message: 'Password must be at least 8 characters.' }),
});

type SignupFormValues = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const router = useRouter();
  const { toast } = useToast();
  const auth = useAuth();
  const { user, isUserLoading, userError } = useUser();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: { name: '', email: '', password: '' },
  });

  useEffect(() => {
    if (user) {
      router.push('/quiz');
    }
  }, [user, router]);

  useEffect(() => {
    if (userError) {
      setIsSubmitting(false);
      const authError = userError as any;
      let description = "An unexpected error occurred.";
      if (authError.code === 'auth/email-already-in-use') {
        description = 'This email is already registered. Please log in.';
      }
      toast({
        variant: "destructive",
        title: 'Sign Up Failed',
        description: userError.message,
      });
    }
  }, [userError, toast]);

  const onSubmit = async (data: SignupFormValues) => {
    setIsSubmitting(true);
    try {
      const { createUserWithEmailAndPassword, updateProfile } = await import('firebase/auth');
      const { setDoc, doc } = await import('firebase/firestore');
      const { firestore } = await import('@/firebase');

      const userCredential = await createUserWithEmailAndPassword(auth!, data.email, data.password);
      const user = userCredential.user;

      // Update Auth Profile
      await updateProfile(user, { displayName: data.name });

      // Create Firestore User Record
      await setDoc(doc(firestore, 'users', user.uid), {
        uid: user.uid,
        name: data.name,
        email: data.email,
        createdAt: new Date().toISOString(),
        role: 'student'
      });

      toast({
        title: 'Account Created',
        description: `Welcome to Quizathon, ${data.name}!`,
      });

      router.push('/quiz');
    } catch (error: any) {
      console.error("Signup error:", error);
      setIsSubmitting(false);
      toast({
        variant: "destructive",
        title: 'Sign Up Failed',
        description: error.message,
      });
    }
  };

  if (isUserLoading || user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="mb-6 flex justify-center">
          <Link href="/">
            <Logo />
          </Link>
        </div>
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Create an Account</CardTitle>
            <CardDescription>
              Join Quizathon to participate in competitive quizzes.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Your Name"
                          {...field}
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="you@example.com"
                          {...field}
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="••••••••"
                          {...field}
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating Account...</> : 'Sign Up'}
                </Button>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="text-center text-sm">
            <p className="w-full">
              Already have an account?{' '}
              <Link href="/login" className="font-medium text-primary hover:underline">
                Log in
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
