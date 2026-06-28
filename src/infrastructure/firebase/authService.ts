import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  type User as FirebaseUser,
} from "firebase/auth";
import { getFirebaseAuth } from "@infrastructure/firebase/client";

export interface AuthUser {
  uid: string;
  email: string | null;
}

function toAuthUser(user: FirebaseUser): AuthUser {
  return {
    uid: user.uid,
    email: user.email,
  };
}

export function subscribeToAuthState(callback: (user: AuthUser | null) => void): () => void {
  return onAuthStateChanged(getFirebaseAuth(), (firebaseUser) => {
    callback(firebaseUser ? toAuthUser(firebaseUser) : null);
  });
}

export function getCurrentAuthUser(): AuthUser | null {
  const user = getFirebaseAuth().currentUser;
  return user ? toAuthUser(user) : null;
}

export async function signInWithEmail(email: string, password: string): Promise<AuthUser> {
  const credential = await signInWithEmailAndPassword(getFirebaseAuth(), email, password);
  return toAuthUser(credential.user);
}

export async function signUpWithEmail(email: string, password: string): Promise<AuthUser> {
  const credential = await createUserWithEmailAndPassword(getFirebaseAuth(), email, password);
  return toAuthUser(credential.user);
}

export async function signInWithGoogle(): Promise<AuthUser> {
  const provider = new GoogleAuthProvider();
  const credential = await signInWithPopup(getFirebaseAuth(), provider);
  return toAuthUser(credential.user);
}

export async function signOutUser(): Promise<void> {
  await signOut(getFirebaseAuth());
}

export async function deleteAuthUser(): Promise<void> {
  const user = getFirebaseAuth().currentUser;
  if (!user) {
    throw new Error("Nenhum usuário autenticado");
  }
  await user.delete();
}
