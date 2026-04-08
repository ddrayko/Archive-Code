"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Trash2, Mail } from "lucide-react"
import { DeleteAdminDialog } from "./delete-admin-dialog"
import type { Admin } from "@/lib/types"

interface AdminCardProps {
  admin: Admin
  onDeleted?: () => void
}

export function AdminCard({ admin, onDeleted }: AdminCardProps) {
  const [mounted, setMounted] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <>
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <div className="rounded-full bg-primary/10 p-2">
              <Mail className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{admin.email}</p>
              {mounted && (
                <p className="text-sm text-muted-foreground">Added {new Date(admin.created_at).toLocaleDateString()}</p>
              )}
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="destructive" size="sm" onClick={() => setDeleteOpen(true)} className="w-full">
            <Trash2 className="mr-2 h-4 w-4" />
            Remove Admin
          </Button>
        </CardFooter>
      </Card>

      <DeleteAdminDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        adminId={admin.id}
        adminEmail={admin.email}
        onDeleted={onDeleted}
      />
    </>
  )
}