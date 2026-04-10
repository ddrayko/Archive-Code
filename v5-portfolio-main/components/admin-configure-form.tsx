"use client"

import { useState, useTransition } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { updateDeveloperName } from "@/lib/actions"
import { DEFAULT_DEVELOPER_NAME, normalizeDeveloperName } from "@/lib/site-settings"
import { Loader2, Save, RotateCcw, Sparkles } from "lucide-react"

interface AdminConfigureFormProps {
  initialDeveloperName: string
}

export function AdminConfigureForm({ initialDeveloperName }: AdminConfigureFormProps) {
  const [developerName, setDeveloperName] = useState(initialDeveloperName)
  const [isPending, startTransition] = useTransition()
  const { toast } = useToast()

  const handleSave = () => {
    startTransition(async () => {
      const nextName = normalizeDeveloperName(developerName)
      const result = await updateDeveloperName(nextName)

      if (result.success) {
        toast({
          title: "Name updated",
          description: `Displayed name is now "${nextName}".`,
        })
        setDeveloperName(nextName)
      } else {
        toast({
          title: "Error",
          description: result.error || "Unable to save the name.",
          variant: "destructive",
        })
      }
    })
  }

  const handleReset = () => setDeveloperName(DEFAULT_DEVELOPER_NAME)

  const liveName = normalizeDeveloperName(developerName)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-6">
      <Card className="v4-card">
        <CardHeader className="space-y-2">
          <CardTitle className="text-2xl">Public identity</CardTitle>
          <CardDescription>This name appears in the navbar, footer, and all public pages.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="developer-name">Developer name</Label>
            <Input
              id="developer-name"
              value={developerName}
              onChange={(e) => setDeveloperName(e.target.value)}
              placeholder={DEFAULT_DEVELOPER_NAME}
              className="h-12 text-lg"
              maxLength={80}
              disabled={isPending}
            />
            <p className="text-sm text-muted-foreground">
              Default value: <span className="font-semibold">{DEFAULT_DEVELOPER_NAME}</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button onClick={handleSave} disabled={isPending} className="rounded-xl">
              {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Save
            </Button>
            <Button variant="outline" onClick={handleReset} disabled={isPending} className="rounded-xl">
              <RotateCcw className="mr-2 h-4 w-4" />
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="v4-card border-dashed border-primary/20 bg-white/[0.02]">
        <CardHeader className="space-y-1">
          <CardTitle className="text-xl flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Live preview
          </CardTitle>
          <CardDescription>What visitors will see after saving.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-2xl border border-white/10 p-4 bg-white/5">
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Navbar</p>
            <p className="text-2xl font-black uppercase mt-2">{liveName}</p>
          </div>
          <div className="rounded-2xl border border-white/10 p-4 bg-white/5">
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Footer</p>
            <p className="text-lg font-semibold mt-2">© {new Date().getFullYear()} {liveName}. All rights reserved.</p>
          </div>
          <div className="rounded-2xl border border-white/10 p-4 bg-white/5">
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Badge / Hero</p>
            <p className="text-xl font-black uppercase mt-2 tracking-tight">{liveName} - version 4</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

