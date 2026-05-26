export function isValidSupabaseProjectUrl(url: string): boolean {
  try {
    const host = new URL(url).hostname
    return host.endsWith(".supabase.co") || host.endsWith(".supabase.in")
  } catch {
    return false
  }
}

export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  return Boolean(url && key && isValidSupabaseProjectUrl(url))
}

/** Human-readable misconfiguration hint (e.g. site URL pasted into SUPABASE_URL). */
export function getSupabaseConfigError(): string | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) {
    return "Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY."
  }
  if (!isValidSupabaseProjectUrl(url)) {
    return "NEXT_PUBLIC_SUPABASE_URL must be your Supabase project URL (https://….supabase.co), not your Vercel/site URL."
  }
  return null
}
