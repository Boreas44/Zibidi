"use server"

import type { ImagePostMedia, PostMedia, VideoPostMedia } from "@/lib/post-media"
import { createClient } from "@/lib/supabase/server"
import { isSupabaseConfigured } from "@/lib/supabase/env"

const IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"])
const VIDEO_TYPES = new Set(["video/mp4", "video/webm", "video/quicktime"])
const MAX_IMAGE_BYTES = 10 * 1024 * 1024
const MAX_VIDEO_BYTES = 50 * 1024 * 1024

export type UploadPostMediaResult =
  | { success: true; media: ImagePostMedia | VideoPostMedia }
  | { success: false; error: string }

function extensionForMime(mime: string): string {
  switch (mime) {
    case "image/jpeg":
      return "jpg"
    case "image/png":
      return "png"
    case "image/webp":
      return "webp"
    case "image/gif":
      return "gif"
    case "video/mp4":
      return "mp4"
    case "video/webm":
      return "webm"
    case "video/quicktime":
      return "mov"
    default:
      return "bin"
  }
}

export async function uploadPostMediaAction(
  formData: FormData
): Promise<UploadPostMediaResult> {
  if (!isSupabaseConfigured()) {
    return { success: false, error: "Supabase is not configured." }
  }

  try {
    const file = formData.get("media")
    if (!(file instanceof File) || file.size === 0) {
      return { success: false, error: "Choose a file to upload." }
    }

    const isImage = IMAGE_TYPES.has(file.type)
    const isVideo = VIDEO_TYPES.has(file.type)

    if (!isImage && !isVideo) {
      return {
        success: false,
        error: "Use JPG, PNG, WebP, GIF, MP4, WebM, or MOV.",
      }
    }

    const maxBytes = isImage ? MAX_IMAGE_BYTES : MAX_VIDEO_BYTES
    if (file.size > maxBytes) {
      return {
        success: false,
        error: isImage
          ? "Image must be 10 MB or smaller."
          : "Video must be 50 MB or smaller.",
      }
    }

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: "You must be signed in." }
    }

    const ext = extensionForMime(file.type)
    const path = `${user.id}/${crypto.randomUUID()}.${ext}`
    const buffer = Buffer.from(await file.arrayBuffer())

    const { error: uploadError } = await supabase.storage
      .from("post-media")
      .upload(path, buffer, { contentType: file.type, upsert: false })

    if (uploadError) {
      return { success: false, error: uploadError.message }
    }

    const { data: urlData } = supabase.storage.from("post-media").getPublicUrl(path)
    const sourceUrl = urlData.publicUrl

    const media: PostMedia = isImage
      ? { type: "image", sourceUrl }
      : { type: "video", sourceUrl }

    return { success: true, media }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Upload failed."
    return { success: false, error: message }
  }
}
