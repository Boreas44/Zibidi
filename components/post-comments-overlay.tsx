"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import type { BlogPost } from "@/components/blog-card"
import { PostIsland } from "@/components/post-island"
import { PostCommentsPanel } from "@/components/post-comments-panel"
import { fetchPostByIdAction } from "@/app/actions/posts"
import { togglePostReactionAction } from "@/app/actions/reactions"
import { toggleSavedPostAction } from "@/app/actions/saved-posts"
import type { PostReactionKind } from "@/lib/post-reactions"
import {
  computeOptimisticReaction,
  snapshotFromPost,
} from "@/lib/reaction-optimistic"
import type { AppProfile } from "@/lib/auth/server"

interface PostCommentsOverlayProps {
  post: BlogPost | null
  isOpen: boolean
  onClose: () => void
  user: AppProfile | null
  onOpenAuth: (mode?: "signin" | "signup") => void
  onPostChange: (post: BlogPost) => void
  onCommentCountChange?: (postId: string, count: number) => void
}

export function PostCommentsOverlay({
  post,
  isOpen,
  onClose,
  user,
  onOpenAuth,
  onPostChange,
  onCommentCountChange,
}: PostCommentsOverlayProps) {
  const router = useRouter()
  const [islandPost, setIslandPost] = useState<BlogPost | null>(null)
  const [isLoadingContent, setIsLoadingContent] = useState(false)
  const reactionRequestSeq = useRef(0)
  const onPostChangeRef = useRef(onPostChange)
  const activePostIdRef = useRef<string | null>(null)
  onPostChangeRef.current = onPostChange

  useEffect(() => {
    if (!isOpen || !post) {
      if (!isOpen) {
        setIslandPost(null)
        activePostIdRef.current = null
      }
      return
    }

    if (activePostIdRef.current !== post.id) {
      activePostIdRef.current = post.id
      setIslandPost(post)
    } else {
      setIslandPost((prev) => {
        if (!prev || prev.id !== post.id) return post
        if (
          prev.comments === post.comments &&
          prev.likes === post.likes &&
          prev.dislikes === post.dislikes &&
          prev.isLiked === post.isLiked &&
          prev.isDisliked === post.isDisliked &&
          prev.isBookmarked === post.isBookmarked
        ) {
          return prev
        }
        return {
          ...prev,
          comments: post.comments,
          likes: post.likes,
          dislikes: post.dislikes,
          isLiked: post.isLiked,
          isDisliked: post.isDisliked,
          isBookmarked: post.isBookmarked,
          author: post.author,
        }
      })
    }
  }, [isOpen, post])

  useEffect(() => {
    if (!isOpen || !post?.id || post.content?.trim()) return

    let cancelled = false
    setIsLoadingContent(true)
    void (async () => {
      const result = await fetchPostByIdAction(post.id)
      if (cancelled) return
      setIsLoadingContent(false)
      if (result.success) {
        setIslandPost(result.post)
        onPostChangeRef.current(result.post)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [isOpen, post?.id, post?.content])

  useEffect(() => {
    if (!isOpen) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [isOpen, onClose])

  useEffect(() => {
    if (!isOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = prev
    }
  }, [isOpen])

  const syncPost = useCallback((next: BlogPost) => {
    setIslandPost(next)
    onPostChangeRef.current(next)
  }, [])

  const handleReaction = (reaction: PostReactionKind) => {
    if (!islandPost) return
    if (!user) {
      toast.error("Sign in to react to posts")
      onOpenAuth("signin")
      return
    }

    const current = islandPost
    const rollback = snapshotFromPost(current)
    const optimistic = computeOptimisticReaction(current, reaction)
    syncPost({
      ...current,
      likes: optimistic.likes,
      dislikes: optimistic.dislikes,
      isLiked: optimistic.userReaction === "like",
      isDisliked: optimistic.userReaction === "dislike",
    })

    const seq = ++reactionRequestSeq.current
    void (async () => {
      try {
        const result = await togglePostReactionAction({
          postId: current.id,
          reaction,
        })
        if (reactionRequestSeq.current !== seq) return
        if (result.success) {
          syncPost({
            ...current,
            likes: result.state.likes,
            dislikes: result.state.dislikes,
            isLiked: result.state.userReaction === "like",
            isDisliked: result.state.userReaction === "dislike",
          })
        } else {
          syncPost({
            ...current,
            likes: rollback.likes,
            dislikes: rollback.dislikes,
            isLiked: rollback.isLiked,
            isDisliked: rollback.isDisliked,
          })
          toast.error(result.error)
        }
      } catch {
        if (reactionRequestSeq.current !== seq) return
        syncPost({
          ...current,
          likes: rollback.likes,
          dislikes: rollback.dislikes,
          isLiked: rollback.isLiked,
          isDisliked: rollback.isDisliked,
        })
        toast.error("Could not update reaction.")
      }
    })()
  }

  const handleBookmark = () => {
    if (!islandPost) return
    if (!user) {
      toast.error("Sign in to save posts")
      onOpenAuth("signin")
      return
    }

    const previous = islandPost.isBookmarked
    const optimistic = !previous
    syncPost({ ...islandPost, isBookmarked: optimistic })

    void (async () => {
      try {
        const result = await toggleSavedPostAction({ postId: islandPost.id })
        if (!result.success) {
          syncPost({ ...islandPost, isBookmarked: previous })
          toast.error(result.error)
          return
        }
        syncPost({ ...islandPost, isBookmarked: result.saved })
        toast.success(result.saved ? "Post saved to Library" : "Removed from Library")
      } catch {
        syncPost({ ...islandPost, isBookmarked: previous })
        toast.error("Could not update saved post.")
      }
    })()
  }

  if (!isOpen || !post || !islandPost) return null

  return (
    <>
      <div
        className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-md"
        role="presentation"
        aria-hidden
      >
        <button
          type="button"
          className="absolute inset-0"
          onClick={onClose}
          aria-label="Close"
        />
      </div>

      <div
        className="fixed inset-0 z-[110] hidden items-center justify-center overflow-hidden p-4 md:flex md:justify-center md:pr-[min(420px,42vw)] md:pl-8"
        role="dialog"
        aria-modal
        aria-label="Post preview"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose()
        }}
      >
        <div
          className="max-h-full animate-in fade-in zoom-in-95 duration-200"
          onClick={(e) => e.stopPropagation()}
          onKeyDown={(e) => e.stopPropagation()}
        >
          <PostIsland
            post={islandPost}
            onReaction={handleReaction}
            onBookmark={handleBookmark}
            onOpenFullPost={() => {
              onClose()
              router.push(`/post/${islandPost.id}`)
            }}
            isLoadingContent={isLoadingContent}
          />
        </div>
      </div>

      <PostCommentsPanel
        post={islandPost}
        isOpen={isOpen}
        onClose={onClose}
        user={user}
        onOpenAuth={onOpenAuth}
        onCommentCountChange={onCommentCountChange}
        elevated
      />
    </>
  )
}
