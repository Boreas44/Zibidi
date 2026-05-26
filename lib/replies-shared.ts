import {
  resolveAuthorFromProfile,
  type ProfileAuthorSnapshot,
} from "@/lib/auth/resolve-author"
import type { ReplyRow } from "@/lib/database.types"

export interface CommentReply {
  id: string
  postId: string
  commentId: string
  parentReplyId: string | null
  userId: string
  content: string
  author: {
    name: string
    avatar: string
  }
  createdAt: string
}

export function mapReplyRow(
  row: ReplyRow,
  profile?: ProfileAuthorSnapshot | null
): CommentReply {
  const author = resolveAuthorFromProfile(row.user_id, profile ?? undefined, {
    name: row.author_name,
    avatar: row.author_avatar ?? "",
  })

  return {
    id: row.id,
    postId: row.post_id,
    commentId: row.comment_id,
    parentReplyId: row.parent_reply_id,
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
