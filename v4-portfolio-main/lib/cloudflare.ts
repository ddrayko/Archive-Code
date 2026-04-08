"use server"

export interface CloudflareStats {
    requests: number
    cachedRequests: number
    bytes: number
    cachedBytes: number
    pageViews: number
    uniques: number
    threats: number
}

interface CloudflareResponse {
    data: {
        viewer: {
            zones: Array<{
                httpRequests1dGroups: Array<{
                    sum: {
                        requests: number
                        bytes: number
                        cachedBytes: number
                        cachedRequests: number
                        pageViews: number
                        threats: number
                    }
                    uniq: {
                        uniques: number
                    }
                    dimensions: {
                        date: string
                    }
                }>
                httpRequests1hGroups?: Array<{
                    sum: {
                        requests: number
                        bytes: number
                        cachedBytes: number
                        cachedRequests: number
                        pageViews: number
                        threats: number
                    }
                    uniq: {
                        uniques: number
                    }
                    dimensions: {
                        datetime: string
                    }
                }>
            }>
        }
    }
    errors?: any[]
}

export async function getCloudflareStats(period: '24h' | '7d' | '30d' | 'all' = '30d') {
    const ZONE_ID = process.env.CLOUDFLARE_ZONE_ID
    const API_TOKEN = process.env.CLOUDFLARE_API_TOKEN

    if (!ZONE_ID || !API_TOKEN) {
        const missing = []
        if (!ZONE_ID) missing.push("CLOUDFLARE_ZONE_ID")
        if (!API_TOKEN) missing.push("CLOUDFLARE_API_TOKEN")

        console.warn(`Missing Cloudflare credentials: ${missing.join(", ")}`)
        return { success: false, error: `Missing credentials: ${missing.join(", ")}. Did you create .env.local and restart the server?` }
    }

    const now = new Date()
    let dateGeq = new Date()
    let dataset = "httpRequests1dGroups"
    let limit = 30

    // Calculate date range and dataset
    switch (period) {
        case '24h':
            dateGeq.setHours(now.getHours() - 24)
            dataset = "httpRequests1hGroups"
            limit = 24
            break
        case '7d':
            dateGeq.setDate(now.getDate() - 7)
            dataset = "httpRequests1dGroups"
            limit = 7
            break
        case '30d':
            dateGeq.setDate(now.getDate() - 30)
            dataset = "httpRequests1dGroups"
            limit = 30
            break
        case 'all':
            dateGeq.setDate(now.getDate() - 364) // 364 days to stay strictly under the 31539600s (365 days + leap seconds buffer) limit
            dataset = "httpRequests1dGroups"
            limit = 365
            break
    }

    // Format date for GraphQL (ISO string)
    const dateGeqStr = dateGeq.toISOString() // GraphQL expects ISO for date_geq usually, or YYYY-MM-DD depending on field.
    // For 1h groups 'date' dimension is actually 'datetime' usually. 
    // Wait, Cloudflare GraphQL 'date' dimension is just date part (YYYY-MM-DD). 
    // For 1h groups, dimension is 'datetime' (YYYY-MM-DDTHH:mm:ssZ).

    // Let's check documentation / valid fields.
    // data -> viewer -> zones -> httpRequests1hGroups -> datetime
    // data -> viewer -> zones -> httpRequests1dGroups -> date

    const dimensionField = period === '24h' ? 'datetime' : 'date'
    const filterKey = period === '24h' ? 'datetime_geq' : 'date_geq'
    const filterValue = period === '24h' ? dateGeq.toISOString() : dateGeq.toISOString().split('T')[0]

    /* 
     NOTE: Cloudflare's GraphQL API (specifically httpRequests1dGroups) does NOT provide a deduplicated 
     count of unique visitors over a 30-day period (like the Cloudflare dashboard does). 
     It only provides daily unique counts.
     
     The 'httpRequestsAdaptiveGroups' dataset which could theoretically provide this is often restricted 
     or doesn't support the 'uniq' field for basic plans.
     
     Therefore, we sum the daily/hourly unique counts. This results in "Total Daily Visits", 
     which will be higher than "True Monthly Unique Visitors" because a user visiting on 
     two different days counts as 2 visits here, but 1 unique in Cloudflare's dashboard.
     
     We accept this limitation to keep the dashboard functional without errors.
    */

    const query = `
    query {
      viewer {
        zones(filter: {zoneTag: "${ZONE_ID}"}) {
          ${dataset}(limit: ${limit}, filter: {${filterKey}: "${filterValue}"}) {
            sum {
              requests
              bytes
              cachedBytes
              cachedRequests
              pageViews
              threats
            }
            uniq {
              uniques
            }
            dimensions {
              ${dimensionField}
            }
          }
        }
      }
    }
  `

    try {
        const response = await fetch('https://api.cloudflare.com/client/v4/graphql', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_TOKEN}`
            },
            body: JSON.stringify({ query }),
            next: { revalidate: 60 } // Cache for 1 minute
        })

        const result = await response.json() as CloudflareResponse

        if (result.errors) {
            console.warn("Cloudflare GraphQL Error:", result.errors)
            return { success: false, error: "Cloudflare API Error: " + result.errors[0]?.message }
        }

        // @ts-ignore
        const groups = result.data?.viewer?.zones?.[0]?.[dataset] || []

        const totals: CloudflareStats = groups.reduce((acc: any, curr: any) => {
            const sum = curr.sum
            const uniq = curr.uniq
            return {
                requests: acc.requests + (sum.requests || 0),
                cachedRequests: acc.cachedRequests + (sum.cachedRequests || 0),
                bytes: acc.bytes + (sum.bytes || 0),
                cachedBytes: acc.cachedBytes + (sum.cachedBytes || 0),
                pageViews: acc.pageViews + (sum.pageViews || 0),
                uniques: acc.uniques + (uniq?.uniques || 0),
                threats: acc.threats + (sum.threats || 0)
            }
        }, {
            requests: 0, cachedRequests: 0, bytes: 0, cachedBytes: 0, pageViews: 0, uniques: 0, threats: 0
        })

        const aggregated: CloudflareStats = totals

        // Calculate percentages
        const percentCachedRequests = aggregated.requests > 0
            ? ((aggregated.cachedRequests / aggregated.requests) * 100).toFixed(1)
            : "0"

        const percentCachedBytes = aggregated.bytes > 0
            ? ((aggregated.cachedBytes / aggregated.bytes) * 100).toFixed(1)
            : "0"

        // Format bytes
        const formatBytes = (bytes: number) => {
            if (bytes === 0) return '0 B';
            const k = 1024;
            const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
            const i = Math.floor(Math.log(bytes) / Math.log(k));
            return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
        };

        return {
            success: true,
            data: {
                totals: {
                    ...aggregated,
                    formattedBytes: formatBytes(aggregated.bytes),
                    formattedCachedBytes: formatBytes(aggregated.cachedBytes),
                    percentCachedRequests,
                    percentCachedBytes
                },
                history: groups.map((g: any) => ({
                    date: g.dimensions[dimensionField], // 'date' or 'datetime'
                    requests: g.sum.requests,
                    uniques: g.uniq?.uniques || 0,
                    bytes: g.sum.bytes
                }))
            }
        }
    } catch (error) {
        console.error("Failed to fetch Cloudflare stats:", error)
        return { success: false, error: "Network/Server Error" }
    }
}
