"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, Loader2, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { BlogPost } from "@/components/blog-card"
import { PostArticle } from "@/components/post-article"
import { PostThreadSection } from "@/components/post-thread-section"
import { AuthPanel } from "@/components/auth-panel"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { togglePostReactionAction } from "@/app/actions/reactions"
import { deletePostAction } from "@/app/actions/posts"
import type { PostReactionKind } from "@/lib/post-reactions"
import {
  computeOptimisticReaction,
  snapshotFromPost,
} from "@/lib/reaction-optimistic"
import type { AppProfile } from "@/lib/auth/server"

interface PostDetailPageProps {
  initialPost: BlogPost
  user: AppProfile | null
}

export function PostDetailPage({ initialPost, user }: PostDetailPageProps) {
  const router = useRouter()
  const [post, setPost] = useState(initialPost)
  const [isAuthOpen, setIsAuthOpen] = useState(false)
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin")
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const reactionRequestSeq = useRef(0)

  const isOwner = !!user?.id && post.userId === user.id

  useEffect(() => {
    setPost(initialPost)
  }, [initialPost])

  useEffect(() => {
    if (!user) return
    if (post.userId !== user.id) return
    setPost((prev) => ({
      ...prev,
      author: {
        name: user.displayName,
        avatar: user.avatarUrl ?? "",
      },
    }))
  }, [user?.id, user?.displayName, user?.avatarUrl, post.userId])

  const openAuth = (mode: "signin" | "signup" = "signin") => {
    setAuthMode(mode)
    setIsAuthOpen(true)
  }

  const handleCommentCountChange = useCallback((count: number) => {
    setPost((prev) => ({ ...prev, comments: count }))
  }, [])

  const handleReaction = (reaction: PostReactionKind) => {
    if (!user) {
      toast.error("Sign in to react to posts")
      openAuth("signin")
      return
    }

    const rollback = snapshotFromPost(post)
    const next = computeOptimisticReaction(post, reaction)
    setPost((prev) => ({
      ...prev,
      likes: next.likes,
      dislikes: next.dislikes,
      isLiked: next.userReaction === "like",
      isDisliked: next.userReaction === "dislike",
    }))

    const seq = ++reactionRequestSeq.current

    void (async () => {
      try {
        const result = await togglePostReactionAction({ postId: post.id, reaction })
        if (reactionRequestSeq.current !== seq) return

        if (result.success) {
          setPost((prev) => ({
            ...prev,
            likes: result.state.likes,
            dislikes: result.state.dislikes,
            isLiked: result.state.userReaction === "like",
            isDisliked: result.state.userReaction === "dislike",
          }))
        } else {
          setPost((prev) => ({
            ...prev,
            likes: rollback.likes,
            dislikes: rollback.dislikes,
            isLiked: rollback.isLiked,
            isDisliked: rollback.isDisliked,
          }))
          toast.error(result.error)
        }
      } catch {
        if (reactionRequestSeq.current !== seq) return
        setPost((prev) => ({
          ...prev,
          likes: rollback.likes,
          dislikes: rollback.dislikes,
          isLiked: rollback.isLiked,
          isDisliked: rollback.isDisliked,
        }))
        toast.error("Could not update reaction.")
      }
    })()
  }

  const handleBookmark = () => {
    if (!user) {
      toast.error("Sign in to save posts")
      openAuth("signin")
      return
    }
    setPost((prev) => ({ ...prev, isBookmarked: !prev.isBookmarked }))
  }

  const handleDelete = async () => {
    if (!user) {
      toast.error("Sign in to delete a post")
      openAuth("signin")
      return
    }
    setIsDeleting(true)
    try {
      const result = await deletePostAction(post.id)
      if (result.success) {
        toast.success("Post deleted")
        router.push("/")
        router.refresh()
      } else {
        toast.error(result.error)
      }
    } catch {
      toast.error("Could not delete post.")
    } finally {
      setIsDeleting(false)
      setConfirmDeleteOpen(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-20 border-b border-border/80 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-3 md:px-8">
          <Button variant="ghost" size="icon" className="shrink-0 rounded-full" asChild>
            <Link href="/" aria-label="Back to home">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <span className="truncate text-[15px] font-semibold text-foreground">Post</span>
          {isOwner && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="ml-auto shrink-0 rounded-full text-destructive hover:text-destructive"
              onClick={() => setConfirmDeleteOpen(true)}
              disabled={isDeleting}
              aria-label="Delete post"
            >
              <Trash2 className="h-5 w-5" />
            </Button>
          )}
        </div>
      </header>

      <main className="ambient-gradient pb-16">
        <div className="mx-auto max-w-3xl">
          <div className="px-4 md:px-8">
            <PostArticle
              post={post}
              onReaction={handleReaction}
              onBookmark={handleBookmark}
              commentsHref="#comments"
            />
          </div>

          <div className="mt-12 px-4 md:px-8" id="comments">
            <h2 className="mb-6 text-[20px] font-bold text-foreground">Comments</h2>
            <PostThreadSection
              post={post}
              user={user}
              active
              onOpenAuth={openAuth}
              onCountChange={handleCommentCountChange}
            />
          </div>
        </div>
      </main>

      <AuthPanel
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        defaultMode={authMode}
      />

      <AlertDialog open={confirmDeleteOpen} onOpenChange={setConfirmDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this post?</AlertDialogTitle>
            <AlertDialogDescription>
              &ldquo;{post.title}&rdquo; will be permanently removed. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={(e) => {
                e.preventDefault()
                void handleDelete()
              }}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Deleting…
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
