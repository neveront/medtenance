

import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, signInAnonymously, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut as firebaseSignOut, linkWithCredential, EmailAuthProvider, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

// ... config ...
const firebaseConfig = {
    apiKey: "AIzaSyCbNAeYGBSkKwk6nVpLWBwh5ykasQgOeCM",
    authDomain: "medtenance-1b32d.firebaseapp.com",
    projectId: "medtenance-1b32d",
    storageBucket: "medtenance-1b32d.firebasestorage.app",
    messagingSenderId: "1052269138410",
    appId: "1:1052269138410:web:16bc5946647ce21b212293",
    measurementId: "G-7WZ16MV90C"
};

// Initialize Firebase
let app;
let db;
let auth;

try {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    auth = initializeAuth(app, {
        persistence: getReactNativePersistence(ReactNativeAsyncStorage)
    });
} catch (error) {
    console.warn("Firebase initialization failed. Check your config.", error);
}

// Helpers
export const signInAnonymous = async () => {
    if (!auth) return null;
    try {
        const userCredential = await signInAnonymously(auth);
        return userCredential.user;
    } catch (error) {
        console.error("Error signing in anonymously:", error);
        throw error;
    }
};

export const registerUser = async (email, password) => {
    if (!auth) return null;
    try {
        // Check if we have an anonymous user currently
        const currentUser = auth.currentUser;
        if (currentUser && currentUser.isAnonymous) {
            // Link the anonymous account to the new credential
            const credential = EmailAuthProvider.credential(email, password);
            const userCredential = await linkWithCredential(currentUser, credential);
            return userCredential.user;
        } else {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            return userCredential.user;
        }
    } catch (error) {
        console.error("Error registering user:", error);
        throw error;
    }
}

export const loginUser = async (email, password) => {
    if (!auth) return null;
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        return userCredential.user;
    } catch (error) {
        console.error("Error logging in:", error);
        throw error;
    }
}

export const logoutUser = async () => {
    if (!auth) return;
    try {
        await firebaseSignOut(auth);
    } catch (error) {
        console.error("Error signing out:", error);
        throw error;
    }
}

// Export auth directly for listeners
export { db, auth };

