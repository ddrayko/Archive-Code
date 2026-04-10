import "dotenv/config"
import readline from "node:readline/promises"
import { stdin as input, stdout as output } from "node:process"
import crypto from "node:crypto"
import { initializeApp } from "firebase/app"
import { getFirestore, collection, addDoc } from "firebase/firestore"

const requiredEnv = (key) => {
  const value = process.env[key]
  if (!value) {
    console.error(`Missing env ${key}. Add it to your .env.local before running this script.`)
    process.exit(1)
  }
  return value
}

const firebaseConfig = {
  apiKey: requiredEnv("NEXT_PUBLIC_FIREBASE_API_KEY"),
  authDomain: requiredEnv("NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN"),
  projectId: requiredEnv("NEXT_PUBLIC_FIREBASE_PROJECT_ID"),
  storageBucket: requiredEnv("NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET"),
  messagingSenderId: requiredEnv("NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID"),
  appId: requiredEnv("NEXT_PUBLIC_FIREBASE_APP_ID"),
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || undefined,
}

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

async function promptForCredentials() {
  const rl = readline.createInterface({ input, output })
  const email = (await rl.question("Admin email: ")).trim()
  const password = (await rl.question("Admin password (will be hashed): ")).trim()
  rl.close()
  if (!email || !password) {
    console.error("Email and password are required.")
    process.exit(1)
  }
  return { email, password }
}

async function createAdmin() {
  try {
    const { email, password } = await promptForCredentials()
    const hashedPassword = crypto.createHash("sha256").update(password).digest("hex")

    const docRef = await addDoc(collection(db, "admins"), {
      email,
      password: hashedPassword,
      created_at: new Date().toISOString(),
    })

    console.log("\nAdmin account created successfully.")
    console.log("Document ID:", docRef.id)
    console.log("Email:", email)
    console.log("Password hash:", hashedPassword)
    console.log("Tip: store the plain password in your password manager; only the hash is stored in Firestore.\n")

    process.exit(0)
  } catch (error) {
    console.error("\nError while creating admin account:")
    console.error(error)
    console.log("\nCheck the following:")
    console.log("1. Firestore is enabled in Firebase Console")
    console.log("2. Security rules allow write access")
    console.log("3. Firebase config is valid\n")
    process.exit(1)
  }
}

createAdmin()
