"use client"

import {
  Bookmark,
  Heart,
  MessageCircle,
  ThumbsDown,
} from "lucide-react"
import type { BlogPost } from "@/components/blog-card"
import { CategoryBadge } from "@/components/category-badge"
import { getCategoryFlag } from "@/lib/categories"
import { UserAvatar } from "@/components/user-avatar"
import type { PostReactionKind } from "@/lib/post-reactions"

interface PostArticleProps {
  post: BlogPost
  onReaction: (reaction: PostReactionKind) => void
  onBookmark: () => void
  onCommentsAction?: () => void
  commentsHref?: string
  commentsDisplay?: "link" | "action" | "static"
  compact?: boolean
}

export function PostArticle({
  post,
  onReaction,
  onBookmark,
  onCommentsAction,
  commentsHref,
  commentsDisplay = "link",
  compact = false,
}: PostArticleProps) {
  const body = post.content?.trim() || post.excerpt
  const commentsControl =
    commentsDisplay === "static" ? (
      <span className="flex items-center gap-2 text-[15px] text-muted-foreground">
        <MessageCircle className="h-5 w-5" />
        <span>{post.comments}</span>
      </span>
    ) : commentsDisplay === "action" && onCommentsAction != null ? (
      <button
        type="button"
        onClick={onCommentsAction}
        className="flex items-center gap-2 text-[15px] text-muted-foreground transition-smooth hover:text-foreground"
      >
        <MessageCircle className="h-5 w-5" />
        <span>{post.comments}</span>
      </button>
    ) : (
      <a
        href={commentsHref ?? "#comments"}
        className="flex items-center gap-2 text-[15px] text-muted-foreground transition-smooth hover:text-foreground"
      >
        <MessageCircle className="h-5 w-5" />
        <span>{post.comments}</span>
      </a>
    )

  return (
    <article className={compact ? "px-4 py-6 md:px-8" : ""}>
      <div className="mb-6 flex items-center gap-3">
        <UserAvatar name={post.author.name} avatarUrl={post.author.avatar} size="md" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-[15px] font-semibold text-foreground">{post.author.name}</p>
          <p className="text-[13px] text-muted-foreground">
            {post.createdAt} · {post.readTime}
          </p>
        </div>
        <CategoryBadge
          category={post.category}
          showName={!getCategoryFlag(post.category)}
          className="shrink-0 rounded-full bg-ios-fill px-3 py-1"
        />
      </div>

      <h1
        className={
          compact
            ? "text-[24px] font-bold leading-tight tracking-tight text-foreground md:text-[28px]"
            : "text-[28px] font-bold leading-tight tracking-tight text-foreground md:text-[34px]"
        }
      >
        {post.title}
      </h1>

      {post.coverImage?.trim() ? (
        <div className="mt-6 overflow-hidden rounded-2xl border border-border">
          <img src={post.coverImage} alt="" className="aspect-[16/10] w-full object-cover" />
        </div>
      ) : null}

      <div className="prose prose-invert mt-8 max-w-none">
        <p className="whitespace-pre-wrap text-[17px] leading-relaxed text-foreground/90">{body}</p>
      </div>

      <div className="mt-10 flex flex-wrap items-center gap-5 border-t border-border pt-6">
        <button
          type="button"
          onClick={() => onReaction("like")}
          className={`flex items-center gap-2 text-[15px] transition-smooth active:scale-95 ${
            post.isLiked ? "text-primary" : "text-muted-foreground hover:text-primary"
          }`}
          aria-pressed={post.isLiked}
        >
          <Heart className={`h-5 w-5 ${post.isLiked ? "fill-primary" : ""}`} />
          <span>{post.likes}</span>
        </button>
        <button
          type="button"
          onClick={() => onReaction("dislike")}
          className={`flex items-center gap-2 text-[15px] transition-smooth active:scale-95 ${
            post.isDisliked ? "text-dislike" : "text-muted-foreground hover:text-dislike"
          }`}
          aria-pressed={post.isDisliked}
        >
          <ThumbsDown
            className={`h-5 w-5 stroke-[2] ${
              post.isDisliked ? "fill-dislike stroke-black" : "fill-none stroke-current"
            }`}
          />
          <span>{post.dislikes}</span>
        </button>
        {commentsControl}
        <button
          type="button"
          onClick={onBookmark}
          className={`ml-auto transition-smooth ${
            post.isBookmarked ? "text-primary" : "text-muted-foreground hover:text-primary"
          }`}
        >
          <Bookmark className={`h-5 w-5 ${post.isBookmarked ? "fill-primary" : ""}`} />
          <span className="sr-only">Bookmark</span>
        </button>
      </div>
    </article>
  )
}
