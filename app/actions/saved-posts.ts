"use server"

import { revalidatePath } from "next/cache"
import { toggleSavedPost } from "@/lib/saved-posts"

export type ToggleSavedPostResult =
  | { success: true; saved: boolean }
  | { success: false; error: string }

export async function toggleSavedPostAction(input: {
  postId: string
}): Promise<ToggleSavedPostResult> {
  try {
    if (!input.postId?.trim()) {
      return { success: false, error: "Invalid post." }
    }

    const { saved, error } = await toggleSavedPost(input)
    if (error) {
      return { success: false, error }
    }

    revalidatePath("/")
    revalidatePath(`/post/${input.postId}`)

    return { success: true, saved }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Something went wrong."
    return { success: false, error: message }
  }
}
