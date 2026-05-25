import { createClient } from "@/lib/supabase/server"
import { isSupabaseConfigured } from "@/lib/supabase/env"

export interface AppProfile {
  id: string
  displayName: string
  email: string
  bio: string
  avatarUrl: string | null
}

export async function getAuthUser() {
  if (!isSupabaseConfigured()) return null

  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    return user
  } catch {
    return null
  }
}

export async function getAppProfile(userId: string): Promise<AppProfile | null> {
  if (!isSupabaseConfigured()) return null

  try {
    const supabase = await createClient()
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("id, display_name, bio, avatar_url")
      .eq("id", userId)
      .single()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (error || !profile || !user) return null

    return {
      id: profile.id,
      displayName: profile.display_name,
      email: user.email ?? "",
      bio: profile.bio ?? "",
      avatarUrl: profile.avatar_url,
    }
  } catch {
    return null
  }
}

export async function getSessionProfile(): Promise<AppProfile | null> {
  const user = await getAuthUser()
  if (!user) return null
  return getAppProfile(user.id)
}
