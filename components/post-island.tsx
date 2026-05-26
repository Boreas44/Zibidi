"use client"

import {
  Bookmark,
  ExternalLink,
  Heart,
  Loader2,
  ThumbsDown,
} from "lucide-react"
import type { BlogPost } from "@/components/blog-card"
import { UserAvatar } from "@/components/user-avatar"
import type { PostReactionKind } from "@/lib/post-reactions"
import { CategoryBadge } from "@/components/category-badge"
import { getCategoryFlag } from "@/lib/categories"
import { cn } from "@/lib/utils"

interface PostIslandProps {
  post: BlogPost
  onReaction: (reaction: PostReactionKind) => void
  onBookmark: () => void
  onOpenFullPost?: () => void
  isLoadingContent?: boolean
  className?: string
}

export function PostIsland({
  post,
  onReaction,
  onBookmark,
  onOpenFullPost,
  isLoadingContent = false,
  className,
}: PostIslandProps) {
  const body = post.content?.trim() || post.excerpt
  return (
    <div
      className={cn(
        "flex h-[min(85vh,680px)] w-full max-w-[440px] min-h-0 flex-col overflow-hidden",
        "rounded-[28px] border border-white/10 bg-card/95 shadow-[0_24px_80px_-16px_rgba(0,0,0,0.75)]",
        "ring-1 ring-white/[0.06] backdrop-blur-2xl",
        className
      )}
    >
      {post.coverImage?.trim() ? (
        <div className="relative h-36 shrink-0 overflow-hidden">
          <img src={post.coverImage} alt="" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-card via-card/20 to-transparent" />
          <CategoryBadge
            category={post.category}
            variant="pill"
            showName={false}
            className="absolute left-4 top-4"
          />
        </div>
      ) : (
        <div className="flex shrink-0 items-center justify-between border-b border-border/60 px-5 py-3">
          <CategoryBadge
            category={post.category}
            showName={!getCategoryFlag(post.category)}
          />
          {onOpenFullPost ? (
            <button
              type="button"
              onClick={onOpenFullPost}
              className="flex items-center gap-1 text-[12px] font-medium text-primary transition-smooth hover:text-primary/80"
            >
              Full post
              <ExternalLink className="h-3 w-3" />
            </button>
          ) : null}
        </div>
      )}

      <div className="flex min-h-0 flex-1 flex-col px-5 pb-5 pt-4">
        <div className="mb-3 flex items-center gap-2.5">
          <UserAvatar name={post.author.name} avatarUrl={post.author.avatar} size="sm" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-semibold text-foreground">{post.author.name}</p>
            <p className="text-[11px] text-muted-foreground">
              {post.createdAt} · {post.readTime}
            </p>
          </div>
          {post.coverImage?.trim() && onOpenFullPost ? (
            <button
              type="button"
              onClick={onOpenFullPost}
              className="shrink-0 rounded-full p-2 text-muted-foreground transition-smooth hover:bg-ios-fill hover:text-foreground"
              aria-label="Open full post"
            >
              <ExternalLink className="h-4 w-4" />
            </button>
          ) : null}
        </div>

        <h2 className="mb-3 text-[20px] font-bold leading-snug tracking-tight text-foreground">
          {post.title}
        </h2>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain touch-pan-y [-webkit-overflow-scrolling:touch]">
          {isLoadingContent ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <p className="whitespace-pre-wrap text-[15px] leading-relaxed text-foreground/85">
              {body}
            </p>
          )}
        </div>

        <div className="mt-4 flex items-center gap-4 border-t border-border/60 pt-4">
          <button
            type="button"
            onClick={() => onReaction("like")}
            className={`flex items-center gap-1.5 text-[13px] transition-smooth active:scale-95 ${
              post.isLiked ? "text-primary" : "text-muted-foreground hover:text-primary"
            }`}
            aria-pressed={post.isLiked}
          >
            <Heart className={`h-4 w-4 ${post.isLiked ? "fill-primary" : ""}`} />
            <span>{post.likes}</span>
          </button>
          <button
            type="button"
            onClick={() => onReaction("dislike")}
            className={`flex items-center gap-1.5 text-[13px] transition-smooth active:scale-95 ${
              post.isDisliked ? "text-dislike" : "text-muted-foreground hover:text-dislike"
            }`}
            aria-pressed={post.isDisliked}
          >
            <ThumbsDown
              className={`h-4 w-4 stroke-[2] ${
                post.isDisliked ? "fill-dislike stroke-black" : "fill-none stroke-current"
              }`}
            />
            <span>{post.dislikes}</span>
          </button>
          <span className="flex items-center gap-1.5 text-[13px] text-muted-foreground">
            <span className="font-medium text-foreground">{post.comments}</span>
            <span>comments</span>
          </span>
          <button
            type="button"
            onClick={onBookmark}
            className={`ml-auto transition-smooth ${
              post.isBookmarked ? "text-primary" : "text-muted-foreground hover:text-primary"
            }`}
          >
            <Bookmark className={`h-4 w-4 ${post.isBookmarked ? "fill-primary" : ""}`} />
            <span className="sr-only">Bookmark</span>
          </button>
        </div>
      </div>
    </div>
  )
}
