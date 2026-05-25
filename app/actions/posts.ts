"use server"

import { revalidatePath } from "next/cache"
import { deleteAllPosts, insertPost } from "@/lib/posts"
import type { BlogPost } from "@/components/blog-card"

export type CreatePostResult =
  | { success: true; post: BlogPost }
  | { success: false; error: string }

export type DeleteAllPostsResult =
  | { success: true }
  | { success: false; error: string }

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
}): Promise<CreatePostResult> {
  try {
    if (!input.title.trim() || !input.content.trim()) {
      return { success: false, error: "Title and content are required." }
    }

    const { post, error } = await insertPost(input)

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
