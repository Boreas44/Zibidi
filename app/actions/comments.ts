"use server"

import {
  deleteComment,
  fetchCommentsForPost,
  insertComment,
  type PostComment,
} from "@/lib/comments"

export type CommentsActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string }

export async function fetchCommentsAction(
  postId: string
): Promise<CommentsActionResult<PostComment[]>> {
  try {
    if (!postId?.trim()) {
      return { success: false, error: "Invalid post." }
    }

    const { comments, error } = await fetchCommentsForPost(postId)
    if (error) {
      return { success: false, error }
    }
    return { success: true, data: comments }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not load comments."
    return { success: false, error: message }
  }
}

export async function createCommentAction(input: {
  postId: string
  content: string
}): Promise<CommentsActionResult<PostComment>> {
  try {
    const { comment, error } = await insertComment(input)
    if (error || !comment) {
      return { success: false, error: error ?? "Could not post comment." }
    }
    return { success: true, data: comment }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not post comment."
    return { success: false, error: message }
  }
}

export async function deleteCommentAction(
  commentId: string
): Promise<CommentsActionResult<null>> {
  try {
    if (!commentId?.trim()) {
      return { success: false, error: "Invalid comment." }
    }

    const { error } = await deleteComment(commentId)
    if (error) {
      return { success: false, error }
    }
    return { success: true, data: null }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not delete comment."
    return { success: false, error: message }
  }
}
