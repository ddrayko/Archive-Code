import { initializeApp, getApps } from "firebase/app"
import { getFirestore } from "firebase/firestore"
import { publicEnv } from "@/lib/env"

const firebaseConfig = {
  apiKey: publicEnv.firebase.apiKey,
  authDomain: publicEnv.firebase.authDomain,
  projectId: publicEnv.firebase.projectId,
  storageBucket: publicEnv.firebase.storageBucket,
  messagingSenderId: publicEnv.firebase.messagingSenderId,
  appId: publicEnv.firebase.appId,
  measurementId: publicEnv.firebase.measurementId,
}

// Initialize Firebase only once (both client and server)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]
const db = getFirestore(app)

export { app, db }
