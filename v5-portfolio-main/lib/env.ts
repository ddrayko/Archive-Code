const readEnv = (key: string, { required = false, redact = false } = {}) => {
  const value = process.env[key]
  if (!value) {
    if (required && typeof window === "undefined") {
      // Fail fast on the server to avoid leaking undefined configs into builds
      throw new Error(`Missing required environment variable: ${key}`)
    }
    return ""
  }
  return redact ? "***" : value
}

export const publicEnv = {
  firebase: {
    apiKey: readEnv("NEXT_PUBLIC_FIREBASE_API_KEY", { required: true }),
    authDomain: readEnv("NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN", { required: true }),
    projectId: readEnv("NEXT_PUBLIC_FIREBASE_PROJECT_ID", { required: true }),
    storageBucket: readEnv("NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET", { required: true }),
    messagingSenderId: readEnv("NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID", { required: true }),
    appId: readEnv("NEXT_PUBLIC_FIREBASE_APP_ID", { required: true }),
    measurementId: readEnv("NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID"),
  },
  turnstileSiteKey: readEnv("NEXT_PUBLIC_TURNSTILE_SITE_KEY", { required: true }),
}

export const serverEnv = {
  turnstileSecret: readEnv("TURNSTILE_SECRET_KEY", { required: true, redact: true }),
}
