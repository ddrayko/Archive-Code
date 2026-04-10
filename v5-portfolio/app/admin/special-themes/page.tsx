"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Sparkles, Calendar, Clock, Save, RotateCcw } from "lucide-react"
import { toast } from "sonner"
import { getFirestoreClient } from "@/lib/firebase/client"
import { doc, getDoc, setDoc } from "firebase/firestore"


interface ThemeConfig {
    id: string
    name: string
    description: string
    startDate: {
        day: number
        month: number
        year: number
        hour: number
        minute: number
        second: number
    }
    endDate: {
        day: number
        month: number
        year: number
        hour: number
        minute: number
        second: number
    }
    defaultStart: {
        day: number
        month: number
        hour: number
        minute: number
        second: number
    }
    defaultEnd: {
        day: number
        month: number
        hour: number
        minute: number
        second: number
    }
}

const AVAILABLE_THEMES: ThemeConfig[] = [
    {
        id: "new-year",
        name: "New Year",
        description: "Festive gold theme to celebrate the new year",
        startDate: {
            day: 20,
            month: 12,
            year: new Date().getFullYear(),
            hour: 0,
            minute: 0,
            second: 0
        },
        endDate: {
            day: 2,
            month: 1,
            year: new Date().getFullYear() + 1,
            hour: 23,
            minute: 59,
            second: 59
        },
        defaultStart: {
            day: 20,
            month: 12,
            hour: 0,
            minute: 0,
            second: 0
        },
        defaultEnd: {
            day: 2,
            month: 1,
            hour: 23,
            minute: 59,
            second: 59
        }
    },
    {
        id: "christmas",
        name: "Christmas",
        description: "Red and green theme with snowflakes for Christmas",
        startDate: {
            day: 1,
            month: 12,
            year: new Date().getFullYear(),
            hour: 0,
            minute: 0,
            second: 0
        },
        endDate: {
            day: 26,
            month: 12,
            year: new Date().getFullYear(),
            hour: 23,
            minute: 59,
            second: 59
        },
        defaultStart: {
            day: 1,
            month: 12,
            hour: 0,
            minute: 0,
            second: 0
        },
        defaultEnd: {
            day: 26,
            month: 12,
            hour: 23,
            minute: 59,
            second: 59
        }
    }
]

export default function SpecialThemesPage() {
    const [themes, setThemes] = useState<ThemeConfig[]>(AVAILABLE_THEMES)
    const [selectedTheme, setSelectedTheme] = useState<ThemeConfig | null>(null)
    const [editedTheme, setEditedTheme] = useState<ThemeConfig | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const loadThemes = async () => {
            try {
                const db = getFirestoreClient()
                const docRef = doc(db, "special-themes", "config")
                const docSnap = await getDoc(docRef)

                if (docSnap.exists()) {
                    const data = docSnap.data()
                    if (data.themes) {
                        const savedThemes = data.themes as ThemeConfig[]
                        const mergedThemes = AVAILABLE_THEMES.map(defaultTheme => {
                            const savedTheme = savedThemes.find(t => t.id === defaultTheme.id)
                            return savedTheme || defaultTheme
                        })
                        setThemes(mergedThemes)
                    } else {
                        setThemes(AVAILABLE_THEMES)
                    }
                } else {
                    setThemes(AVAILABLE_THEMES)

                    await setDoc(docRef, {
                        themes: AVAILABLE_THEMES,
                        updated_at: new Date().toISOString()
                    })
                }
            } catch (e) {
                console.error('Error loading themes config:', e)
                setThemes(AVAILABLE_THEMES)
                toast.error("Load error", {
                    description: "Using default themes."
                })
            } finally {
                setIsLoading(false)
            }
        }

        loadThemes()
    }, [])

    const handleThemeClick = (theme: ThemeConfig) => {
        setSelectedTheme(theme)
        setEditedTheme({ ...theme })
    }

    const handleSave = async () => {
        if (!editedTheme) return

        try {
            const updatedThemes = themes.map(t =>
                t.id === editedTheme.id ? editedTheme : t
            )

            const db = getFirestoreClient()
            const docRef = doc(db, "special-themes", "config")
            await setDoc(docRef, {
                themes: updatedThemes,
                updated_at: new Date().toISOString()
            })

            setThemes(updatedThemes)

            toast.success("Configuration saved", {
                description: `The theme "${editedTheme.name}" has been updated in Firebase.`
            })

            setTimeout(() => {
                window.location.reload()
            }, 1000)
        } catch (e) {
            console.error('Error saving theme config:', e)
            toast.error("Save error", {
                description: "Unable to save to Firebase."
            })
        }
    }

    const handleReset = () => {
        if (!selectedTheme) return

        const defaultTheme = AVAILABLE_THEMES.find(t => t.id === selectedTheme.id)
        if (defaultTheme) {
            setEditedTheme({ ...defaultTheme })
            toast.info("Reset", {
                description: "Default dates have been restored."
            })
        }
    }

    const updateStartDate = (field: keyof ThemeConfig['startDate'], value: number) => {
        if (!editedTheme) return
        setEditedTheme({
            ...editedTheme,
            startDate: {
                ...editedTheme.startDate,
                [field]: value
            }
        })
    }

    const updateEndDate = (field: keyof ThemeConfig['endDate'], value: number) => {
        if (!editedTheme) return
        setEditedTheme({
            ...editedTheme,
            endDate: {
                ...editedTheme.endDate,
                [field]: value
            }
        })
    }

    return (
        <div className="min-h-screen bg-background p-6">
            <div className="max-w-7xl mx-auto space-y-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-4xl font-bold tracking-tight flex items-center gap-3">
                            <Sparkles className="h-10 w-10 text-primary" />
                            Special Themes
                        </h1>
                        <p className="text-muted-foreground mt-2">
                            Manage activation periods for festive themes
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-1 space-y-4">
                        <h2 className="text-xl font-semibold">Available themes</h2>
                        {themes.map((theme) => (
                            <Card
                                key={theme.id}
                                className={`cursor-pointer transition-all hover:shadow-lg ${selectedTheme?.id === theme.id
                                    ? 'ring-2 ring-primary'
                                    : ''
                                    }`}
                                onClick={() => handleThemeClick(theme)}
                            >
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Sparkles className="h-5 w-5 text-primary" />
                                        {theme.name}
                                    </CardTitle>
                                    <CardDescription>{theme.description}</CardDescription>
                                </CardHeader>
                            </Card>
                        ))}
                    </div>

                    <div className="lg:col-span-2">
                        {editedTheme ? (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Calendar className="h-6 w-6 text-primary" />
                                        Configuration: {editedTheme.name}
                                    </CardTitle>
                                    <CardDescription>
                                        Set the activation start and end dates
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-8">
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2">
                                            <Clock className="h-5 w-5 text-green-500" />
                                            <h3 className="text-lg font-semibold">Start date</h3>
                                        </div>
                                        <div className="grid grid-cols-3 gap-4">
                                            <div>
                                                <Label htmlFor="start-day">Day</Label>
                                                <Input
                                                    id="start-day"
                                                    type="number"
                                                    min="1"
                                                    max="31"
                                                    value={editedTheme.startDate.day}
                                                    onChange={(e) => updateStartDate('day', parseInt(e.target.value) || 1)}
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="start-month">Month</Label>
                                                <Input
                                                    id="start-month"
                                                    type="number"
                                                    min="1"
                                                    max="12"
                                                    value={editedTheme.startDate.month}
                                                    onChange={(e) => updateStartDate('month', parseInt(e.target.value) || 1)}
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="start-year">Year</Label>
                                                <Input
                                                    id="start-year"
                                                    type="number"
                                                    min="2025"
                                                    max="2100"
                                                    value={editedTheme.startDate.year}
                                                    onChange={(e) => updateStartDate('year', parseInt(e.target.value) || 2025)}
                                                />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-3 gap-4">
                                            <div>
                                                <Label htmlFor="start-hour">Hour</Label>
                                                <Input
                                                    id="start-hour"
                                                    type="number"
                                                    min="0"
                                                    max="23"
                                                    value={editedTheme.startDate.hour}
                                                    onChange={(e) => updateStartDate('hour', parseInt(e.target.value) || 0)}
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="start-minute">Minute</Label>
                                                <Input
                                                    id="start-minute"
                                                    type="number"
                                                    min="0"
                                                    max="59"
                                                    value={editedTheme.startDate.minute}
                                                    onChange={(e) => updateStartDate('minute', parseInt(e.target.value) || 0)}
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="start-second">Second</Label>
                                                <Input
                                                    id="start-second"
                                                    type="number"
                                                    min="0"
                                                    max="59"
                                                    value={editedTheme.startDate.second}
                                                    onChange={(e) => updateStartDate('second', parseInt(e.target.value) || 0)}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2">
                                            <Clock className="h-5 w-5 text-red-500" />
                                            <h3 className="text-lg font-semibold">End date</h3>
                                        </div>
                                        <div className="grid grid-cols-3 gap-4">
                                            <div>
                                                <Label htmlFor="end-day">Day</Label>
                                                <Input
                                                    id="end-day"
                                                    type="number"
                                                    min="1"
                                                    max="31"
                                                    value={editedTheme.endDate.day}
                                                    onChange={(e) => updateEndDate('day', parseInt(e.target.value) || 1)}
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="end-month">Month</Label>
                                                <Input
                                                    id="end-month"
                                                    type="number"
                                                    min="1"
                                                    max="12"
                                                    value={editedTheme.endDate.month}
                                                    onChange={(e) => updateEndDate('month', parseInt(e.target.value) || 1)}
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="end-year">Year</Label>
                                                <Input
                                                    id="end-year"
                                                    type="number"
                                                    min="2025"
                                                    max="2100"
                                                    value={editedTheme.endDate.year}
                                                    onChange={(e) => updateEndDate('year', parseInt(e.target.value) || 2025)}
                                                />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-3 gap-4">
                                            <div>
                                                <Label htmlFor="end-hour">Hour</Label>
                                                <Input
                                                    id="end-hour"
                                                    type="number"
                                                    min="0"
                                                    max="23"
                                                    value={editedTheme.endDate.hour}
                                                    onChange={(e) => updateEndDate('hour', parseInt(e.target.value) || 0)}
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="end-minute">Minute</Label>
                                                <Input
                                                    id="end-minute"
                                                    type="number"
                                                    min="0"
                                                    max="59"
                                                    value={editedTheme.endDate.minute}
                                                    onChange={(e) => updateEndDate('minute', parseInt(e.target.value) || 0)}
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="end-second">Second</Label>
                                                <Input
                                                    id="end-second"
                                                    type="number"
                                                    min="0"
                                                    max="59"
                                                    value={editedTheme.endDate.second}
                                                    onChange={(e) => updateEndDate('second', parseInt(e.target.value) || 0)}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-4 bg-muted rounded-lg space-y-2">
                                        <p className="font-semibold">Preview:</p>
                                        <p className="text-sm">
                                            <span className="text-green-600 font-medium">Start:</span>{' '}
                                            {editedTheme.startDate.day.toString().padStart(2, '0')}/
                                            {editedTheme.startDate.month.toString().padStart(2, '0')}/
                                            {editedTheme.startDate.year} at{' '}
                                            {editedTheme.startDate.hour.toString().padStart(2, '0')}:
                                            {editedTheme.startDate.minute.toString().padStart(2, '0')}:
                                            {editedTheme.startDate.second.toString().padStart(2, '0')}
                                        </p>
                                        <p className="text-sm">
                                            <span className="text-red-600 font-medium">End:</span>{' '}
                                            {editedTheme.endDate.day.toString().padStart(2, '0')}/
                                            {editedTheme.endDate.month.toString().padStart(2, '0')}/
                                            {editedTheme.endDate.year} at{' '}
                                            {editedTheme.endDate.hour.toString().padStart(2, '0')}:
                                            {editedTheme.endDate.minute.toString().padStart(2, '0')}:
                                            {editedTheme.endDate.second.toString().padStart(2, '0')}
                                        </p>
                                    </div>

                                    <div className="flex gap-4">
                                        <Button onClick={handleSave} className="flex-1">
                                            <Save className="h-4 w-4 mr-2" />
                                            Save and Apply
                                        </Button>
                                        <Button onClick={handleReset} variant="outline">
                                            <RotateCcw className="h-4 w-4 mr-2" />
                                            Reset
                                        </Button>
                                    </div>

                                    <div className="text-sm text-muted-foreground text-center">
                                        💡 The page will reload automatically after saving to apply changes
                                    </div>
                                </CardContent>
                            </Card>
                        ) : (
                            <Card className="h-full flex items-center justify-center min-h-[400px]">
                                <CardContent className="text-center text-muted-foreground">
                                    <Sparkles className="h-16 w-16 mx-auto mb-4 opacity-50" />
                                    <p>Select a theme to configure</p>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}