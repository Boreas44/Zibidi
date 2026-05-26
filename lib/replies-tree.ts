import type { CommentReply } from "@/lib/replies-shared"

export type ReplyTreeNode = CommentReply & {
  children: ReplyTreeNode[]
}

/** Nest flat replies (multi-level) under a single comment thread. */
export function buildReplyTree(flat: CommentReply[]): ReplyTreeNode[] {
  const nodes = new Map<string, ReplyTreeNode>()
  const roots: ReplyTreeNode[] = []

  for (const reply of flat) {
    nodes.set(reply.id, { ...reply, children: [] })
  }

  for (const reply of flat) {
    const node = nodes.get(reply.id)!
    if (reply.parentReplyId) {
      const parent = nodes.get(reply.parentReplyId)
      if (parent) {
        parent.children.push(node)
      } else {
        roots.push(node)
      }
    } else {
      roots.push(node)
    }
  }

  return roots
}

export function groupRepliesByCommentId(
  replies: CommentReply[]
): Record<string, CommentReply[]> {
  const map: Record<string, CommentReply[]> = {}
  for (const reply of replies) {
    if (!map[reply.commentId]) {
      map[reply.commentId] = []
    }
    map[reply.commentId].push(reply)
  }
  return map
}

export function countRepliesInMap(map: Record<string, CommentReply[]>): number {
  return Object.values(map).reduce((sum, list) => sum + list.length, 0)
}
