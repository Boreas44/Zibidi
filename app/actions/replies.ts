"use server"

import {
  deleteReply,
  fetchRepliesForPost,
  insertReply,
  type CommentReply,
} from "@/lib/replies"

export type RepliesActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string }

export async function fetchRepliesAction(
  postId: string
): Promise<RepliesActionResult<CommentReply[]>> {
  try {
    if (!postId?.trim()) {
      return { success: false, error: "Invalid post." }
    }

    const { replies, error } = await fetchRepliesForPost(postId)
    if (error) {
      return { success: false, error }
    }
    return { success: true, data: replies }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not load replies."
    return { success: false, error: message }
  }
}

export async function createReplyAction(input: {
  postId: string
  commentId: string
  parentReplyId?: string | null
  content: string
}): Promise<RepliesActionResult<CommentReply>> {
  try {
    const { reply, error } = await insertReply(input)
    if (error || !reply) {
      return { success: false, error: error ?? "Could not post reply." }
    }
    return { success: true, data: reply }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not post reply."
    return { success: false, error: message }
  }
}

export async function deleteReplyAction(
  replyId: string
): Promise<RepliesActionResult<null>> {
  try {
    if (!replyId?.trim()) {
      return { success: false, error: "Invalid reply." }
    }

    const { error } = await deleteReply(replyId)
    if (error) {
      return { success: false, error }
    }
    return { success: true, data: null }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not delete reply."
    return { success: false, error: message }
  }
}
