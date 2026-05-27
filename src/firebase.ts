import { initializeApp } from 'firebase/app'
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
}

const firebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
    firebaseConfig.authDomain &&
    firebaseConfig.projectId &&
    firebaseConfig.appId,
)

const app = firebaseConfigured ? initializeApp(firebaseConfig) : null

export const auth = app ? getAuth(app) : null
export const db = app ? getFirestore(app) : null

export function buildUserEmail(fullName: string) {
  return `${fullName.trim().toLowerCase().replace(/\s+/g, '')}@proje.local`
}

export async function registerUser(fullName: string, password: string) {
  if (!auth) {
    return null
  }

  const email = buildUserEmail(fullName)
  const credentials = await createUserWithEmailAndPassword(auth, email, password)
  return credentials.user
}

export async function signInUser(fullName: string, password: string) {
  if (!auth) {
    return null
  }

  const email = buildUserEmail(fullName)
  const credentials = await signInWithEmailAndPassword(auth, email, password)
  return credentials.user
}
