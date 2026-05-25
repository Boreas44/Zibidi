/** Harf avatarı — örnek/stock fotoğraf yok. */
export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return "?"
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

export function hasAvatarUrl(url: string | null | undefined): boolean {
  return Boolean(url?.trim())
}
