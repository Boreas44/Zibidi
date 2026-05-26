"use client"

import { Instagram, Play, Youtube } from "lucide-react"
import type { PostMedia } from "@/lib/post-media"
import {
  getMediaCoverUrl,
  getMediaTypeLabel,
  getYoutubeEmbedUrl,
  getInstagramEmbedUrl,
} from "@/lib/post-media"
import { cn } from "@/lib/utils"

interface PostMediaPlayerProps {
  media: PostMedia
  title?: string
  variant?: "card" | "article" | "compact"
  className?: string
}

export function PostMediaPlayer({
  media,
  title = "",
  variant = "article",
  className,
}: PostMediaPlayerProps) {
  const aspectClass =
    variant === "compact" ? "aspect-video" : "aspect-[16/10]"

  if (media.type === "image") {
    return (
      <div className={cn("overflow-hidden", className)}>
        <img
          src={media.sourceUrl}
          alt={title}
          className={cn("w-full object-cover", aspectClass)}
        />
      </div>
    )
  }

  if (media.type === "video") {
    return (
      <div className={cn("overflow-hidden bg-black", className)}>
        <video
          src={media.sourceUrl}
          controls
          playsInline
          preload="metadata"
          className={cn("w-full object-contain", aspectClass)}
        >
          <track kind="captions" />
        </video>
      </div>
    )
  }

  if (media.type === "youtube") {
    return (
      <div className={cn("overflow-hidden bg-black", className)}>
        <iframe
          src={getYoutubeEmbedUrl(media.videoId)}
          title={title || "YouTube video"}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className={cn("w-full border-0", aspectClass)}
        />
      </div>
    )
  }

  if (media.type === "instagram") {
    return (
      <div className={cn("overflow-hidden bg-ios-fill-secondary", className)}>
        <iframe
          src={getInstagramEmbedUrl(media)}
          title={title || "Instagram post"}
          allowFullScreen
          scrolling="no"
          className={cn("w-full border-0", aspectClass, "min-h-[480px]")}
        />
      </div>
    )
  }

  return null
}

interface PostMediaThumbnailProps {
  media: PostMedia
  title?: string
  isHovered?: boolean
  className?: string
}

export function PostMediaThumbnail({
  media,
  title = "",
  isHovered = false,
  className,
}: PostMediaThumbnailProps) {
  const coverUrl = getMediaCoverUrl(media)
  const isEmbed = media.type === "youtube" || media.type === "instagram"

  // Touch cihazlarda hover olmadığı için embed medyayı doğrudan gösteriyoruz.
  if (media.type === "instagram") {
    return (
      <div className={cn("relative h-full w-full bg-ios-fill-secondary", className)}>
        <iframe
          src={getInstagramEmbedUrl(media)}
          title={title || "Instagram post"}
          allowFullScreen
          scrolling="no"
          className={cn("h-full w-full border-0")}
        />
      </div>
    )
  }

  if (media.type === "youtube") {
    return (
      <div className={cn("relative h-full w-full bg-black", className)}>
        <iframe
          src={getYoutubeEmbedUrl(media.videoId)}
          title={title || "YouTube video"}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className={cn("h-full w-full border-0")}
        />
      </div>
    )
  }

  if (media.type === "video" && coverUrl) {
    return (
      <div className={cn("relative h-full w-full bg-black", className)}>
        <video
          src={media.sourceUrl}
          muted
          playsInline
          preload="metadata"
          className={cn(
            "h-full w-full object-cover transition-transform duration-500",
            isHovered ? "scale-[1.06]" : "scale-100"
          )}
        />
        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
          <div className="rounded-full bg-black/50 p-3 backdrop-blur-sm">
            <Play className="h-6 w-6 fill-white text-white" />
          </div>
        </div>
      </div>
    )
  }

  if (coverUrl) {
    return (
      <div className={cn("relative h-full w-full", className)}>
        <img
          src={coverUrl}
          alt={title}
          className={cn(
            "h-full w-full object-cover transition-transform duration-500",
            isHovered ? "scale-[1.06]" : "scale-100"
          )}
        />
        {isEmbed ? (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
            <div className="rounded-full bg-black/50 p-3 backdrop-blur-sm">
              {media.type === "youtube" ? (
                <Youtube className="h-6 w-6 text-white" />
              ) : (
                <Instagram className="h-6 w-6 text-white" />
              )}
            </div>
          </div>
        ) : null}
      </div>
    )
  }

  return (
    <div
      className={cn(
        "flex h-full w-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-primary/20 via-background to-primary/10",
        className
      )}
    >
      {media.type === "youtube" ? (
        <Youtube className="h-8 w-8 text-muted-foreground" />
      ) : (
        <Instagram className="h-8 w-8 text-muted-foreground" />
      )}
      <span className="text-[12px] font-medium text-muted-foreground">
        {getMediaTypeLabel(media.type)}
      </span>
    </div>
  )
}
