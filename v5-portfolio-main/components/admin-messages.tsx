"use client"

import { useEffect, useState } from "react"
import { getContactMessages } from "@/lib/actions"
import { ContactMessage } from "@/lib/types"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Mail, MessageSquare, ArrowRight, Loader2, Search } from "lucide-react"
import { MessageDialog } from "./message-dialog"
import { formatDistanceToNow } from "date-fns"
import { enUS } from "date-fns/locale"
import { Input } from "@/components/ui/input"

export function AdminMessages() {
    const [messages, setMessages] = useState<ContactMessage[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null)
    const [dialogOpen, setDialogOpen] = useState(false)
    const [filter, setFilter] = useState("")

    const fetchMessages = async () => {
        setIsLoading(true)
        const result = await getContactMessages()
        if (result.success) {
            setMessages(result.data as ContactMessage[])
        }
        setIsLoading(false)
    }

    useEffect(() => {
        fetchMessages()
    }, [])

    const filteredMessages = messages.filter(msg =>
        msg.name.toLowerCase().includes(filter.toLowerCase()) ||
        msg.email.toLowerCase().includes(filter.toLowerCase()) ||
        msg.subject.toLowerCase().includes(filter.toLowerCase())
    )

    const unreadCount = messages.filter(m => !m.read).length

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="relative w-full md:w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search..."
                        className="pl-9 h-12 rounded-xl bg-background/50 border-white/10 w-full"
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                    />
                </div>
            </div>

            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-32 rounded-3xl glass border-white/5 animate-pulse" />
                    ))}
                </div>
            ) : filteredMessages.length === 0 ? (
                <div className="glass p-20 rounded-[3.5rem] border-white/5 text-center space-y-6">
                    <div className="w-20 h-20 rounded-full bg-white/5 mx-auto flex items-center justify-center text-muted-foreground">
                        <Mail className="h-10 w-10 opacity-20" />
                    </div>
                    <div className="space-y-2">
                        <p className="text-xl font-bold">No messages</p>
                        <p className="text-muted-foreground">Your inbox is empty for now.</p>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredMessages.map((msg) => (
                        <div
                            key={msg.id}
                            onClick={() => {
                                setSelectedMessage(msg)
                                setDialogOpen(true)
                            }}
                            className={`
                                group relative p-6 rounded-[2rem] border cursor-pointer transition-all duration-300 hover:scale-[1.02]
                                ${!msg.read
                                    ? 'glass bg-primary/5 border-primary/20 shadow-lg shadow-primary/5'
                                    : 'glass border-white/5 bg-white/[0.01] hover:bg-white/5'
                                }
                            `}
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className="space-y-1">
                                    <h3 className={`font-bold text-lg ${!msg.read ? 'text-primary' : 'text-foreground'}`}>
                                        {msg.name}
                                    </h3>
                                    <p className="text-xs text-muted-foreground font-medium">
                                        {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true, locale: enUS })}
                                    </p>
                                </div>
                                {!msg.read && (
                                    <span className="h-2 w-2 rounded-full bg-primary shadow-glow shadow-primary" />
                                )}
                                {msg.replied && (
                                    <span className="px-2 py-0.5 rounded-full bg-green-500/10 text-green-500 text-[10px] font-bold border border-green-500/20">REPLIED</span>
                                )}
                            </div>

                            <p className="font-medium text-sm text-foreground/80 line-clamp-2 mb-4">
                                {msg.subject}
                            </p>

                            <p className="text-sm text-muted-foreground line-clamp-2">
                                {msg.message}
                            </p>

                            <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-2 group-hover:translate-x-0">
                                <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                                    <ArrowRight className="h-5 w-5" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <MessageDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                message={selectedMessage}
                onSuccess={() => {
                    fetchMessages()
                }}
            />
        </div>
    )
}