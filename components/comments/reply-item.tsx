"use client"

import { memo, useEffect } from "react"
import { motion } from "framer-motion"
import { Trash2 } from "lucide-react"
import { UserAvatar } from "@/components/user-avatar"
import type { ReplyTreeNode } from "@/lib/replies-tree"
import { replyFlyIn } from "@/components/comments/reply-motion"

interface ReplyItemProps {
  reply: ReplyTreeNode
  depth: number
  newReplyIds: ReadonlySet<string>
  currentUserId?: string | null
  deletingReplyId: string | null
  onDelete: (replyId: string) => void
  onReply: (target: { commentId: string; parentReplyId: string }) => void
  onFlyInComplete?: (replyId: string) => void
}

function ReplyItemComponent({
  reply,
  depth,
  newReplyIds,
  currentUserId,
  deletingReplyId,
  onDelete,
  onReply,
  onFlyInComplete,
}: ReplyItemProps) {
  const paddingLeft = Math.min(depth, 6) * 12
  const isOwn = currentUserId === reply.userId
  const isDeleting = deletingReplyId === reply.id
  const isNew = newReplyIds.has(reply.id)

  useEffect(() => {
    if (!isNew) return
    const durationMs = 520
    const timer = window.setTimeout(() => {
      onFlyInComplete?.(reply.id)
    }, durationMs)
    return () => window.clearTimeout(timer)
  }, [isNew, reply.id, onFlyInComplete])

  return (
    <motion.li
      layout={!isNew}
      initial={isNew ? replyFlyIn.initial : false}
      animate={replyFlyIn.animate}
      exit={replyFlyIn.exit}
      transition={replyFlyIn.transition}
      className="list-none"
      style={{ paddingLeft }}
    >
      <div className="mt-2 rounded-xl border border-border/80 bg-card/60 p-2.5">
        <div className="mb-1.5 flex items-start gap-2">
          <UserAvatar
            name={reply.author.name}
            avatarUrl={reply.author.avatar}
            size="sm"
          />
          <div className="min-w-0 flex-1">
            <p className="truncate text-[12px] font-medium text-foreground">
              {reply.author.name}
            </p>
            <p className="text-[10px] text-muted-foreground">{reply.createdAt}</p>
          </div>
          {isOwn && (
            <button
              type="button"
              disabled={isDeleting}
              onClick={() => onDelete(reply.id)}
              className="rounded-full p-1 text-muted-foreground transition-smooth hover:bg-accent hover:text-destructive disabled:opacity-50"
              aria-label="Delete reply"
            >
              <Trash2 className="h-3 w-3" />
            </button>
          )}
        </div>
        <p className="whitespace-pre-wrap text-[13px] leading-relaxed text-foreground/90">
          {reply.content}
        </p>
        <button
          type="button"
          onClick={() =>
            onReply({ commentId: reply.commentId, parentReplyId: reply.id })
          }
          className="mt-2 text-[11px] font-medium text-primary transition-smooth hover:underline"
        >
          Reply
        </button>
      </div>

      {reply.children.length > 0 && (
        <ul className="space-y-0">
          {reply.children.map((child) => (
            <ReplyItem
              key={child.id}
              reply={child}
              depth={depth + 1}
              newReplyIds={newReplyIds}
              currentUserId={currentUserId}
              deletingReplyId={deletingReplyId}
              onDelete={onDelete}
              onReply={onReply}
              onFlyInComplete={onFlyInComplete}
            />
          ))}
        </ul>
      )}
    </motion.li>
  )
}

export const ReplyItem = memo(ReplyItemComponent)
