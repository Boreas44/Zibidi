"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { getAuthSiteUrl } from "@/lib/auth/site-url"
import { isSupabaseConfigured } from "@/lib/supabase/env"
import {
  isStrongPassword,
  PASSWORD_STRONG_ERROR,
} from "@/lib/password-strength"

export type AuthResult =
  | { success: true; message?: string; requiresOtp?: boolean }
  | { success: false; error: string }

function normalizeEmail(email: string) {
  return email.trim().toLowerCase()
}

function normalizeOtp(token: string) {
  return token.replace(/\D/g, "").slice(0, 6)
}

/** Kayıt: e-postaya 6 haneli kod gönderir (Magic Link şablonunda yalnızca {{ .Token }}). */
export async function startSignUpAction(input: {
  email: string
  password: string
  displayName: string
}): Promise<AuthResult> {
  if (!isSupabaseConfigured()) {
    return { success: false, error: "Supabase is not configured. Add .env.local keys." }
  }

  try {
    const email = normalizeEmail(input.email)
    const displayName = input.displayName.trim()

    if (!email || !input.password || !displayName) {
      return { success: false, error: "All fields are required." }
    }
    if (!isStrongPassword(input.password)) {
      return { success: false, error: PASSWORD_STRONG_ERROR }
    }

    const supabase = await createClient()
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true,
        data: { display_name: displayName },
      },
    })

    if (error) {
      return { success: false, error: error.message }
    }

    return {
      success: true,
      requiresOtp: true,
      message: "We sent a 6-digit code to your email. Enter it below.",
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Sign up failed."
    return { success: false, error: message }
  }
}

/** Kayıt: 6 haneli kodu doğrula ve şifreyi ayarla. */
export async function verifySignUpOtpAction(input: {
  email: string
  token: string
  password: string
  displayName: string
}): Promise<AuthResult> {
  if (!isSupabaseConfigured()) {
    return { success: false, error: "Supabase is not configured." }
  }

  try {
    const email = normalizeEmail(input.email)
    const token = normalizeOtp(input.token)
    const displayName = input.displayName.trim()

    if (!email) {
      return { success: false, error: "Email is required." }
    }
    if (token.length !== 6) {
      return { success: false, error: "Enter the full 6-digit code." }
    }
    if (!isStrongPassword(input.password)) {
      return { success: false, error: PASSWORD_STRONG_ERROR }
    }
    if (!displayName) {
      return { success: false, error: "Display name is required." }
    }

    const supabase = await createClient()
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: "email",
    })

    if (error) {
      return { success: false, error: error.message }
    }

    if (!data.session) {
      return { success: false, error: "Verification failed. Try again or resend the code." }
    }

    const { error: passwordError } = await supabase.auth.updateUser({
      password: input.password,
      data: { display_name: displayName },
    })

    if (passwordError) {
      return { success: false, error: passwordError.message }
    }

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (user) {
      await supabase
        .from("profiles")
        .update({
          display_name: displayName,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id)
    }

    revalidatePath("/")
    return { success: true, message: "Email verified. Welcome to Zibidi!" }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Verification failed."
    return { success: false, error: message }
  }
}

/** Kayıt: doğrulama kodunu yeniden gönder. */
export async function resendSignUpOtpAction(input: {
  email: string
  displayName?: string
}): Promise<AuthResult> {
  if (!isSupabaseConfigured()) {
    return { success: false, error: "Supabase is not configured." }
  }

  try {
    const email = normalizeEmail(input.email)
    if (!email) {
      return { success: false, error: "Email is required." }
    }

    const supabase = await createClient()
    const displayName = input.displayName?.trim()
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true,
        ...(displayName ? { data: { display_name: displayName } } : {}),
      },
    })

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, message: "A new code was sent to your email." }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not resend code."
    return { success: false, error: message }
  }
}

/** Şifre sıfırlama: e-postaya reset linki gönderir. */
export async function requestPasswordResetAction(input: {
  email: string
}): Promise<AuthResult> {
  if (!isSupabaseConfigured()) {
    return { success: false, error: "Supabase is not configured." }
  }

  try {
    const email = normalizeEmail(input.email)
    if (!email) {
      return { success: false, error: "Email is required." }
    }

    const supabase = await createClient()
    const redirectTo = `${getAuthSiteUrl()}/auth/callback?next=/auth/reset-password`

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo,
    })

    if (error) {
      return { success: false, error: error.message }
    }

    return {
      success: true,
      message: "If an account exists for this email, we sent a reset link.",
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not send reset email."
    return { success: false, error: message }
  }
}

/** E-posta linkinden geldikten sonra yeni şifre kaydet. */
export async function updatePasswordAction(input: {
  password: string
}): Promise<AuthResult> {
  if (!isSupabaseConfigured()) {
    return { success: false, error: "Supabase is not configured." }
  }

  try {
    if (!isStrongPassword(input.password)) {
      return { success: false, error: PASSWORD_STRONG_ERROR }
    }

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return {
        success: false,
        error: "Session expired. Open the reset link from your email again.",
      }
    }

    const { error } = await supabase.auth.updateUser({
      password: input.password,
    })

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath("/")
    return { success: true, message: "Password updated. You can sign in now." }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not update password."
    return { success: false, error: message }
  }
}

export async function signInAction(input: {
  email: string
  password: string
}): Promise<AuthResult> {
  if (!isSupabaseConfigured()) {
    return { success: false, error: "Supabase is not configured. Add .env.local keys." }
  }

  try {
    const email = normalizeEmail(input.email)
    if (!email || !input.password) {
      return { success: false, error: "Email and password are required." }
    }

    const supabase = await createClient()
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: input.password,
    })

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath("/")
    return { success: true, message: "Signed in." }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Sign in failed."
    return { success: false, error: message }
  }
}

export async function signOutAction(): Promise<AuthResult> {
  if (!isSupabaseConfigured()) {
    return { success: true }
  }

  try {
    const supabase = await createClient()
    const { error } = await supabase.auth.signOut()
    if (error) {
      return { success: false, error: error.message }
    }
    revalidatePath("/")
    return { success: true }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Sign out failed."
    return { success: false, error: message }
  }
}

export async function updateProfileAction(input: {
  displayName: string
  bio: string
}): Promise<AuthResult> {
  if (!isSupabaseConfigured()) {
    return { success: false, error: "Supabase is not configured." }
  }

  try {
    const displayName = input.displayName.trim()
    if (!displayName) {
      return { success: false, error: "Display name is required." }
    }

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: "You must be signed in." }
    }

    const { error } = await supabase
      .from("profiles")
      .update({
        display_name: displayName,
        bio: input.bio.trim(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id)

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath("/")
    return { success: true, message: "Profile updated." }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Update failed."
    return { success: false, error: message }
  }
}
