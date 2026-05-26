"use server"

import { revalidatePath } from "next/cache"
import { deleteAllPosts, deletePost, fetchPostById, insertPost } from "@/lib/posts"
import type { BlogPost } from "@/components/blog-card"
import type { PostMedia } from "@/lib/post-media"

export type CreatePostResult =
  | { success: true; post: BlogPost }
  | { success: false; error: string }

export type DeleteAllPostsResult =
  | { success: true }
  | { success: false; error: string }

export type DeletePostResult =
  | { success: true }
  | { success: false; error: string }

export type FetchPostResult =
  | { success: true; post: BlogPost }
  | { success: false; error: string }

export async function fetchPostByIdAction(postId: string): Promise<FetchPostResult> {
  try {
    if (!postId?.trim()) {
      return { success: false, error: "Invalid post." }
    }
    const { post, error } = await fetchPostById(postId)
    if (error) {
      return { success: false, error }
    }
    if (!post) {
      return { success: false, error: "Post not found." }
    }
    return { success: true, post }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Something went wrong."
    return { success: false, error: message }
  }
}

export async function deletePostAction(postId: string): Promise<DeletePostResult> {
  try {
    if (!postId?.trim()) {
      return { success: false, error: "Invalid post." }
    }

    const { error } = await deletePost(postId)
    if (error) {
      return { success: false, error }
    }
    revalidatePath("/")
    return { success: true }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Something went wrong."
    return { success: false, error: message }
  }
}

export async function deleteAllPostsAction(): Promise<DeleteAllPostsResult> {
  try {
    const { error } = await deleteAllPosts()
    if (error) {
      return { success: false, error }
    }
    revalidatePath("/")
    return { success: true }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Something went wrong."
    return { success: false, error: message }
  }
}

export async function createPostAction(input: {
  title: string
  content: string
  category: string
  media?: PostMedia | null
}): Promise<CreatePostResult> {
  try {
    if (!input.title.trim() || !input.content.trim()) {
      return { success: false, error: "Title and content are required." }
    }

    const { post, error } = await insertPost({
      title: input.title,
      content: input.content,
      category: input.category,
      media: input.media ?? null,
    })

    if (error || !post) {
      return { success: false, error: error ?? "Could not create post." }
    }

    revalidatePath("/")
    return { success: true, post }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Something went wrong."
    return { success: false, error: message }
  }
}
