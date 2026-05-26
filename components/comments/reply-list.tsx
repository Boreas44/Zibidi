"use client"

import { memo } from "react"
import { AnimatePresence } from "framer-motion"
import { ReplyItem } from "@/components/comments/reply-item"
import type { ReplyTreeNode } from "@/lib/replies-tree"

interface ReplyListProps {
  tree: ReplyTreeNode[]
  newReplyIds: ReadonlySet<string>
  currentUserId?: string | null
  deletingReplyId: string | null
  onDeleteReply: (replyId: string) => void
  onReplyTo: (target: { commentId: string; parentReplyId: string }) => void
  onFlyInComplete: (replyId: string) => void
}

function ReplyListComponent({
  tree,
  newReplyIds,
  currentUserId,
  deletingReplyId,
  onDeleteReply,
  onReplyTo,
  onFlyInComplete,
}: ReplyListProps) {
  if (tree.length === 0) return null

  return (
    <ul className="mt-2 space-y-0 border-l border-border/60 pl-2">
      <AnimatePresence initial={false} mode="popLayout">
        {tree.map((node) => (
          <ReplyItem
            key={node.id}
            reply={node}
            depth={0}
            newReplyIds={newReplyIds}
            currentUserId={currentUserId}
            deletingReplyId={deletingReplyId}
            onDelete={onDeleteReply}
            onReply={onReplyTo}
            onFlyInComplete={onFlyInComplete}
          />
        ))}
      </AnimatePresence>
    </ul>
  )
}

export const ReplyList = memo(ReplyListComponent)
