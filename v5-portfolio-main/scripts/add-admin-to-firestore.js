require("dotenv/config")
const readline = require("node:readline/promises")
const { stdin, stdout } = require("node:process")
const crypto = require("crypto")
const { initializeApp, cert } = require("firebase-admin/app")
const { getFirestore } = require("firebase-admin/firestore")

const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS
if (!serviceAccountPath) {
  console.error("Set GOOGLE_APPLICATION_CREDENTIALS to a service account JSON file path before running this script.")
  process.exit(1)
}

// Lazy-load the JSON to avoid embedding secrets in the repository
const serviceAccount = require(serviceAccountPath)
const app = initializeApp({ credential: cert(serviceAccount) })
const db = getFirestore(app)

async function promptForCredentials() {
  const rl = readline.createInterface({ input: stdin, output: stdout })
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
  const { email, password } = await promptForCredentials()
  const hashedPassword = crypto.createHash("sha256").update(password).digest("hex")

  const docRef = await db.collection("admins").add({
    email,
    password: hashedPassword,
    created_at: new Date().toISOString(),
  })

  console.log("\nAdmin account created.")
  console.log("Document ID:", docRef.id)
  console.log("Email:", email)
  console.log("Password hash:", hashedPassword)
  console.log("Store the plain password safely; only the hash is kept in Firestore.\n")
}

createAdmin().catch((error) => {
  console.error("Failed to create admin:", error)
  process.exit(1)
})
