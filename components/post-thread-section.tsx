"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Loader2, Send } from "lucide-react"
import { toast } from "sonner"
import { usePostRepliesRealtime } from "@/hooks/use-post-replies-realtime"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  CommentThreadItem,
  type ReplyTarget,
} from "@/components/comments/comment-thread-item"
import type { BlogPost } from "@/components/blog-card"
import type { PostComment } from "@/lib/comments"
import type { CommentReply } from "@/lib/replies-shared"
import { countRepliesInMap, groupRepliesByCommentId } from "@/lib/replies-tree"
import {
  createCommentAction,
  deleteCommentAction,
  fetchCommentsAction,
} from "@/app/actions/comments"
import {
  createReplyAction,
  deleteReplyAction,
  fetchRepliesAction,
} from "@/app/actions/replies"
import type { AppProfile } from "@/lib/auth/server"
import { cn } from "@/lib/utils"

interface PostThreadSectionProps {
  post: BlogPost
  user: AppProfile | null
  active: boolean
  onOpenAuth: (mode?: "signin" | "signup") => void
  onCountChange?: (count: number) => void
  className?: string
  id?: string
}

export function PostThreadSection({
  post,
  user,
  active,
  onOpenAuth,
  onCountChange,
  className,
  id = "comments",
}: PostThreadSectionProps) {
  const postId = post.id
  const [comments, setComments] = useState<PostComment[]>([])
  const [repliesByComment, setRepliesByComment] = useState<
    Record<string, CommentReply[]>
  >({})
  const [draft, setDraft] = useState("")
  const [replyTarget, setReplyTarget] = useState<ReplyTarget | null>(null)
  const [replyDraft, setReplyDraft] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmittingReply, setIsSubmittingReply] = useState(false)
  const [deletingCommentId, setDeletingCommentId] = useState<string | null>(null)
  const [deletingReplyId, setDeletingReplyId] = useState<string | null>(null)
  const [newReplyIds, setNewReplyIds] = useState<Set<string>>(() => new Set())

  const onCountChangeRef = useRef(onCountChange)
  onCountChangeRef.current = onCountChange

  const totalThreadCount = useMemo(
    () => comments.length + countRepliesInMap(repliesByComment),
    [comments, repliesByComment]
  )

  useEffect(() => {
    if (!active || !postId) return
    onCountChangeRef.current?.(totalThreadCount)
  }, [active, postId, totalThreadCount])

  const markReplyFlyIn = useCallback((replyId: string) => {
    setNewReplyIds((prev) => new Set(prev).add(replyId))
  }, [])

  const clearReplyFlyIn = useCallback((replyId: string) => {
    setNewReplyIds((prev) => {
      const next = new Set(prev)
      next.delete(replyId)
      return next
    })
  }, [])

  const injectReply = useCallback(
    (reply: CommentReply) => {
      markReplyFlyIn(reply.id)
      setRepliesByComment((prev) => {
        const list = prev[reply.commentId] ?? []
        if (list.some((r) => r.id === reply.id)) return prev
        return { ...prev, [reply.commentId]: [...list, reply] }
      })
    },
    [markReplyFlyIn]
  )

  usePostRepliesRealtime({
    postId,
    enabled: active && Boolean(postId),
    currentUserId: user?.id,
    onInsert: injectReply,
  })

  const loadThread = useCallback(async () => {
    if (!postId) return
    setIsLoading(true)
    setLoadError(null)
    try {
      const [commentsResult, repliesResult] = await Promise.all([
        fetchCommentsAction(postId),
        fetchRepliesAction(postId),
      ])

      if (!commentsResult.success) {
        setLoadError(commentsResult.error)
        toast.error(commentsResult.error)
        return
      }

      const grouped = repliesResult.success
        ? groupRepliesByCommentId(repliesResult.data)
        : {}

      if (!repliesResult.success && repliesResult.error) {
        toast.error(repliesResult.error)
      }

      setComments(commentsResult.data)
      setRepliesByComment(grouped)
      setNewReplyIds(new Set())
    } catch {
      const message = "Could not load comments."
      setLoadError(message)
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }, [postId])

  useEffect(() => {
    if (active && postId) {
      setDraft("")
      setReplyTarget(null)
      setReplyDraft("")
      void loadThread()
    }
    if (!active) {
      setComments([])
      setRepliesByComment({})
      setNewReplyIds(new Set())
      setDraft("")
      setReplyTarget(null)
      setReplyDraft("")
      setLoadError(null)
    }
  }, [active, postId, loadThread])

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!draft.trim() || isSubmitting) return

    if (!user) {
      toast.error("Sign in to comment")
      onOpenAuth("signin")
      return
    }

    setIsSubmitting(true)
    try {
      const result = await createCommentAction({
        postId: post.id,
        content: draft,
      })
      if (result.success) {
        setComments((prev) => [...prev, result.data])
        setDraft("")
        toast.success("Comment posted")
      } else {
        toast.error(result.error)
      }
    } catch {
      toast.error("Could not post comment.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSubmitReply = async () => {
    if (!replyTarget || !replyDraft.trim() || isSubmittingReply) return

    if (!user) {
      toast.error("Sign in to reply")
      onOpenAuth("signin")
      return
    }

    setIsSubmittingReply(true)
    try {
      const result = await createReplyAction({
        postId: post.id,
        commentId: replyTarget.commentId,
        parentReplyId: replyTarget.parentReplyId,
        content: replyDraft,
      })
      if (result.success) {
        injectReply(result.data)
        setReplyDraft("")
        setReplyTarget(null)
        toast.success("Reply posted")
      } else {
        toast.error(result.error)
      }
    } catch {
      toast.error("Could not post reply.")
    } finally {
      setIsSubmittingReply(false)
    }
  }

  const handleDeleteComment = async (commentId: string) => {
    setDeletingCommentId(commentId)
    try {
      const result = await deleteCommentAction(commentId)
      if (result.success) {
        const nextReplies = { ...repliesByComment }
        delete nextReplies[commentId]
        setComments((prev) => prev.filter((c) => c.id !== commentId))
        setRepliesByComment(nextReplies)
        toast.success("Comment deleted")
      } else {
        toast.error(result.error)
      }
    } catch {
      toast.error("Could not delete comment.")
    } finally {
      setDeletingCommentId(null)
    }
  }

  const handleDeleteReply = async (replyId: string) => {
    setDeletingReplyId(replyId)
    try {
      const result = await deleteReplyAction(replyId)
      if (result.success) {
        setRepliesByComment((prev) => {
          const next: Record<string, CommentReply[]> = {}
          for (const [commentId, list] of Object.entries(prev)) {
            const filtered = list.filter((r) => r.id !== replyId)
            if (filtered.length > 0) {
              next[commentId] = filtered
            }
          }
          return next
        })
        toast.success("Reply deleted")
      } else {
        toast.error(result.error)
      }
    } catch {
      toast.error("Could not delete reply.")
    } finally {
      setDeletingReplyId(null)
    }
  }

  return (
    <section id={id} className={cn("flex flex-col", className)}>
      <div className="flex-1">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : loadError ? (
          <div className="rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-6 text-center">
            <p className="text-[15px] font-medium text-foreground">Could not load comments</p>
            <p className="mt-2 text-[13px] text-muted-foreground">{loadError}</p>
            <Button type="button" variant="outline" className="mt-4" onClick={() => void loadThread()}>
              Try again
            </Button>
          </div>
        ) : comments.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-ios-fill-secondary px-4 py-10 text-center">
            <p className="text-[15px] font-medium text-foreground">No comments yet</p>
            <p className="mt-1 text-[13px] text-muted-foreground">
              Be the first to share your thoughts.
            </p>
          </div>
        ) : (
          <ul className="space-y-4">
            {comments.map((comment) => (
              <CommentThreadItem
                key={comment.id}
                comment={comment}
                replies={repliesByComment[comment.id] ?? []}
                newReplyIds={newReplyIds}
                currentUserId={user?.id}
                replyTarget={replyTarget}
                replyDraft={replyDraft}
                isSubmittingReply={isSubmittingReply}
                deletingCommentId={deletingCommentId}
                deletingReplyId={deletingReplyId}
                onReplyTarget={(target) => {
                  setReplyTarget(target)
                  setReplyDraft("")
                }}
                onReplyDraftChange={setReplyDraft}
                onSubmitReply={() => void handleSubmitReply()}
                onCancelReply={() => {
                  setReplyTarget(null)
                  setReplyDraft("")
                }}
                onDeleteComment={(cid) => void handleDeleteComment(cid)}
                onDeleteReply={(rid) => void handleDeleteReply(rid)}
                onFlyInComplete={clearReplyFlyIn}
              />
            ))}
          </ul>
        )}
      </div>

      <form
        onSubmit={handleSubmitComment}
        className="mt-6 space-y-3 border-t border-border pt-4"
      >
        <Textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={user ? "Write a comment…" : "Sign in to write a comment"}
          disabled={!user || isSubmitting || isLoading}
          rows={3}
          maxLength={2000}
          className="min-h-[88px] resize-none rounded-2xl border-0 bg-ios-fill px-4 py-3 text-[17px] text-foreground placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-primary/40"
        />
        <Button type="submit" className="w-full" disabled={!user || !draft.trim() || isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Posting…
            </>
          ) : (
            <>
              <Send className="h-4 w-4" />
              Post comment
            </>
          )}
        </Button>
      </form>
    </section>
  )
}

export function usePostThreadCountLabel(count: number) {
  return count === 1 ? "1 comment" : `${count} comments & replies`
}
