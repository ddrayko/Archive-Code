import { redirect } from "next/navigation"
import { checkAdminSession } from "@/lib/auth"
import AdminLoginForm from "@/components/admin-login-form"

export default async function AdminLoginPage() {
  const hasSession = await checkAdminSession()

  if (hasSession) {
    // User is already logged in, redirect to dashboard
    redirect("/admin/dashboard")
  }

  // User is not logged in, show login form
  return <AdminLoginForm />
}
