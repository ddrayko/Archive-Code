"use server"

import { exec } from "child_process"
import { promisify } from "util"

const execAsync = promisify(exec)

export type UpdateStatus = {
    success: boolean
    hasUpdates?: boolean
    isDirty?: boolean
    commitsBehind?: number
    message?: string
    error?: string
    lastChecked?: string
}

export async function checkForUpdates(): Promise<UpdateStatus> {
    try {
        // Check if git is initialized
        try {
            await execAsync("git rev-parse --is-inside-work-tree")
        } catch {
            return { success: false, error: "Not a git repository." }
        }

        // Fetch latest info
        try {
            await execAsync("git fetch origin")
        } catch (e) {
            console.error("Git fetch error:", e)
            return { success: false, error: "Failed to fetch from remote. Check internet connection." }
        }

        // Check for local changes
        const { stdout: statusOutput } = await execAsync("git status --porcelain")
        if (statusOutput.trim() !== "") {
            return {
                success: true,
                hasUpdates: false,
                isDirty: true,
                message: "Local changes detected. Automatic updates are disabled to protect your work."
            }
        }

        // Check if behind
        // Assuming main branch. We should probably verify the current branch.
        const { stdout: branchOutput } = await execAsync("git rev-parse --abbrev-ref HEAD")
        const currentBranch = branchOutput.trim()

        // Check commits behind origin/currentBranch
        const { stdout: behindOutput } = await execAsync(`git rev-list HEAD...origin/${currentBranch} --count`)
        const commitsBehind = parseInt(behindOutput.trim(), 10)

        if (commitsBehind > 0) {
            return {
                success: true,
                hasUpdates: true,
                isDirty: false,
                commitsBehind,
                message: `${commitsBehind} new update(s) available from GitHub.`
            }
        }

        return {
            success: true,
            hasUpdates: false,
            isDirty: false,
            message: "System is fully up to date."
        }

    } catch (error) {
        console.error("Update check failed:", error)
        return { success: false, error: "An unexpected error occurred while checking for updates." }
    }
}

export async function performSystemUpdate(): Promise<{ success: boolean; message: string }> {
    try {
        // Double check constraints
        const status = await checkForUpdates()

        if (!status.success) {
            return { success: false, message: status.error || "Pre-check failed." }
        }

        if (status.isDirty) {
            return { success: false, message: "Cannot update: Local file modifications detected." }
        }

        if (!status.hasUpdates) {
            return { success: true, message: "Already up to date." }
        }

        // Perform Pull
        const { stdout: branchOutput } = await execAsync("git rev-parse --abbrev-ref HEAD")
        const currentBranch = branchOutput.trim()

        await execAsync(`git pull origin ${currentBranch}`)

        // Attempt to install dependencies if package.json changed
        // We can just run it, it's safe usually
        await execAsync("npm install")

        return { success: true, message: "Update installed successfully. Please restart the application to apply changes." }

    } catch (error) {
        console.error("Update execution failed:", error)
        return { success: false, message: "Failed to execute update. Check server logs." }
    }
}
