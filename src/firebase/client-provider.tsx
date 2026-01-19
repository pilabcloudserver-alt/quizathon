'use client';

import React, { type ReactNode } from 'react';
import { FirebaseProvider } from '@/firebase/provider';
// Import the singleton instances from the central index file
import { firebaseApp, auth, firestore, database } from '@/firebase/index';

interface FirebaseClientProviderProps {
  children: ReactNode;
}

export function FirebaseClientProvider({ children }: FirebaseClientProviderProps) {
  // Pass the imported singleton instances to the provider.
  // This ensures the same instances are used throughout the app.
  return (
    <FirebaseProvider
      firebaseApp={firebaseApp}
      auth={auth}
      firestore={firestore}
      database={database}
    >
      {children}
    </FirebaseProvider>
  );
}
