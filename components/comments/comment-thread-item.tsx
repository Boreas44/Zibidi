"use client"

import { memo, useMemo } from "react"
import { Loader2, Trash2 } from "lucide-react"
import { UserAvatar } from "@/components/user-avatar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ReplyList } from "@/components/comments/reply-list"
import type { PostComment } from "@/lib/comments"
import type { CommentReply } from "@/lib/replies-shared"
import { buildReplyTree } from "@/lib/replies-tree"

export type ReplyTarget = {
  commentId: string
  parentReplyId: string | null
}

interface CommentThreadItemProps {
  comment: PostComment
  replies: CommentReply[]
  newReplyIds: ReadonlySet<string>
  currentUserId?: string | null
  replyTarget: ReplyTarget | null
  replyDraft: string
  isSubmittingReply: boolean
  deletingCommentId: string | null
  deletingReplyId: string | null
  onReplyTarget: (target: ReplyTarget) => void
  onReplyDraftChange: (value: string) => void
  onSubmitReply: () => void
  onCancelReply: () => void
  onDeleteComment: (commentId: string) => void
  onDeleteReply: (replyId: string) => void
  onFlyInComplete: (replyId: string) => void
}

function CommentThreadItemComponent({
  comment,
  replies,
  newReplyIds,
  currentUserId,
  replyTarget,
  replyDraft,
  isSubmittingReply,
  deletingCommentId,
  deletingReplyId,
  onReplyTarget,
  onReplyDraftChange,
  onSubmitReply,
  onCancelReply,
  onDeleteComment,
  onDeleteReply,
  onFlyInComplete,
}: CommentThreadItemProps) {
  const isOwnComment = currentUserId === comment.userId
  const replyTree = useMemo(() => buildReplyTree(replies), [replies])
  const composerOpen = replyTarget?.commentId === comment.id

  return (
    <li className="rounded-2xl border border-border bg-ios-fill-secondary p-3">
      <div className="mb-2 flex items-start gap-2.5">
        <UserAvatar
          name={comment.author.name}
          avatarUrl={comment.author.avatar}
          size="sm"
        />
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] font-medium text-foreground">
            {comment.author.name}
          </p>
          <p className="text-[11px] text-muted-foreground">{comment.createdAt}</p>
        </div>
        {isOwnComment && (
          <button
            type="button"
            disabled={deletingCommentId === comment.id}
            onClick={() => onDeleteComment(comment.id)}
            className="rounded-full p-1.5 text-muted-foreground transition-smooth hover:bg-accent hover:text-destructive disabled:opacity-50"
            aria-label="Delete comment"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
      <p className="whitespace-pre-wrap text-[14px] leading-relaxed text-foreground/90">
        {comment.content}
      </p>
      <button
        type="button"
        onClick={() =>
          onReplyTarget({ commentId: comment.id, parentReplyId: null })
        }
        className="mt-2 text-[12px] font-medium text-primary transition-smooth hover:underline"
      >
        Reply
      </button>

      <ReplyList
        tree={replyTree}
        newReplyIds={newReplyIds}
        currentUserId={currentUserId}
        deletingReplyId={deletingReplyId}
        onDeleteReply={onDeleteReply}
        onReplyTo={onReplyTarget}
        onFlyInComplete={onFlyInComplete}
      />

      {composerOpen && (
        <div className="mt-3 space-y-2 rounded-xl border border-border/80 bg-card/80 p-2.5">
          <p className="text-[11px] text-muted-foreground">
            {replyTarget?.parentReplyId ? "Reply to thread" : "Reply to comment"}
          </p>
          <Textarea
            value={replyDraft}
            onChange={(e) => onReplyDraftChange(e.target.value)}
            placeholder="Write a reply…"
            rows={2}
            maxLength={2000}
            disabled={isSubmittingReply}
            className="min-h-[72px] resize-none rounded-xl border-0 bg-ios-fill px-3 py-2 text-[15px]"
            autoFocus
          />
          <div className="flex gap-2">
            <Button
              type="button"
              size="sm"
              className="flex-1"
              disabled={!replyDraft.trim() || isSubmittingReply}
              onClick={onSubmitReply}
            >
              {isSubmittingReply ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Posting…
                </>
              ) : (
                "Post reply"
              )}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ios"
              disabled={isSubmittingReply}
              onClick={onCancelReply}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </li>
  )
}

export const CommentThreadItem = memo(CommentThreadItemComponent)
