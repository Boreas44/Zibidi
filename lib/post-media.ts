export type PostMediaType = "image" | "video" | "youtube" | "instagram"

export interface PostMediaBase {
  type: PostMediaType
  sourceUrl: string
}

export interface ImagePostMedia extends PostMediaBase {
  type: "image"
}

export interface VideoPostMedia extends PostMediaBase {
  type: "video"
}

export interface YoutubePostMedia extends PostMediaBase {
  type: "youtube"
  videoId: string
}

export type InstagramPath = "p" | "reel" | "reels" | "tv"

export interface InstagramPostMedia extends PostMediaBase {
  type: "instagram"
  shortcode: string
  instagramPath?: InstagramPath
}

export type PostMedia =
  | ImagePostMedia
  | VideoPostMedia
  | YoutubePostMedia
  | InstagramPostMedia

const YOUTUBE_PATTERNS = [
  /(?:youtube\.com\/watch\?(?:.*&)?v=|youtube\.com\/embed\/|youtube\.com\/shorts\/|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
  /^([a-zA-Z0-9_-]{11})$/,
]

const INSTAGRAM_PATTERNS = [
  /instagram\.com\/(p|reel|reels|tv)\/([a-zA-Z0-9_-]+)/,
]

function normalizeUrl(raw: string): string {
  const trimmed = raw.trim()
  if (!trimmed) return ""
  try {
    const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`
    return new URL(withProtocol).href
  } catch {
    return trimmed
  }
}

export function extractYoutubeVideoId(input: string): string | null {
  const normalized = normalizeUrl(input)
  for (const pattern of YOUTUBE_PATTERNS) {
    const match = normalized.match(pattern)
    if (match?.[1]) return match[1]
  }
  return null
}

export function extractInstagramShortcode(input: string): string | null {
  const normalized = normalizeUrl(input)
  for (const pattern of INSTAGRAM_PATTERNS) {
    const match = normalized.match(pattern)
    if (match?.[2]) return match[2]
  }
  return null
}

function extractInstagramShortcodeAndPath(
  input: string
): { shortcode: string; instagramPath: InstagramPath } | null {
  const normalized = normalizeUrl(input)
  for (const pattern of INSTAGRAM_PATTERNS) {
    const match = normalized.match(pattern)
    if (!match?.[1] || !match?.[2]) continue

    const instagramPath = match[1] as InstagramPath
    const shortcode = match[2]
    if (shortcode) return { shortcode, instagramPath }
  }
  return null
}

export function parseMediaUrl(raw: string): PostMedia | null {
  const sourceUrl = normalizeUrl(raw)
  if (!sourceUrl) return null

  const youtubeId = extractYoutubeVideoId(sourceUrl)
  if (youtubeId) {
    return {
      type: "youtube",
      sourceUrl: `https://www.youtube.com/watch?v=${youtubeId}`,
      videoId: youtubeId,
    }
  }

  const instagram = extractInstagramShortcodeAndPath(sourceUrl)
  if (instagram) {
    return {
      type: "instagram",
      sourceUrl,
      shortcode: instagram.shortcode,
      instagramPath: instagram.instagramPath,
    }
  }

  return null
}

export function isPostMedia(value: unknown): value is PostMedia {
  if (!value || typeof value !== "object") return false
  const media = value as Record<string, unknown>
  if (typeof media.type !== "string" || typeof media.sourceUrl !== "string") return false

  switch (media.type) {
    case "image":
    case "video":
      return true
    case "youtube":
      return typeof media.videoId === "string"
    case "instagram":
      return typeof media.shortcode === "string"
    default:
      return false
  }
}

export function parsePostMediaFromDb(value: unknown): PostMedia | null {
  if (isPostMedia(value)) return value

  // Supabase JSONB bazen beklediğimiz anahtarları tam döndürmeyebilir.
  // En azından type/sourceUrl üzerinden tekrar türetmeye çalışıyoruz.
  if (!value || typeof value !== "object") return null
  const media = value as Record<string, unknown>

  const type = media.type
  const sourceUrl = media.sourceUrl
  if (typeof type !== "string" || typeof sourceUrl !== "string") return null

  switch (type) {
    case "image":
      return { type: "image", sourceUrl }
    case "video":
      return { type: "video", sourceUrl }
    case "youtube": {
      const videoId =
        typeof media.videoId === "string" ? media.videoId : extractYoutubeVideoId(sourceUrl)
      if (!videoId) return null
      return { type: "youtube", sourceUrl, videoId }
    }
    case "instagram": {
      const shortcutFromDb =
        typeof media.shortcode === "string" ? media.shortcode : null

      // Öncelik: sourceUrl üzerinden path'i anlamak.
      const extractedFromSource = extractInstagramShortcodeAndPath(sourceUrl)
      const extractedFromFallback = shortcutFromDb
        ? extractInstagramShortcodeAndPath(
            `https://www.instagram.com/p/${shortcutFromDb}/`
          )
        : null

      const shortcode = shortcutFromDb ?? extractedFromSource?.shortcode
      const instagramPath =
        extractedFromSource?.instagramPath ?? extractedFromFallback?.instagramPath

      if (!shortcode) return null
      return { type: "instagram", sourceUrl, shortcode, instagramPath }
    }
    default:
      return null
  }
}

export function getMediaCoverUrl(media: PostMedia | null | undefined): string {
  if (!media) return ""

  switch (media.type) {
    case "image":
      return media.sourceUrl
    case "video":
      return media.sourceUrl
    case "youtube":
      return `https://img.youtube.com/vi/${media.videoId}/hqdefault.jpg`
    case "instagram":
      return ""
    default:
      return ""
  }
}

export function getYoutubeEmbedUrl(videoId: string): string {
  return `https://www.youtube.com/embed/${videoId}?rel=0`
}

function getInstagramPathFromSourceUrl(sourceUrl: string): InstagramPath {
  const normalized = normalizeUrl(sourceUrl)
  if (normalized.includes("/reel/")) return "reel"
  if (normalized.includes("/reels/")) return "reels"
  if (normalized.includes("/tv/")) return "tv"
  return "p"
}

export function getInstagramEmbedUrl(media: InstagramPostMedia): string {
  const instagramPath = media.instagramPath ?? getInstagramPathFromSourceUrl(media.sourceUrl)
  return `https://www.instagram.com/${instagramPath}/${media.shortcode}/embed`
}

export function getMediaTypeLabel(type: PostMediaType): string {
  switch (type) {
    case "image":
      return "Image"
    case "video":
      return "Video"
    case "youtube":
      return "YouTube"
    case "instagram":
      return "Instagram"
    default:
      return "Media"
  }
}
