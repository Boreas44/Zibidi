"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { isSupabaseConfigured } from "@/lib/supabase/env"
import type { AuthResult } from "@/app/actions/auth"

const MAX_BYTES = 2 * 1024 * 1024
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"])

function extensionForMime(type: string) {
  if (type === "image/png") return "png"
  if (type === "image/webp") return "webp"
  if (type === "image/gif") return "gif"
  return "jpg"
}

export type UploadAvatarResult =
  | { success: true; avatarUrl: string; message?: string }
  | { success: false; error: string }

export async function uploadAvatarAction(
  formData: FormData
): Promise<UploadAvatarResult> {
  if (!isSupabaseConfigured()) {
    return { success: false, error: "Supabase is not configured." }
  }

  try {
    const file = formData.get("avatar")
    if (!(file instanceof File) || file.size === 0) {
      return { success: false, error: "Choose a photo to upload." }
    }
    if (!ALLOWED_TYPES.has(file.type)) {
      return { success: false, error: "Use JPG, PNG, WebP, or GIF." }
    }
    if (file.size > MAX_BYTES) {
      return { success: false, error: "Photo must be 2 MB or smaller." }
    }

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: "You must be signed in." }
    }

    const ext = extensionForMime(file.type)
    const path = `${user.id}/avatar.${ext}`
    const buffer = Buffer.from(await file.arrayBuffer())

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(path, buffer, { contentType: file.type, upsert: true })

    if (uploadError) {
      return { success: false, error: uploadError.message }
    }

    const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(path)
    const avatarUrl = `${urlData.publicUrl}?v=${Date.now()}`

    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        avatar_url: avatarUrl,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id)

    if (profileError) {
      return { success: false, error: profileError.message }
    }

    revalidatePath("/")
    return { success: true, avatarUrl, message: "Profile photo updated." }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Upload failed."
    return { success: false, error: message }
  }
}

export async function removeAvatarAction(): Promise<AuthResult> {
  if (!isSupabaseConfigured()) {
    return { success: false, error: "Supabase is not configured." }
  }

  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: "You must be signed in." }
    }

    const { data: files } = await supabase.storage.from("avatars").list(user.id)
    if (files?.length) {
      const paths = files.map((f) => `${user.id}/${f.name}`)
      await supabase.storage.from("avatars").remove(paths)
    }

    const { error } = await supabase
      .from("profiles")
      .update({ avatar_url: null, updated_at: new Date().toISOString() })
      .eq("id", user.id)

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath("/")
    return { success: true, message: "Photo removed." }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not remove photo."
    return { success: false, error: message }
  }
}
