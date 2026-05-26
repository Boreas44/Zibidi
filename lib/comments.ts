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

function mapCommentRow(row: CommentRow): PostComment {
  return {
    id: row.id,
    postId: row.post_id,
    userId: row.user_id,
    content: row.content,
    author: {
      name: row.author_name,
      avatar: row.author_avatar ?? "",
    },
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
      return { comments: [], error: error.message }
    }

    return {
      comments: (data ?? []).map((row) => mapCommentRow(row as CommentRow)),
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
      return { comment: null, error: error.message }
    }

    return { comment: mapCommentRow(data as CommentRow), error: null }
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
