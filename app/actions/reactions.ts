"use server"

import {
  togglePostReaction,
  type PostReactionKind,
  type PostReactionState,
} from "@/lib/post-reactions"

export type ToggleReactionResult =
  | { success: true; state: PostReactionState }
  | { success: false; error: string }

export async function togglePostReactionAction(input: {
  postId: string
  reaction: PostReactionKind
}): Promise<ToggleReactionResult> {
  try {
    if (!input.postId?.trim()) {
      return { success: false, error: "Invalid post." }
    }

    const { state, error } = await togglePostReaction(input)
    if (error || !state) {
      return { success: false, error: error ?? "Could not update reaction." }
    }

    return { success: true, state }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Something went wrong."
    return { success: false, error: message }
  }
}
