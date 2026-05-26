import type { BlogPost } from "@/components/blog-card"
import type { PostRow } from "@/lib/database.types"
import {
  fetchProfileAuthorsByUserIds,
  resolveAuthorFromProfile,
  type ProfileAuthorSnapshot,
} from "@/lib/auth/resolve-author"
import { getSessionProfile } from "@/lib/auth/server"
import {
  fetchUserReactionsByPostIds,
  type PostReactionKind,
} from "@/lib/post-reactions"
import { createClient } from "@/lib/supabase/server"
import { isSupabaseConfigured } from "@/lib/supabase/env"
import { formatDateTime } from "@/lib/format-datetime"

export function mapPostRowToBlogPost(
  row: PostRow,
  profile?: ProfileAuthorSnapshot | null,
  userReaction?: PostReactionKind | null
): BlogPost {
  const author = resolveAuthorFromProfile(row.user_id, profile ?? undefined, {
    name: row.author_name,
    avatar: row.author_avatar || "",
  })

  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    content: row.content,
    excerpt: row.excerpt,
    author,
    coverImage: row.cover_image || "",
    category: row.category,
    readTime: row.read_time,
    likes: row.likes_count,
    dislikes: row.dislikes_count ?? 0,
    comments: row.comments_count,
    createdAt: formatDateTime(row.created_at),
    isLiked: userReaction === "like",
    isDisliked: userReaction === "dislike",
    isBookmarked: false,
  }
}

export function buildReadTime(content: string): string {
  const words = content.trim().split(/\s+/).filter(Boolean).length
  return `${Math.max(1, Math.ceil(words / 200))} min read`
}

export async function fetchPostById(
  postId: string
): Promise<{ post: BlogPost | null; error: string | null }> {
  if (!isSupabaseConfigured()) {
    return { post: null, error: "Supabase is not configured." }
  }

  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .eq("id", postId)
      .maybeSingle()

    if (error) {
      return { post: null, error: error.message }
    }
    if (!data) {
      return { post: null, error: null }
    }

    const profiles = data.user_id
      ? await fetchProfileAuthorsByUserIds(supabase, [data.user_id])
      : new Map()

    const session = await getSessionProfile()
    const reactions = session
      ? await fetchUserReactionsByPostIds(session.id, [data.id])
      : new Map<string, PostReactionKind>()

    return {
      post: mapPostRowToBlogPost(
        data,
        data.user_id ? profiles.get(data.user_id) : null,
        reactions.get(data.id) ?? null
      ),
      error: null,
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to load post."
    return { post: null, error: message }
  }
}

export async function fetchPosts(): Promise<BlogPost[]> {
  if (!isSupabaseConfigured()) {
    return []
  }

  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("[fetchPosts]", error.message)
      return []
    }

    const rows = data ?? []
    const postIds = rows.map((r) => r.id)
    const profiles = await fetchProfileAuthorsByUserIds(
      supabase,
      rows.map((r) => r.user_id).filter((id): id is string => Boolean(id))
    )

    const session = await getSessionProfile()
    const reactions = session
      ? await fetchUserReactionsByPostIds(session.id, postIds)
      : new Map<string, PostReactionKind>()

    return rows.map((row) =>
      mapPostRowToBlogPost(
        row,
        row.user_id ? profiles.get(row.user_id) : null,
        reactions.get(row.id) ?? null
      )
    )
  } catch (err) {
    console.error("[fetchPosts]", err)
    return []
  }
}

export async function deletePost(
  postId: string
): Promise<{ error: string | null }> {
  const profile = await getSessionProfile()
  if (!profile) {
    return { error: "Sign in to delete a post." }
  }

  if (!isSupabaseConfigured()) {
    return { error: "Supabase is not configured." }
  }

  try {
    const supabase = await createClient()
    const { error } = await supabase
      .from("posts")
      .delete()
      .eq("id", postId)
      .eq("user_id", profile.id)

    if (error) {
      return { error: error.message }
    }
    return { error: null }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to delete post"
    return { error: message }
  }
}

export async function deleteAllPosts(): Promise<{ error: string | null }> {
  if (!isSupabaseConfigured()) {
    return { error: null }
  }

  try {
    const supabase = await createClient()
    const { error } = await supabase
      .from("posts")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000")

    if (error) {
      return { error: error.message }
    }
    return { error: null }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to delete posts"
    return { error: message }
  }
}

export async function insertPost(input: {
  title: string
  content: string
  category: string
}): Promise<{ post: BlogPost | null; error: string | null }> {
  const profile = await getSessionProfile()
  if (!profile) {
    return { post: null, error: "Sign in to create a post." }
  }

  const excerpt =
    input.content.trim().slice(0, 150) +
    (input.content.length > 150 ? "..." : "")

  const row = {
    title: input.title.trim(),
    content: input.content.trim(),
    excerpt,
    category: input.category,
    author_name: profile.displayName,
    author_avatar: profile.avatarUrl ?? "",
    cover_image: "",
    read_time: buildReadTime(input.content),
    likes_count: 0,
    dislikes_count: 0,
    comments_count: 0,
    user_id: profile.id,
  }

  if (!isSupabaseConfigured()) {
    return { post: null, error: "Supabase is not configured." }
  }

  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("posts")
      .insert(row)
      .select()
      .single()

    if (error) {
      return { post: null, error: error.message }
    }

    return {
      post: mapPostRowToBlogPost(data, {
        display_name: profile.displayName,
        avatar_url: profile.avatarUrl,
      }),
      error: null,
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to create post"
    return { post: null, error: message }
  }
}
