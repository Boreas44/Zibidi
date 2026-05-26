"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import {
  EMAIL_OTP_LENGTH,
  isCompleteEmailOtp,
  normalizeEmailOtp,
} from "@/lib/auth/otp"
import { getAuthCallbackUrl } from "@/lib/auth/site-url"
import {
  getSupabaseConfigError,
  isSupabaseConfigured,
} from "@/lib/supabase/env"
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

function supabaseMisconfigResult(): AuthResult | null {
  const configError = getSupabaseConfigError()
  if (configError) {
    return { success: false, error: configError }
  }
  return null
}

/** Map Supabase Auth API errors to clearer copy. */
function formatSupabaseAuthError(message: string): string {
  const lower = message.toLowerCase()
  if (lower.includes("email rate limit")) {
    return (
      "Too many auth emails sent for this project. Supabase’s built-in mail allows only a few per hour. " +
      "Wait ~1 hour, or add custom SMTP in Supabase (see supabase/MAILERSEND_SMTP.md)."
    )
  }
  if (
    lower.includes("rate limit") ||
    lower.includes("once every") ||
    lower.includes("security purposes")
  ) {
    return "Please wait a minute before requesting another email or code."
  }
  return message
}

/** Supabase client throws when the API URL returns HTML (wrong env). */
function formatAuthError(err: unknown, fallback: string): string {
  const message = err instanceof Error ? err.message : fallback
  if (
    message.includes("not valid JSON") ||
    message.includes("<!DOCTYPE") ||
    message.includes("Unexpected token '<'")
  ) {
    return (
      "Supabase connection failed. In Vercel, set NEXT_PUBLIC_SUPABASE_URL to " +
      "your …supabase.co project URL (not zibidi.vercel.app)."
    )
  }
  return message || fallback
}

/** Sign-up: send 6-digit OTP (Magic Link template must include {{ .Token }} only). */
export async function startSignUpAction(input: {
  email: string
  password: string
  displayName: string
}): Promise<AuthResult> {
  const misconfig = supabaseMisconfigResult()
  if (misconfig) return misconfig

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
    const emailRedirectTo = await getAuthCallbackUrl()
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true,
        emailRedirectTo,
        data: { display_name: displayName },
      },
    })

    if (error) {
      return { success: false, error: formatSupabaseAuthError(error.message) }
    }

    return {
      success: true,
      requiresOtp: true,
      message: `We sent a ${EMAIL_OTP_LENGTH}-digit code to your email. Enter it below.`,
    }
  } catch (err) {
    return { success: false, error: formatAuthError(err, "Sign up failed.") }
  }
}

/** Sign-up: verify OTP and set password. */
export async function verifySignUpOtpAction(input: {
  email: string
  token: string
  password: string
  displayName: string
}): Promise<AuthResult> {
  const misconfig = supabaseMisconfigResult()
  if (misconfig) return misconfig

  try {
    const email = normalizeEmail(input.email)
    const token = normalizeEmailOtp(input.token)
    const displayName = input.displayName.trim()

    if (!email) {
      return { success: false, error: "Email is required." }
    }
    if (!isCompleteEmailOtp(input.token)) {
      return {
        success: false,
        error: `Enter the full ${EMAIL_OTP_LENGTH}-digit code.`,
      }
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
      return { success: false, error: formatSupabaseAuthError(error.message) }
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
    return { success: false, error: formatAuthError(err, "Verification failed.") }
  }
}

/** Sign-up: resend verification OTP. */
export async function resendSignUpOtpAction(input: {
  email: string
  displayName?: string
}): Promise<AuthResult> {
  const misconfig = supabaseMisconfigResult()
  if (misconfig) return misconfig

  try {
    const email = normalizeEmail(input.email)
    if (!email) {
      return { success: false, error: "Email is required." }
    }

    const supabase = await createClient()
    const displayName = input.displayName?.trim()
    const emailRedirectTo = await getAuthCallbackUrl()
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true,
        emailRedirectTo,
        ...(displayName ? { data: { display_name: displayName } } : {}),
      },
    })

    if (error) {
      return { success: false, error: formatSupabaseAuthError(error.message) }
    }

    return { success: true, message: "A new code was sent to your email." }
  } catch (err) {
    return { success: false, error: formatAuthError(err, "Could not resend code.") }
  }
}

/** Password reset: send reset link by email. */
export async function requestPasswordResetAction(input: {
  email: string
}): Promise<AuthResult> {
  const misconfig = supabaseMisconfigResult()
  if (misconfig) return misconfig

  try {
    const email = normalizeEmail(input.email)
    if (!email) {
      return { success: false, error: "Email is required." }
    }

    const supabase = await createClient()
    const redirectTo = `${await getAuthCallbackUrl()}?next=/auth/reset-password`

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo,
    })

    if (error) {
      return { success: false, error: formatSupabaseAuthError(error.message) }
    }

    return {
      success: true,
      message: "If an account exists for this email, we sent a reset link.",
    }
  } catch (err) {
    return {
      success: false,
      error: formatAuthError(err, "Could not send reset email."),
    }
  }
}

/** After email link: save new password. */
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
      return { success: false, error: formatSupabaseAuthError(error.message) }
    }

    revalidatePath("/")
    return { success: true, message: "Password updated. You can sign in now." }
  } catch (err) {
    return {
      success: false,
      error: formatAuthError(err, "Could not update password."),
    }
  }
}

export async function signInAction(input: {
  email: string
  password: string
}): Promise<AuthResult> {
  const misconfig = supabaseMisconfigResult()
  if (misconfig) return misconfig

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
      return { success: false, error: formatSupabaseAuthError(error.message) }
    }

    revalidatePath("/")
    return { success: true, message: "Signed in." }
  } catch (err) {
    return { success: false, error: formatAuthError(err, "Sign in failed.") }
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
      return { success: false, error: formatSupabaseAuthError(error.message) }
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
      return { success: false, error: formatSupabaseAuthError(error.message) }
    }

    revalidatePath("/")
    return { success: true, message: "Profile updated." }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Update failed."
    return { success: false, error: message }
  }
}
