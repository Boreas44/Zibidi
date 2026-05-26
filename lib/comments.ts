import {
  fetchProfileAuthorsByUserIds,
  resolveAuthorFromProfile,
  type ProfileAuthorSnapshot,
} from "@/lib/auth/resolve-author"
import { getSessionProfile } from "@/lib/auth/server"
import { createClient } from "@/lib/supabase/server"
import { isSupabaseConfigured } from "@/lib/supabase/env"
import type { CommentRow } from "@/lib/database.types"

export interface PostComment {
  id: string
  postId: string
  userId: string
  content: string
  author: {
    name: string
    avatar: string
  }
  createdAt: string
}

function formatCommentsDbError(message: string) {
  if (/comments|schema cache/i.test(message)) {
    return "Comments table missing. Run supabase/migrations/005_comments.sql in Supabase."
  }
  return message
}

function mapCommentRow(
  row: CommentRow,
  profile?: ProfileAuthorSnapshot | null
): PostComment {
  const author = resolveAuthorFromProfile(row.user_id, profile ?? undefined, {
    name: row.author_name,
    avatar: row.author_avatar ?? "",
  })

  return {
    id: row.id,
    postId: row.post_id,
    userId: row.user_id,
    content: row.content,
    author,
    createdAt: new Date(row.created_at).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }),
  }
}

export async function fetchCommentsForPost(
  postId: string
): Promise<{ comments: PostComment[]; error: string | null }> {
  if (!isSupabaseConfigured()) {
    return { comments: [], error: null }
  }

  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("comments")
      .select("*")
      .eq("post_id", postId)
      .order("created_at", { ascending: true })

    if (error) {
      return { comments: [], error: formatCommentsDbError(error.message) }
    }

    const rows = (data ?? []) as CommentRow[]
    const profiles = await fetchProfileAuthorsByUserIds(
      supabase,
      rows.map((r) => r.user_id)
    )

    return {
      comments: rows.map((row) => mapCommentRow(row, profiles.get(row.user_id))),
      error: null,
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to load comments."
    return { comments: [], error: message }
  }
}

export async function insertComment(input: {
  postId: string
  content: string
}): Promise<{ comment: PostComment | null; error: string | null }> {
  const profile = await getSessionProfile()
  if (!profile) {
    return { comment: null, error: "Sign in to comment." }
  }

  const content = input.content.trim()
  if (!content) {
    return { comment: null, error: "Comment cannot be empty." }
  }
  if (content.length > 2000) {
    return { comment: null, error: "Comment is too long (max 2000 characters)." }
  }

  if (!isSupabaseConfigured()) {
    return { comment: null, error: "Supabase is not configured." }
  }

  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("comments")
      .insert({
        post_id: input.postId,
        user_id: profile.id,
        content,
        author_name: profile.displayName,
        author_avatar: profile.avatarUrl ?? "",
      })
      .select()
      .single()

    if (error) {
      return { comment: null, error: formatCommentsDbError(error.message) }
    }

    return {
      comment: mapCommentRow(data as CommentRow, {
        display_name: profile.displayName,
        avatar_url: profile.avatarUrl,
      }),
      error: null,
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to post comment."
    return { comment: null, error: message }
  }
}

export async function deleteComment(
  commentId: string
): Promise<{ error: string | null }> {
  const profile = await getSessionProfile()
  if (!profile) {
    return { error: "Sign in to delete a comment." }
  }

  if (!isSupabaseConfigured()) {
    return { error: "Supabase is not configured." }
  }

  try {
    const supabase = await createClient()
    const { error } = await supabase
      .from("comments")
      .delete()
      .eq("id", commentId)
      .eq("user_id", profile.id)

    if (error) {
      return { error: error.message }
    }
    return { error: null }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to delete comment."
    return { error: message }
  }
}
