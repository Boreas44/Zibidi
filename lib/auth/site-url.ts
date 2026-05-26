import { headers } from "next/headers"

function stripTrailingSlash(url: string) {
  return url.replace(/\/$/, "")
}

function isLocalHostname(host: string) {
  const h = host.toLowerCase()
  return (
    h.includes("localhost") ||
    h.startsWith("127.") ||
    h.endsWith(".local")
  )
}

/** Env / Vercel fallback when request headers are unavailable. */
export function getAuthSiteUrl() {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "")
  const onVercel = Boolean(process.env.VERCEL)
  const isProduction = process.env.VERCEL_ENV === "production"

  // Avoid localhost in Vercel Production when .env.local was copied to dashboard.
  if (fromEnv && !(onVercel && isProduction && fromEnv.includes("localhost"))) {
    return fromEnv
  }

  const productionHost = process.env.VERCEL_PROJECT_PRODUCTION_URL?.replace(
    /^https?:\/\//,
    ""
  )
  if (isProduction && productionHost) {
    return `https://${productionHost}`
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }

  return fromEnv ?? "http://localhost:3000"
}

/**
 * Prefer the browser’s actual origin (e.g. zibidi.vercel.app) so auth emails
 * never use localhost when the user is on production — even if env is wrong.
 */
export async function resolveAuthSiteUrl(): Promise<string> {
  try {
    const h = await headers()
    const hostHeader = h.get("x-forwarded-host") ?? h.get("host")
    if (hostHeader) {
      const host = hostHeader.split(",")[0]?.trim()
      if (host && !isLocalHostname(host)) {
        const proto =
          h.get("x-forwarded-proto")?.split(",")[0]?.trim() ??
          "https"
        return stripTrailingSlash(`${proto}://${host}`)
      }
    }
  } catch {
    // headers() only works inside a request (Server Actions, RSC, Route Handlers)
  }
  return getAuthSiteUrl()
}

export async function getAuthCallbackUrl() {
  return `${await resolveAuthSiteUrl()}/auth/callback`
}
