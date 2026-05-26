"use client"

import { useEffect, useRef, useState } from "react"
import { useIsMobile } from "@/hooks/use-mobile"
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import { PostCommentsPanelContent } from "@/components/post-comments-panel-content"
import type { BlogPost } from "@/components/blog-card"
import type { AppProfile } from "@/lib/auth/server"
import { cn } from "@/lib/utils"

interface PostCommentsPanelProps {
  post: BlogPost | null
  isOpen: boolean
  onClose: () => void
  user: AppProfile | null
  onOpenAuth: (mode?: "signin" | "signup") => void
  onCommentCountChange?: (postId: string, count: number) => void
  elevated?: boolean
}

export function PostCommentsPanel({
  post,
  isOpen,
  onClose,
  user,
  onOpenAuth,
  onCommentCountChange,
  elevated = false,
}: PostCommentsPanelProps) {
  const isMobile = useIsMobile()
  const [threadCount, setThreadCount] = useState(0)
  const lastReportedCount = useRef<number | null>(null)
  const onCommentCountChangeRef = useRef(onCommentCountChange)
  onCommentCountChangeRef.current = onCommentCountChange

  useEffect(() => {
    setThreadCount(0)
    lastReportedCount.current = null
  }, [post?.id])

  useEffect(() => {
    if (!isOpen || !post) {
      lastReportedCount.current = null
      return
    }
    if (lastReportedCount.current === threadCount) return
    lastReportedCount.current = threadCount
    onCommentCountChangeRef.current?.(post.id, threadCount)
  }, [isOpen, post?.id, threadCount])

  if (!post || !isOpen) return null

  const panelContent = (
    <PostCommentsPanelContent
      post={post}
      user={user}
      active={isOpen}
      onOpenAuth={onOpenAuth}
      threadCount={threadCount}
      onThreadCountChange={setThreadCount}
      onClose={elevated ? onClose : undefined}
      className="min-h-0 flex-1"
    />
  )

  if (elevated) {
    return (
      <div
        className={cn(
          "comments-sheet fixed z-[120] flex flex-col bg-card shadow-2xl",
          "inset-0 h-[100dvh] max-h-[100dvh] overscroll-none",
          "animate-in slide-in-from-bottom duration-300",
          "md:inset-y-0 md:right-0 md:left-auto md:h-full md:max-h-none md:w-full md:max-w-md",
          "md:animate-in md:slide-in-from-right md:duration-300",
          "md:rounded-none md:border-l md:border-t-0 border-border",
          "max-md:border-t max-md:border-border max-md:pt-[env(safe-area-inset-top,0px)]"
        )}
        role="dialog"
        aria-modal
        aria-label="Comments"
      >
        <div
          className="mx-auto mt-2 h-1 w-10 shrink-0 rounded-full bg-ios-separator md:hidden"
          aria-hidden
        />
        {panelContent}
      </div>
    )
  }

  return (
    <Drawer
      open={isOpen}
      onOpenChange={(open) => !open && onClose()}
      direction={isMobile ? "bottom" : "right"}
    >
      <DrawerContent className="comments-sheet flex h-[100dvh] max-h-[100dvh] flex-col bg-card md:h-full md:max-h-none md:max-w-md">
        <DrawerHeader className="sr-only">
          <DrawerTitle>Comments</DrawerTitle>
          <DrawerDescription>Post comments and replies</DrawerDescription>
        </DrawerHeader>
        {panelContent}
      </DrawerContent>
    </Drawer>
  )
}
