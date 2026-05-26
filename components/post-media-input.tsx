"use client"

import {
  Image as ImageIcon,
  Instagram,
  Link2,
  Loader2,
  Upload,
  Video,
  X,
  Youtube,
} from "lucide-react"
import { useRef, useState } from "react"
import { uploadPostMediaAction } from "@/app/actions/post-media"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  getMediaTypeLabel,
  parseMediaUrl,
  type PostMedia,
} from "@/lib/post-media"
import { cn } from "@/lib/utils"
import { PostMediaPlayer } from "@/components/post-media-player"

type MediaTab = "upload" | "youtube" | "instagram"

interface PostMediaInputProps {
  value: PostMedia | null
  onChange: (media: PostMedia | null) => void
  disabled?: boolean
}

export function PostMediaInput({ value, onChange, disabled = false }: PostMediaInputProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [activeTab, setActiveTab] = useState<MediaTab>("upload")
  const [embedUrl, setEmbedUrl] = useState("")
  const [embedError, setEmbedError] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || disabled) return

    setIsUploading(true)
    setUploadError(null)

    try {
      const formData = new FormData()
      formData.set("media", file)
      const result = await uploadPostMediaAction(formData)

      if (result.success) {
        onChange(result.media)
        setActiveTab("upload")
      } else {
        setUploadError(result.error)
      }
    } catch {
      setUploadError("Upload failed. Please try again.")
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  const handleEmbedSubmit = () => {
    setEmbedError(null)
    const parsed = parseMediaUrl(embedUrl)

    if (!parsed) {
      setEmbedError(
        activeTab === "youtube"
          ? "Enter a valid YouTube URL or video ID."
          : "Enter a valid Instagram post or reel URL."
      )
      return
    }

    if (activeTab === "youtube" && parsed.type !== "youtube") {
      setEmbedError("That link is not a YouTube URL.")
      return
    }

    if (activeTab === "instagram" && parsed.type !== "instagram") {
      setEmbedError("That link is not an Instagram URL.")
      return
    }

    onChange(parsed)
    setEmbedUrl("")
  }

  const clearMedia = () => {
    onChange(null)
    setEmbedUrl("")
    setEmbedError(null)
    setUploadError(null)
  }

  if (value) {
    return (
      <div className="space-y-3">
        <div className="relative overflow-hidden rounded-2xl border border-border">
          <PostMediaPlayer media={value} variant="compact" />
          <Button
            type="button"
            variant="secondary"
            size="icon-sm"
            disabled={disabled}
            onClick={clearMedia}
            className="absolute right-2 top-2 rounded-full bg-black/50 text-white backdrop-blur-sm hover:bg-black/70"
            aria-label="Remove media"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-[12px] text-muted-foreground">
          {getMediaTypeLabel(value.type)} attached
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <TabButton
          active={activeTab === "upload"}
          onClick={() => setActiveTab("upload")}
          icon={<Upload className="h-3.5 w-3.5" />}
          label="Upload"
          disabled={disabled}
        />
        <TabButton
          active={activeTab === "youtube"}
          onClick={() => setActiveTab("youtube")}
          icon={<Youtube className="h-3.5 w-3.5" />}
          label="YouTube"
          disabled={disabled}
        />
        <TabButton
          active={activeTab === "instagram"}
          onClick={() => setActiveTab("instagram")}
          icon={<Instagram className="h-3.5 w-3.5" />}
          label="Instagram"
          disabled={disabled}
        />
      </div>

      {activeTab === "upload" ? (
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,video/quicktime"
            className="sr-only"
            disabled={disabled || isUploading}
            onChange={handleFileSelect}
          />
          <button
            type="button"
            disabled={disabled || isUploading}
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              "flex h-28 w-full cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border bg-ios-fill-secondary transition-smooth",
              "hover:border-primary/40 hover:bg-accent",
              "disabled:cursor-not-allowed disabled:opacity-60"
            )}
          >
            {isUploading ? (
              <>
                <Loader2 className="mb-2 h-7 w-7 animate-spin text-muted-foreground" />
                <p className="text-[13px] text-muted-foreground">Uploading…</p>
              </>
            ) : (
              <>
                <div className="mb-2 flex items-center gap-2 text-muted-foreground">
                  <ImageIcon className="h-6 w-6" />
                  <Video className="h-6 w-6" />
                </div>
                <p className="text-[13px] font-medium text-foreground">Tap to upload</p>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  Image (10 MB) or video (50 MB)
                </p>
              </>
            )}
          </button>
          {uploadError ? (
            <p className="mt-2 text-[12px] text-destructive">{uploadError}</p>
          ) : null}
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Link2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                variant="ios"
                value={embedUrl}
                onChange={(e) => {
                  setEmbedUrl(e.target.value)
                  setEmbedError(null)
                }}
                placeholder={
                  activeTab === "youtube"
                    ? "https://youtube.com/watch?v=…"
                    : "https://instagram.com/p/…"
                }
                disabled={disabled}
                className="pl-9"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    handleEmbedSubmit()
                  }
                }}
              />
            </div>
            <Button
              type="button"
              variant="ios"
              disabled={disabled || !embedUrl.trim()}
              onClick={handleEmbedSubmit}
            >
              Add
            </Button>
          </div>
          {embedError ? (
            <p className="text-[12px] text-destructive">{embedError}</p>
          ) : (
            <p className="text-[11px] text-muted-foreground">
              {activeTab === "youtube"
                ? "Paste a YouTube link or 11-character video ID."
                : "Paste an Instagram post, reel, or IGTV link."}
            </p>
          )}
        </div>
      )}
    </div>
  )
}

function TabButton({
  active,
  onClick,
  icon,
  label,
  disabled,
}: {
  active: boolean
  onClick: () => void
  icon: React.ReactNode
  label: string
  disabled?: boolean
}) {
  return (
    <Button
      type="button"
      variant={active ? "default" : "ios"}
      size="sm"
      disabled={disabled}
      onClick={onClick}
      className="gap-1.5"
    >
      {icon}
      {label}
    </Button>
  )
}
