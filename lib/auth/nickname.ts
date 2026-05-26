import { normalizeDisplayName } from "@/lib/auth/display-name"

/** Raw stored value → canonical nickname (no leading @). */
export function normalizeNickname(value: string): string {
  return normalizeDisplayName(value.replace(/^@+/, ""))
}

/** UI: always show with @ prefix. */
export function formatNickname(
  value: string | null | undefined,
  fallback = "unknown"
): string {
  const base = value ? normalizeNickname(value) : ""
  const handle = base || fallback
  return `@${handle}`
}

/** For avatars / aria — plain handle without @. */
export function nicknameHandle(value: string | null | undefined): string {
  if (!value) return ""
  return normalizeNickname(value)
}
