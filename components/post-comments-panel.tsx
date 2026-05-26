"use client"

import { useCallback, useEffect, useState } from "react"
import { Loader2, Send, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { useIsMobile } from "@/hooks/use-mobile"
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { UserAvatar } from "@/components/user-avatar"
import type { BlogPost } from "@/components/blog-card"
import type { PostComment } from "@/lib/comments"
import {
  createCommentAction,
  deleteCommentAction,
  fetchCommentsAction,
} from "@/app/actions/comments"
import type { AppProfile } from "@/lib/auth/server"

interface PostCommentsPanelProps {
  post: BlogPost | null
  isOpen: boolean
  onClose: () => void
  user: AppProfile | null
  onOpenAuth: (mode?: "signin" | "signup") => void
  onCommentCountChange?: (postId: string, count: number) => void
}

export function PostCommentsPanel({
  post,
  isOpen,
  onClose,
  user,
  onOpenAuth,
  onCommentCountChange,
}: PostCommentsPanelProps) {
  const isMobile = useIsMobile()
  const [comments, setComments] = useState<PostComment[]>([])
  const [draft, setDraft] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const loadComments = useCallback(async () => {
    if (!post) return
    setIsLoading(true)
    try {
      const result = await fetchCommentsAction(post.id)
      if (result.success) {
        setComments(result.data)
        onCommentCountChange?.(post.id, result.data.length)
      } else {
        toast.error(result.error)
      }
    } catch {
      toast.error("Could not load comments.")
    } finally {
      setIsLoading(false)
    }
  }, [post, onCommentCountChange])

  useEffect(() => {
    if (isOpen && post) {
      setDraft("")
      void loadComments()
    }
    if (!isOpen) {
      setComments([])
      setDraft("")
    }
  }, [isOpen, post, loadComments])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!post || !draft.trim() || isSubmitting) return

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
        setComments((prev) => {
          const next = [...prev, result.data]
          onCommentCountChange?.(post.id, next.length)
          return next
        })
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

  const handleDelete = async (commentId: string) => {
    if (!post) return
    setDeletingId(commentId)
    try {
      const result = await deleteCommentAction(commentId)
      if (result.success) {
        setComments((prev) => {
          const next = prev.filter((c) => c.id !== commentId)
          onCommentCountChange?.(post.id, next.length)
          return next
        })
        toast.success("Comment deleted")
      } else {
        toast.error(result.error)
      }
    } catch {
      toast.error("Could not delete comment.")
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <Drawer
      open={isOpen}
      onOpenChange={(open) => !open && onClose()}
      direction={isMobile ? "bottom" : "right"}
    >
      <DrawerContent className="flex max-h-[92vh] flex-col bg-card md:max-h-none md:h-full md:max-w-md">
        <DrawerHeader className="border-b border-border text-left">
          <DrawerTitle className="line-clamp-2 text-[20px] font-semibold">
            {post?.title ?? "Comments"}
          </DrawerTitle>
          <DrawerDescription className="text-[13px]">
            {comments.length} {comments.length === 1 ? "comment" : "comments"}
          </DrawerDescription>
        </DrawerHeader>

        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto px-4 py-4 md:px-6">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
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
                {comments.map((comment) => {
                  const isOwn = user?.id === comment.userId
                  return (
                    <li
                      key={comment.id}
                      className="rounded-2xl border border-border bg-ios-fill-secondary p-3"
                    >
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
                          <p className="text-[11px] text-muted-foreground">
                            {comment.createdAt}
                          </p>
                        </div>
                        {isOwn && (
                          <button
                            type="button"
                            disabled={deletingId === comment.id}
                            onClick={() => void handleDelete(comment.id)}
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
                    </li>
                  )
                })}
              </ul>
            )}
          </div>

          <DrawerFooter className="border-t border-border bg-card px-4 pb-6 pt-4 md:px-6">
            <form onSubmit={handleSubmit} className="w-full space-y-3">
              <Textarea
                variant="ios"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder={
                  user ? "Write a comment…" : "Sign in to write a comment"
                }
                disabled={!user || isSubmitting}
                rows={3}
                maxLength={2000}
                className="min-h-[88px] resize-none"
              />
              <Button
                type="submit"
                className="w-full"
                disabled={!user || !draft.trim() || isSubmitting}
              >
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
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
