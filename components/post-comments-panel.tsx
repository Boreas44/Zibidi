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
    if (isMobile) {
      return (
        <div
          className={cn(
            "fixed inset-x-0 bottom-0 z-[120] flex max-h-[92vh] flex-col",
            "rounded-t-3xl border-t border-border bg-card shadow-2xl",
            "animate-in slide-in-from-bottom duration-300"
          )}
          role="dialog"
          aria-label="Comments"
        >
          <div className="mx-auto mt-3 h-1 w-9 shrink-0 rounded-full bg-ios-separator" />
          {panelContent}
        </div>
      )
    }

    return (
      <div
        className={cn(
          "fixed inset-y-0 right-0 z-[120] flex w-full max-w-md flex-col",
          "border-l border-border bg-card shadow-2xl",
          "animate-in slide-in-from-right duration-300"
        )}
        role="dialog"
        aria-label="Comments"
      >
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
      <DrawerContent className="flex max-h-[92vh] flex-col bg-card md:max-h-none md:h-full md:max-w-md">
        <DrawerHeader className="sr-only">
          <DrawerTitle>Comments</DrawerTitle>
          <DrawerDescription>Post comments and replies</DrawerDescription>
        </DrawerHeader>
        {panelContent}
      </DrawerContent>
    </Drawer>
  )
}
