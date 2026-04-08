"use client"

import { useEffect, useState } from "react"
import { getCloudflareStats, type CloudflareStats } from "@/lib/cloudflare"
import { Globe, User as UserIcon, TrendingUp, ArrowLeft, HardDrive } from "lucide-react"
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis } from "recharts"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { Button } from "@/components/ui/button"

interface StatsData {
    totals: CloudflareStats & {
        formattedBytes: string
        formattedCachedBytes: string
        percentCachedRequests: string
        percentCachedBytes: string
    }
    history: Array<{
        date: string
        requests: number
        bytes: number
        uniques: number
    }>
}

export function PublicStats() {
    const [data, setData] = useState<StatsData | null>(null)
    const [loading, setLoading] = useState(true)
    const [period, setPeriod] = useState<'24h' | '7d' | '30d' | 'all'>('30d')

    useEffect(() => {
        async function loadStats() {
            setLoading(true)
            try {
                const result = await getCloudflareStats(period)
                if (result.success && result.data) {
                    setData(result.data)
                }
            } catch (e) {
                console.error(e)
            } finally {
                setLoading(false)
            }
        }
        loadStats()
    }, [period])

    const sortedHistory = data?.history ? [...data.history].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()) : []

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-4">
                    <Button asChild variant="ghost" className="rounded-full h-10 w-10 p-0 hover:bg-white/10">
                        <Link href="/">
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                    </Button>
                    <h1 className="text-3xl font-bold tracking-tight">Public Analytics</h1>
                </div>

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
                    <div className="h-[200px] rounded-3xl glass border-white/5 animate-pulse bg-white/5" />
                    <div className="h-[200px] rounded-3xl glass border-white/5 animate-pulse bg-white/5" />
                </div>
            ) : !data ? (
                <div className="text-center py-20 text-muted-foreground">Stats unavailable</div>
            ) : (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="glass p-6 rounded-3xl border-white/5 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <Globe className="h-16 w-16" />
                            </div>
                            <div className="space-y-2 relative z-10">
                                <div className="flex items-center gap-2 text-muted-foreground text-xs uppercase font-bold tracking-wider">
                                    <Globe className="h-4 w-4" />
                                    Requests
                                </div>
                                <div className="text-4xl font-bold">
                                    {data.totals.requests.toLocaleString()}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                    {period === '24h' ? 'Last 24 Hours' : period === '7d' ? 'Last 7 Days' : period === '30d' ? 'Last 30 Days' : 'All Time'}
                                </div>
                            </div>
                        </div>

                        <div className="glass p-6 rounded-3xl border-white/5 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <UserIcon className="h-16 w-16" />
                            </div>
                            <div className="space-y-2 relative z-10">
                                <div className="flex items-center gap-2 text-muted-foreground text-xs uppercase font-bold tracking-wider">
                                    <UserIcon className="h-4 w-4" />
                                    Visitors
                                </div>
                                <div className="text-4xl font-bold">
                                    {data.totals.uniques.toLocaleString()}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                    Cumulative Daily Uniques
                                </div>
                            </div>
                        </div>

                        <div className="glass p-6 rounded-3xl border-white/5 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <HardDrive className="h-16 w-16" />
                            </div>
                            <div className="space-y-2 relative z-10">
                                <div className="flex items-center gap-2 text-muted-foreground text-xs uppercase font-bold tracking-wider">
                                    <HardDrive className="h-4 w-4" />
                                    Data Served
                                </div>
                                <div className="text-4xl font-bold">
                                    {data.totals.formattedBytes}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                    Total Bandwidth
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="glass p-6 rounded-3xl border-white/5">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-2 text-muted-foreground text-sm uppercase font-bold tracking-wider">
                                    <TrendingUp className="h-4 w-4" />
                                    Requests Trend
                                </div>
                            </div>
                            <div className="h-[250px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={sortedHistory}>
                                        <defs>
                                            <linearGradient id="pubRequestsGradient" x1="0" y1="0" x2="0" y2="1">
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
                                            fill="url(#pubRequestsGradient)"
                                            strokeWidth={2}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div className="glass p-6 rounded-3xl border-white/5">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-2 text-muted-foreground text-sm uppercase font-bold tracking-wider">
                                    <UserIcon className="h-4 w-4" />
                                    Visitors
                                </div>
                            </div>
                            <div className="h-[250px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={sortedHistory}>
                                        <defs>
                                            <linearGradient id="pubUniquesGradient" x1="0" y1="0" x2="0" y2="1">
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
                                            fill="url(#pubUniquesGradient)"
                                            strokeWidth={2}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    <div className="glass p-6 rounded-3xl border-white/5">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-2 text-muted-foreground text-sm uppercase font-bold tracking-wider">
                                <HardDrive className="h-4 w-4" />
                                Data Served
                            </div>
                        </div>
                        <div className="h-[250px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={sortedHistory}>
                                    <defs>
                                        <linearGradient id="pubBandwidthGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
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
                                        formatter={(value: number) => {
                                            if (value === 0) return '0 B';
                                            const k = 1024;
                                            const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
                                            const i = Math.floor(Math.log(value) / Math.log(k));
                                            return parseFloat((value / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
                                        }}
                                    />
                                    <XAxis dataKey="date" hide />
                                    <Area
                                        type="monotone"
                                        dataKey="bytes"
                                        stroke="#10b981"
                                        fillOpacity={1}
                                        fill="url(#pubBandwidthGradient)"
                                        strokeWidth={2}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}