"use client"

import { Heart, MessageCircle, Bookmark, MoreHorizontal } from "lucide-react"
import { useState } from "react"
import { UserAvatar } from "@/components/user-avatar"
import { hasAvatarUrl } from "@/lib/avatar"

export interface BlogPost {
  id: string
  title: string
  excerpt: string
  author: {
    name: string
    avatar: string
  }
  coverImage: string
  category: string
  readTime: string
  likes: number
  comments: number
  createdAt: string
  isLiked?: boolean
  isBookmarked?: boolean
}

interface BlogCardProps {
  post: BlogPost
  onLike?: (id: string) => void
  onBookmark?: (id: string) => void
}

export function BlogCard({ post, onLike, onBookmark }: BlogCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <article
      className="group relative overflow-hidden rounded-2xl border border-border bg-card card-hover cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Cover Image */}
      <div className="relative aspect-[16/10] overflow-hidden bg-ios-fill-secondary">
        {post.coverImage?.trim() ? (
          <img
            src={post.coverImage}
            alt={post.title}
            className={`h-full w-full object-cover transition-transform duration-500 ${
              isHovered ? "scale-[1.06]" : "scale-100"
            }`}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/20 via-background to-primary/10">
            <span className="text-[13px] font-medium text-muted-foreground">
              {post.category}
            </span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {/* Category Badge */}
        <div className="absolute left-3 top-3">
          <span className="rounded-full bg-black/50 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur-md">
            {post.category}
          </span>
        </div>

        {/* More Options */}
        <button className="absolute right-3 top-3 rounded-full bg-black/40 p-1.5 opacity-0 backdrop-blur-md transition-smooth group-hover:opacity-100 hover:bg-black/60">
          <MoreHorizontal className="h-3.5 w-3.5 text-white" />
          <span className="sr-only">More options</span>
        </button>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Author & Date */}
        <div className="mb-3 flex items-center gap-2.5">
          <UserAvatar name={post.author.name} avatarUrl={post.author.avatar} size="sm" />
          <div className="flex-1 min-w-0">
            <p className="truncate text-[12px] font-medium text-foreground">
              {post.author.name}
            </p>
            <p className="text-[11px] text-muted-foreground">
              {post.createdAt} · {post.readTime}
            </p>
          </div>
        </div>

        {/* Title & Excerpt */}
        <h3 className="mb-1.5 line-clamp-2 text-[15px] font-semibold leading-snug text-foreground transition-smooth group-hover:text-primary">
          {post.title}
        </h3>
        <p className="mb-4 line-clamp-2 text-[12px] leading-relaxed text-muted-foreground">
          {post.excerpt}
        </p>

        {/* Actions */}
        <div className="flex items-center justify-between border-t border-border pt-3">
          <div className="flex items-center gap-4">
            <button
              onClick={(e) => { e.stopPropagation(); onLike?.(post.id) }}
              className={`flex items-center gap-1.5 text-[12px] transition-smooth ${
                post.isLiked
                  ? "text-primary"
                  : "text-muted-foreground hover:text-primary"
              }`}
            >
              <Heart className={`h-3.5 w-3.5 ${post.isLiked ? "fill-primary" : ""}`} />
              <span>{post.likes}</span>
            </button>
            <button className="flex items-center gap-1.5 text-[12px] text-muted-foreground transition-smooth hover:text-foreground">
              <MessageCircle className="h-3.5 w-3.5" />
              <span>{post.comments}</span>
            </button>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); onBookmark?.(post.id) }}
            className={`transition-smooth ${
              post.isBookmarked
                ? "text-primary"
                : "text-muted-foreground hover:text-primary"
            }`}
          >
            <Bookmark className={`h-3.5 w-3.5 ${post.isBookmarked ? "fill-primary" : ""}`} />
            <span className="sr-only">Bookmark</span>
          </button>
        </div>
      </div>
    </article>
  )
}
