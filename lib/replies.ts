import { fetchProfileAuthorsByUserIds } from "@/lib/auth/resolve-author"
import { getSessionProfile } from "@/lib/auth/server"
import { createClient } from "@/lib/supabase/server"
import { isSupabaseConfigured } from "@/lib/supabase/env"
import type { ReplyRow } from "@/lib/database.types"
import { mapReplyRow, type CommentReply } from "@/lib/replies-shared"

export type { CommentReply } from "@/lib/replies-shared"

function formatRepliesDbError(message: string) {
  if (/replies|schema cache/i.test(message)) {
    return "Replies table missing. Run supabase/migrations/008_replies_realtime.sql in Supabase."
  }
  return message
}

export async function fetchRepliesForPost(
  postId: string
): Promise<{ replies: CommentReply[]; error: string | null }> {
  if (!isSupabaseConfigured()) {
    return { replies: [], error: null }
  }

  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("replies")
      .select("*")
      .eq("post_id", postId)
      .order("created_at", { ascending: true })

    if (error) {
      return { replies: [], error: formatRepliesDbError(error.message) }
    }

    const rows = (data ?? []) as ReplyRow[]
    const profiles = await fetchProfileAuthorsByUserIds(
      supabase,
      rows.map((r) => r.user_id)
    )

    return {
      replies: rows.map((row) => mapReplyRow(row, profiles.get(row.user_id))),
      error: null,
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to load replies."
    return { replies: [], error: message }
  }
}

export async function insertReply(input: {
  postId: string
  commentId: string
  parentReplyId?: string | null
  content: string
}): Promise<{ reply: CommentReply | null; error: string | null }> {
  const profile = await getSessionProfile()
  if (!profile) {
    return { reply: null, error: "Sign in to reply." }
  }

  const content = input.content.trim()
  if (!content) {
    return { reply: null, error: "Reply cannot be empty." }
  }
  if (content.length > 2000) {
    return { reply: null, error: "Reply is too long (max 2000 characters)." }
  }

  if (!isSupabaseConfigured()) {
    return { reply: null, error: "Supabase is not configured." }
  }

  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("replies")
      .insert({
        post_id: input.postId,
        comment_id: input.commentId,
        parent_reply_id: input.parentReplyId ?? null,
        user_id: profile.id,
        content,
        author_name: profile.displayName,
        author_avatar: profile.avatarUrl ?? "",
      })
      .select()
      .single()

    if (error) {
      return { reply: null, error: formatRepliesDbError(error.message) }
    }

    return {
      reply: mapReplyRow(data as ReplyRow, {
        display_name: profile.displayName,
        avatar_url: profile.avatarUrl,
      }),
      error: null,
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to post reply."
    return { reply: null, error: message }
  }
}

export async function deleteReply(
  replyId: string
): Promise<{ error: string | null }> {
  const profile = await getSessionProfile()
  if (!profile) {
    return { error: "Sign in to delete a reply." }
  }

  if (!isSupabaseConfigured()) {
    return { error: "Supabase is not configured." }
  }

  try {
    const supabase = await createClient()
    const { error } = await supabase
      .from("replies")
      .delete()
      .eq("id", replyId)
      .eq("user_id", profile.id)

    if (error) {
      return { error: error.message }
    }
    return { error: null }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to delete reply."
    return { error: message }
  }
}
