// src/services/auth.js
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import firebase from '../firebase/firebase';

const { app, auth } = firebase;

export const authService = {
  // Store current user and role
  currentUser: null,
  currentRole: 'public',
  error: null,
  isInitialized: false,
  db: getFirestore(),

  // Initialize auth state listener
  initialize() {
    return new Promise((resolve) => {
      if (this.isInitialized) {
        resolve();
        return;
      }
      onAuthStateChanged(auth, async (user) => {
        this.currentUser = user;
        if (user) {
          const userDoc = await getDoc(doc(this.db, 'Users', user.uid));
          this.currentRole = userDoc.exists() ? userDoc.data().role : 'public';
        } else {
          this.currentRole = 'public';
        }
        this.isInitialized = true;
        resolve();
      });
    });
  },

 // Legacy initAuth for components like Navbar
 initAuth(callback) {
    if (this.isInitialized) {
      callback(this.currentUser, this.currentRole);
      return;
    }
    onAuthStateChanged(auth, async (user) => {
      this.currentUser = user;
      if (user) {
        const userDoc = await getDoc(doc(this.db, 'Users', user.uid));
        this.currentRole = userDoc.exists() ? userDoc.data().role : 'public';
      } else {
        this.currentRole = 'public';
      }
      this.isInitialized = true;
      callback(user, this.currentRole);
    });
  },

  // Sign in
  async signIn(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      this.currentUser = userCredential.user;
      const userDoc = await getDoc(doc(this.db, 'Users', userCredential.user.uid));
      this.currentRole = userDoc.exists() ? userDoc.data().role : 'public';
      this.error = null;
      return true;
    } catch (err) {
      this.error = err.message;
      return false;
    }
  },

  // Sign out
  async signOut() {
    try {
      await signOut(auth);
      this.currentUser = null;
      this.currentRole = 'public';
      this.error = null;
    } catch (err) {
      this.error = err.message;
    }
  },
};