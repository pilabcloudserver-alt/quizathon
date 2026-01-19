'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';

import { getDatabase, type Database } from 'firebase/database';

// This logic ensures that Firebase is initialized only once.
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

export const firebaseApp: FirebaseApp = app;
export const auth: Auth = getAuth(app);
export const firestore: Firestore = getFirestore(app);
export const database: Database = getDatabase(app);

// Re-exporting hooks and providers
export * from './provider';
export * from './client-provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './non-blocking-updates';
export * from './non-blocking-login';
export * from './errors';
export * from './error-emitter';
