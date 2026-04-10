import { headers } from "next/headers"

export async function isLocalRequest() {
    const headerList = await headers()
    const host = headerList.get("host") || ""
    return host.includes("localhost") || host.includes("127.0.0.1") || host.startsWith("192.168.")
}
