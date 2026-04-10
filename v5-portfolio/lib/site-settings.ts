const ENV_FALLBACK_DEVELOPER_NAME = (process.env.NEXT_PUBLIC_DEFAULT_DEVELOPER_NAME || "").trim()

const PLACEHOLDER_DEVELOPER_NAME = "No Name"
const HARDCODED_FALLBACK_DEVELOPER_NAME = "Drayko"

const isPlaceholderName = (value: string) => value.trim().toLowerCase() === PLACEHOLDER_DEVELOPER_NAME.toLowerCase()

export const DEFAULT_DEVELOPER_NAME =
  ENV_FALLBACK_DEVELOPER_NAME && !isPlaceholderName(ENV_FALLBACK_DEVELOPER_NAME)
    ? ENV_FALLBACK_DEVELOPER_NAME
    : HARDCODED_FALLBACK_DEVELOPER_NAME

export function normalizeDeveloperName(value?: string | null) {
  const trimmed = (value || "").trim()
  return trimmed.length > 0 && !isPlaceholderName(trimmed) ? trimmed : DEFAULT_DEVELOPER_NAME
}
