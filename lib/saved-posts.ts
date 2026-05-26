import { getSessionProfile } from "@/lib/auth/server"
import { createClient } from "@/lib/supabase/server"
import { isSupabaseConfigured } from "@/lib/supabase/env"

export function isSavedPostsSchemaMissing(message: string): boolean {
  return /saved_posts|schema cache/i.test(message)
}

function formatSavedPostsDbError(message: string) {
  if (isSavedPostsSchemaMissing(message)) {
    return "Saved posts not set up yet. Run supabase/migrations/009_saved_posts.sql in Supabase SQL Editor."
  }
  return message
}

export async function fetchSavedPostIdsByUser(
  userId: string,
  postIds: string[]
): Promise<Set<string>> {
  const saved = new Set<string>()
  if (!isSupabaseConfigured() || postIds.length === 0) {
    return saved
  }

  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("saved_posts")
      .select("post_id")
      .eq("user_id", userId)
      .in("post_id", postIds)

    if (error) {
      if (!isSavedPostsSchemaMissing(error.message)) {
        console.error("[fetchSavedPostIdsByUser]", error.message)
      }
      return saved
    }

    for (const row of data ?? []) {
      saved.add(row.post_id)
    }
    return saved
  } catch (err) {
    const message = err instanceof Error ? err.message : ""
    if (message && !isSavedPostsSchemaMissing(message)) {
      console.error("[fetchSavedPostIdsByUser]", err)
    }
    return saved
  }
}

export async function toggleSavedPost(input: {
  postId: string
}): Promise<{ saved: boolean; error: string | null }> {
  const profile = await getSessionProfile()
  if (!profile) {
    return { saved: false, error: "Sign in to save posts." }
  }

  if (!isSupabaseConfigured()) {
    return { saved: false, error: "Supabase is not configured." }
  }

  try {
    const supabase = await createClient()
    const { data: existing, error: fetchError } = await supabase
      .from("saved_posts")
      .select("id")
      .eq("post_id", input.postId)
      .eq("user_id", profile.id)
      .maybeSingle()

    if (fetchError) {
      return { saved: false, error: formatSavedPostsDbError(fetchError.message) }
    }

    if (existing) {
      const { error: deleteError } = await supabase
        .from("saved_posts")
        .delete()
        .eq("id", existing.id)

      if (deleteError) {
        return { saved: false, error: formatSavedPostsDbError(deleteError.message) }
      }
      return { saved: false, error: null }
    }

    const { error: insertError } = await supabase.from("saved_posts").insert({
      post_id: input.postId,
      user_id: profile.id,
    })

    if (insertError) {
      return { saved: false, error: formatSavedPostsDbError(insertError.message) }
    }

    return { saved: true, error: null }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not update saved post."
    return { saved: false, error: message }
  }
}
