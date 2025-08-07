// firebase-config.ts
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
    apiKey: 'AIzaSyD2SQlVSHiWhMgq5g362MS37fphU2DAywU',
    authDomain: 'gym-management-cb96a.firebaseapp.com',
    projectId: 'gym-management-cb96a',
    storageBucket: 'gym-management-cb96a.firebasestorage.app',
    messagingSenderId: '4997889608',
    appId: '1:4997889608:web:02481753c248bffb5f627d',
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app); // <-- This line EXPORTS 'auth'