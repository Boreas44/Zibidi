import type { SupabaseClient } from "@supabase/supabase-js"

export const DISPLAY_NAME_MIN_LENGTH = 2
export const DISPLAY_NAME_MAX_LENGTH = 32
export const DISPLAY_NAME_TAKEN =
  "This display name is already taken. Choose another."

export function normalizeDisplayName(name: string): string {
  return name.trim().replace(/\s+/g, " ")
}

export function validateDisplayNameFormat(name: string): string | null {
  const normalized = normalizeDisplayName(name)
  if (normalized.length < DISPLAY_NAME_MIN_LENGTH) {
    return `Display name must be at least ${DISPLAY_NAME_MIN_LENGTH} characters.`
  }
  if (normalized.length > DISPLAY_NAME_MAX_LENGTH) {
    return `Display name must be at most ${DISPLAY_NAME_MAX_LENGTH} characters.`
  }
  if (!/^[\p{L}\p{N}_.\- ]+$/u.test(normalized)) {
    return "Display name can only use letters, numbers, spaces, and _ . -"
  }
  return null
}

export function isDisplayNameConflictError(
  message: string,
  code?: string
): boolean {
  if (code === "23505") return true
  const lower = message.toLowerCase()
  return (
    lower.includes("profiles_display_name_lower_unique") ||
    lower.includes("profiles_display_name") ||
    (lower.includes("unique") && lower.includes("display_name"))
  )
}

export async function assertDisplayNameAvailable(
  supabase: SupabaseClient,
  displayName: string,
  excludeUserId?: string | null
): Promise<{ ok: true } | { ok: false; error: string }> {
  const formatError = validateDisplayNameFormat(displayName)
  if (formatError) {
    return { ok: false, error: formatError }
  }

  const normalized = normalizeDisplayName(displayName)

  const { data, error } = await supabase.rpc("is_display_name_available", {
    p_name: normalized,
    p_exclude_user_id: excludeUserId ?? null,
  })

  if (error) {
    const { data: profiles, error: listError } = await supabase
      .from("profiles")
      .select("id, display_name")

    if (listError) {
      return { ok: false, error: listError.message }
    }

    const key = normalized.toLowerCase()
    const taken = (profiles ?? []).some(
      (p) =>
        p.display_name.trim().toLowerCase() === key &&
        p.id !== excludeUserId
    )
    if (taken) {
      return { ok: false, error: DISPLAY_NAME_TAKEN }
    }
    return { ok: true }
  }

  if (data === false) {
    return { ok: false, error: DISPLAY_NAME_TAKEN }
  }

  return { ok: true }
}
