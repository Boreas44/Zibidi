"use client"

import { X } from "lucide-react"
import { Nickname } from "@/components/nickname"
import { Button } from "@/components/ui/button"
import { UserAvatar } from "@/components/user-avatar"
import { PostThreadSection } from "@/components/post-thread-section"
import type { BlogPost } from "@/components/blog-card"
import type { AppProfile } from "@/lib/auth/server"
import { cn } from "@/lib/utils"

interface PostCommentsPanelContentProps {
  post: BlogPost
  user: AppProfile | null
  active: boolean
  onOpenAuth: (mode?: "signin" | "signup") => void
  threadCount: number
  onThreadCountChange: (count: number) => void
  className?: string
  headerClassName?: string
  onClose?: () => void
}

export function PostCommentsPanelContent({
  post,
  user,
  active,
  onOpenAuth,
  threadCount,
  onThreadCountChange,
  className,
  headerClassName,
  onClose,
}: PostCommentsPanelContentProps) {
  return (
    <div className={cn("flex h-full min-h-0 flex-col", className)}>
      <div
        className={cn(
          "relative shrink-0 border-b border-border px-4 pb-4 pt-3 md:px-6",
          headerClassName
        )}
      >
        <div className="flex w-full items-start gap-3">
          {onClose ? (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-3 top-3 h-8 w-8 shrink-0 rounded-full md:right-5 md:top-4"
              onClick={onClose}
              aria-label="Close comments"
            >
              <X className="h-4 w-4" />
            </Button>
          ) : null}
          <UserAvatar
            name={post.author.name}
            avatarUrl={post.author.avatar}
            size="sm"
            className="mt-0.5 shrink-0"
          />
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <Nickname
              name={post.author.name}
              className="text-[13px] font-semibold leading-tight text-foreground"
            />
            <h2 className="m-0 line-clamp-2 p-0 text-left text-[16px] font-semibold leading-snug tracking-tight text-foreground">
              {post.title}
            </h2>
            <p className="m-0 pt-0.5 text-left text-[12px] leading-tight text-muted-foreground">
              {post.createdAt}
              <span className="text-muted-foreground/70"> · </span>
              {threadCount}{" "}
              {threadCount === 1 ? "comment" : "comments & replies"}
            </p>
          </div>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden px-4 py-4 md:px-6">
        <PostThreadSection
          post={post}
          user={user}
          active={active}
          onOpenAuth={onOpenAuth}
          onCountChange={onThreadCountChange}
          className="min-h-0 flex-1 overflow-y-auto"
        />
      </div>
    </div>
  )
}
