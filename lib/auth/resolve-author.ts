import type { SupabaseClient } from "@supabase/supabase-js"

export type ProfileAuthorSnapshot = {
  display_name: string
  avatar_url: string | null
}

export function resolveAuthorFromProfile(
  userId: string | null,
  profile: ProfileAuthorSnapshot | undefined,
  snapshot: { name: string; avatar: string }
): { name: string; avatar: string } {
  if (userId && profile) {
    return {
      name: profile.display_name,
      avatar: profile.avatar_url ?? "",
    }
  }
  return {
    name: snapshot.name,
    avatar: snapshot.avatar ?? "",
  }
}

export async function fetchProfileAuthorsByUserIds(
  supabase: SupabaseClient,
  userIds: string[]
): Promise<Map<string, ProfileAuthorSnapshot>> {
  const unique = [...new Set(userIds.filter(Boolean))]
  if (unique.length === 0) {
    return new Map()
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("id, display_name, avatar_url")
    .in("id", unique)

  if (error) {
    console.error("[fetchProfileAuthorsByUserIds]", error.message)
    return new Map()
  }

  const map = new Map<string, ProfileAuthorSnapshot>()
  for (const row of data ?? []) {
    map.set(row.id, {
      display_name: row.display_name,
      avatar_url: row.avatar_url,
    })
  }
  return map
}
