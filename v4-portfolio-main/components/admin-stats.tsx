"use client"

import { useEffect, useState } from "react"
import { getCloudflareStats } from "@/lib/cloudflare"
import { Activity, Globe, HardDrive, Shield, Zap, TrendingUp, Download, Server, User as UserIcon } from "lucide-react"
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { cn } from "@/lib/utils"

interface StatsData {
    totals: {
        requests: number
        cachedRequests: number
        bytes: number
        cachedBytes: number
        pageViews: number
        threats: number
        uniques: number
        percentCachedRequests: string
        percentCachedBytes: string
        formattedBytes: string
        formattedCachedBytes: string
    }
    history: Array<{
        date: string
        requests: number
        bytes: number
        uniques: number
    }>
}

export function AdminStats() {
    const [data, setData] = useState<StatsData | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const [period, setPeriod] = useState<'24h' | '7d' | '30d' | 'all'>('30d')

    useEffect(() => {
        async function loadStats() {
            setLoading(true)
            try {
                const result = await getCloudflareStats(period)
                if (result.success && result.data) {
                    setData(result.data)
                } else {
                    console.warn("Could not load stats:", result.error)
                    setError(result.error || "Failed to load")
                }
            } catch (e) {
                console.error(e)
                setError("Error loading stats")
            } finally {
                setLoading(false)
            }
        }
        loadStats()
    }, [period]) // Reload when period changes

    if (error) {
        return (
            <div className="glass p-6 rounded-3xl border-white/5 border-dashed border flex items-center justify-center text-muted-foreground text-sm py-12">
                Analytics unavailable. {error}
            </div>
        )
    }

    // Calculate sorted history once to avoid mutation issues and ensure correct order
    const sortedHistory = data?.history ? [...data.history].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()) : []

    return (
        <div className="space-y-6">
            {/* Time Range Controls */}
            <div className="flex justify-end">
                <div className="glass p-1 rounded-xl flex items-center gap-1">
                    {(['24h', '7d', '30d', 'all'] as const).map((p) => (
                        <button
                            key={p}
                            onClick={() => setPeriod(p)}
                            className={cn(
                                "px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                                period === p
                                    ? "bg-primary text-primary-foreground shadow-lg"
                                    : "hover:bg-white/5 text-muted-foreground hover:text-foreground"
                            )}
                        >
                            {p === 'all' ? 'LIFETIME' : p.toUpperCase()}
                        </button>
                    ))}
                </div>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="h-[300px] rounded-3xl glass border-white/5 animate-pulse bg-white/5" />
                    <div className="h-[300px] rounded-3xl glass border-white/5 animate-pulse bg-white/5" />
                </div>
            ) : !data ? null : (
                <>
                    {/* Top Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Total Requests */}
                        <div className="glass p-6 rounded-3xl border-white/5 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <Globe className="h-16 w-16" />
                            </div>
                            <div className="space-y-2 relative z-10">
                                <div className="flex items-center gap-2 text-muted-foreground text-xs uppercase font-bold tracking-wider">
                                    <Globe className="h-4 w-4" />
                                    Requests
                                </div>
                                <div className="text-3xl font-bold">
                                    {data.totals.requests.toLocaleString()}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                    {period === '24h' ? 'Last 24 Hours' : period === '7d' ? 'Last 7 Days' : period === '30d' ? 'Last 30 Days' : 'All Time'}
                                </div>
                            </div>
                        </div>

                        {/* Uniques */}
                        <div className="glass p-6 rounded-3xl border-white/5 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <UserIcon className="h-16 w-16" />
                            </div>
                            <div className="space-y-2 relative z-10">
                                <div className="flex items-center gap-2 text-muted-foreground text-xs uppercase font-bold tracking-wider">
                                    <UserIcon className="h-4 w-4" />
                                    Visitors
                                </div>
                                <div className="text-3xl font-bold">
                                    {data.totals.uniques.toLocaleString()}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                    Cumulative Daily Uniques ({period === '24h' ? '24h' : period === '7d' ? '7d' : period === '30d' ? '30d' : 'Life'})
                                </div>
                            </div>
                        </div>

                        {/* Data Served */}
                        <div className="glass p-6 rounded-3xl border-white/5 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <HardDrive className="h-16 w-16" />
                            </div>
                            <div className="space-y-2 relative z-10">
                                <div className="flex items-center gap-2 text-muted-foreground text-xs uppercase font-bold tracking-wider">
                                    <HardDrive className="h-4 w-4" />
                                    Bandwidth
                                </div>
                                <div className="text-3xl font-bold">
                                    {data.totals.formattedBytes}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                    {data.totals.percentCachedBytes}% Cached
                                </div>
                            </div>
                        </div>

                        {/* Cache Rate */}
                        <div className="glass p-6 rounded-3xl border-white/5 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <Zap className="h-16 w-16" />
                            </div>
                            <div className="space-y-2 relative z-10">
                                <div className="flex items-center gap-2 text-muted-foreground text-xs uppercase font-bold tracking-wider">
                                    <Zap className="h-4 w-4" />
                                    Cache Rate
                                </div>
                                <div className="text-3xl font-bold">
                                    {data.totals.percentCachedRequests}%
                                </div>
                                <div className="text-xs text-muted-foreground">
                                    Global Efficiency
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Graphs Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                        {/* Requests Graph */}
                        <div className="glass p-6 rounded-3xl border-white/5">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-2 text-muted-foreground text-sm uppercase font-bold tracking-wider">
                                    <TrendingUp className="h-4 w-4" />
                                    Requests Trend
                                </div>
                                <div className="flex items-center gap-2 text-xs">
                                    <div className="w-2 h-2 rounded-full bg-primary" />
                                    <span className="text-muted-foreground font-medium">Total Requests</span>
                                </div>
                            </div>
                            <div className="h-[250px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={sortedHistory}>
                                        <defs>
                                            <linearGradient id="requestsColorGradient" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <Tooltip
                                            contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px' }}
                                            itemStyle={{ color: '#fff' }}
                                            labelStyle={{ color: '#aaa' }}
                                            labelFormatter={(label) => {
                                                if (!label) return '';
                                                const date = new Date(label);
                                                return period === '24h'
                                                    ? date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                                    : date.toLocaleDateString([], { month: 'short', day: 'numeric' })
                                            }}
                                        />
                                        <XAxis dataKey="date" hide />
                                        <Area
                                            type="monotone"
                                            dataKey="requests"
                                            stroke="#a855f7"
                                            fillOpacity={1}
                                            fill="url(#requestsColorGradient)"
                                            strokeWidth={2}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Uniques Graph */}
                        <div className="glass p-6 rounded-3xl border-white/5">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-2 text-muted-foreground text-sm uppercase font-bold tracking-wider">
                                    <UserIcon className="h-4 w-4" />
                                    Visitors Trend
                                </div>
                                <div className="flex items-center gap-2 text-xs">
                                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                                    <span className="text-muted-foreground font-medium">Unique Visitors</span>
                                </div>
                            </div>
                            <div className="h-[250px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={sortedHistory}>
                                        <defs>
                                            <linearGradient id="uniquesColorGradient" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <Tooltip
                                            contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px' }}
                                            itemStyle={{ color: '#fff' }}
                                            labelStyle={{ color: '#aaa' }}
                                            labelFormatter={(label) => {
                                                if (!label) return '';
                                                const date = new Date(label);
                                                return period === '24h'
                                                    ? date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                                    : date.toLocaleDateString([], { month: 'short', day: 'numeric' })
                                            }}
                                        />
                                        <XAxis dataKey="date" hide />
                                        <Area
                                            type="monotone"
                                            dataKey="uniques"
                                            stroke="#3b82f6"
                                            fillOpacity={1}
                                            fill="url(#uniquesColorGradient)"
                                            strokeWidth={2}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}