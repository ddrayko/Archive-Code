"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Conversation, ChatMessage } from "@/lib/types"
import { sendMessage } from "@/lib/actions"
import { Send, User as UserIcon, Shield, Loader2, RefreshCw } from "lucide-react"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { enUS } from "date-fns/locale"

interface ChatWindowProps {
    conversation: Conversation
    currentUserType: 'user' | 'admin'
    onRefresh: () => void
}

export function ChatWindow({ conversation, currentUserType, onRefresh }: ChatWindowProps) {
    const [inputValue, setInputValue] = useState("")
    const [isSending, setIsSending] = useState(false)
    const messagesEndRef = useRef<HTMLDivLement>(null)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }

    useEffect(() => {
        scrollToBottom()
    }, [conversation.messages])

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!inputValue.trim()) return

        setIsSending(true)
        const result = await sendMessage(conversation.id, inputValue, currentUserType)
        if (result.success) {
            setInputValue("")
            onRefresh()
        }
        setIsSending(false)
    }

    return (
        <div className="flex flex-col h-[600px] w-full bg-white/5 border border-white/5 rounded-[2rem] overflow-hidden">
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {conversation.messages.length === 0 && (
                    <div className="text-center text-muted-foreground text-sm italic pt-10">Start the discussion...</div>
                )}

                {conversation.messages.map((msg, index) => {
                    const isMe = msg.sender === currentUserType
                    return (
                        <div key={msg.id} className={cn("flex w-full gap-3", isMe ? "justify-end" : "justify-start")}>
                            {!isMe && (
                                <div className={cn("flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold",
                                    msg.sender === 'admin' ? "bg-primary/20 text-primary" : "bg-white/10 text-muted-foreground"
                                )}>
                                    {msg.sender === 'admin' ? <Shield className="w-4 h-4" /> : <UserIcon className="w-4 h-4" />}
                                </div>
                            )}

                            <div className={cn("max-w-[80%] rounded-2xl p-4 text-sm leading-relaxed",
                                isMe ? "bg-primary text-primary-foreground rounded-br-none" : "bg-white/10 text-foreground rounded-bl-none"
                            )}>
                                {msg.content}
                                <div className={cn("text-[9px] mt-1 opacity-50 font-bold uppercase tracking-wider", isMe ? "text-primary-foreground" : "text-muted-foreground")}>
                                    {format(new Date(msg.createdAt), "HH:mm", { locale: enUS })}
                                </div>
                            </div>
                        </div>
                    )
                })}
                <div ref={messagesEndRef} />
            </div>

            <div className="p-4 bg-white/[0.02] border-t border-white/5">
                <form onSubmit={handleSend} className="flex gap-3">
                    <Input
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="Your message..."
                        className="flex-1 h-12 rounded-xl bg-background/50 border-white/10 focus:border-primary/50"
                    />
                    <Button type="submit" size="icon" disabled={isSending} className="h-12 w-12 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25 shrink-0">
                        {isSending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                    </Button>
                </form>
                <div className="flex justify-center mt-2">
                    <button _onClick={onRefresh} className="text-[10px] text-muted-foreground hover:text-primary flex items-center gap-1 opacity-50 hover:opacity-100 transition-opacity">
                        <RefreshCw className="w-3 h-3" /> Refresh chat
                    </button>
                </div>
            </div>
        </div>
    )
}
