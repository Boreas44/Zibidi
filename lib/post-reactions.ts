import { getSessionProfile } from "@/lib/auth/server"
import { createClient } from "@/lib/supabase/server"
import { isSupabaseConfigured } from "@/lib/supabase/env"

export type PostReactionKind = "like" | "dislike"

export type PostReactionState = {
  likes: number
  dislikes: number
  userReaction: PostReactionKind | null
}

export function isReactionsSchemaMissing(message: string): boolean {
  return /post_reactions|schema cache|dislikes_count/i.test(message)
}

function formatReactionsDbError(message: string) {
  if (isReactionsSchemaMissing(message)) {
    return "Reactions not set up yet. Run supabase/migrations/007_post_reactions.sql in Supabase SQL Editor."
  }
  return message
}

export async function fetchUserReactionsByPostIds(
  userId: string,
  postIds: string[]
): Promise<Map<string, PostReactionKind>> {
  const map = new Map<string, PostReactionKind>()
  if (!isSupabaseConfigured() || postIds.length === 0) {
    return map
  }

  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("post_reactions")
      .select("post_id, reaction")
      .eq("user_id", userId)
      .in("post_id", postIds)

    if (error) {
      if (!isReactionsSchemaMissing(error.message)) {
        console.error("[fetchUserReactionsByPostIds]", error.message)
      }
      return map
    }

    for (const row of data ?? []) {
      if (row.reaction === "like" || row.reaction === "dislike") {
        map.set(row.post_id, row.reaction)
      }
    }
    return map
  } catch (err) {
    const message = err instanceof Error ? err.message : ""
    if (message && !isReactionsSchemaMissing(message)) {
      console.error("[fetchUserReactionsByPostIds]", err)
    }
    return map
  }
}

export async function togglePostReaction(input: {
  postId: string
  reaction: PostReactionKind
}): Promise<{ state: PostReactionState | null; error: string | null }> {
  const profile = await getSessionProfile()
  if (!profile) {
    return { state: null, error: "Sign in to react to posts." }
  }

  if (!isSupabaseConfigured()) {
    return { state: null, error: "Supabase is not configured." }
  }

  try {
    const supabase = await createClient()
    const { data: existing, error: fetchError } = await supabase
      .from("post_reactions")
      .select("id, reaction")
      .eq("post_id", input.postId)
      .eq("user_id", profile.id)
      .maybeSingle()

    if (fetchError) {
      return { state: null, error: formatReactionsDbError(fetchError.message) }
    }

    if (!existing) {
      const { error: insertError } = await supabase.from("post_reactions").insert({
        post_id: input.postId,
        user_id: profile.id,
        reaction: input.reaction,
      })
      if (insertError) {
        return { state: null, error: formatReactionsDbError(insertError.message) }
      }
    } else if (existing.reaction === input.reaction) {
      const { error: deleteError } = await supabase
        .from("post_reactions")
        .delete()
        .eq("id", existing.id)
      if (deleteError) {
        return { state: null, error: formatReactionsDbError(deleteError.message) }
      }
    } else {
      const { error: updateError } = await supabase
        .from("post_reactions")
        .update({ reaction: input.reaction })
        .eq("id", existing.id)
      if (updateError) {
        return { state: null, error: formatReactionsDbError(updateError.message) }
      }
    }

    const { data: post, error: postError } = await supabase
      .from("posts")
      .select("likes_count, dislikes_count")
      .eq("id", input.postId)
      .single()

    if (postError || !post) {
      const msg = postError?.message ?? "Post not found."
      return {
        state: null,
        error: isReactionsSchemaMissing(msg)
          ? formatReactionsDbError(msg)
          : msg,
      }
    }

    const { data: userReactionRow } = await supabase
      .from("post_reactions")
      .select("reaction")
      .eq("post_id", input.postId)
      .eq("user_id", profile.id)
      .maybeSingle()

    const userReaction =
      userReactionRow?.reaction === "like" || userReactionRow?.reaction === "dislike"
        ? userReactionRow.reaction
        : null

    return {
      state: {
        likes: post.likes_count,
        dislikes: post.dislikes_count ?? 0,
        userReaction,
      },
      error: null,
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not update reaction."
    return { state: null, error: message }
  }
}
