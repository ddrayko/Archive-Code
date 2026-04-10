"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { getFirestoreServer } from "@/lib/firebase/server"
import { collection, query, where, getDocs } from "firebase/firestore"

const ADMIN_SESSION_COOKIE = "admin_session"

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(password)
  const hashBuffer = await crypto.subtle.digest("SHA-256", data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")
  return hashHex
}

export async function verifyAdminCredentials(email: string, password: string): Promise<boolean> {
  console.log("[v0] Verifying credentials for:", email)
  const db = await getFirestoreServer()
  const hashedPassword = await hashPassword(password)
  console.log("[v0] Hashed password:", hashedPassword)

  try {
    const adminsQuery = query(
      collection(db, "admins"),
      where("email", "==", email),
      where("password", "==", hashedPassword)
    )
    const querySnapshot = await getDocs(adminsQuery)

    if (querySnapshot.empty) {
      console.log("[v0] Verification failed")
      return false
    }

    console.log("[v0] Verification successful")
    return true
  } catch (error) {
    console.log("[v0] Verification error:", error)
    return false
  }
}

export async function createAdminSession() {
  console.log("[v0] Creating admin session")
  const cookieStore = await cookies()
  // Create a simple session token
  const sessionToken = Buffer.from(`admin_${Date.now()}`).toString("base64")

  cookieStore.set(ADMIN_SESSION_COOKIE, sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24, // 24 hours
    path: "/",
  })

  console.log("[v0] Session created successfully")
  return true
}

export async function loginAdmin(email: string, password: string) {
  console.log("[v0] Login attempt for:", email)

  const isValid = await verifyAdminCredentials(email, password)

  if (!isValid) {
    console.log("[v0] Invalid credentials")
    return { success: false, error: "Invalid email or password" }
  }

  console.log("[v0] Credentials valid, creating session")
  await createAdminSession()

  console.log("[v0] Redirecting to dashboard")
  redirect("/admin/dashboard")
}

export async function checkAdminSession(): Promise<boolean> {
  const cookieStore = await cookies()
  const session = cookieStore.get(ADMIN_SESSION_COOKIE)
  return !!session
}

export async function logoutAdmin() {
  const cookieStore = await cookies()
  cookieStore.delete(ADMIN_SESSION_COOKIE)
  redirect("/admin")
}

export async function deleteAdminSession() {
  const cookieStore = await cookies()
  cookieStore.delete(ADMIN_SESSION_COOKIE)
}
