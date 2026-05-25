export type PasswordStrengthLevel = "empty" | "weak" | "fair" | "strong"

export const PASSWORD_STRONG_ERROR =
  "Use at least 8 characters with uppercase, lowercase, and a number."

/** Sign-up and password reset must meet this. */
export function isStrongPassword(password: string): boolean {
  return getPasswordStrength(password) === "strong"
}

export function getPasswordStrength(password: string): PasswordStrengthLevel {
  if (!password) return "empty"

  const len = password.length
  const hasLower = /[a-z]/.test(password)
  const hasUpper = /[A-Z]/.test(password)
  const hasDigit = /\d/.test(password)
  const hasSpecial = /[^A-Za-z0-9]/.test(password)
  const variety = [hasLower, hasUpper, hasDigit, hasSpecial].filter(Boolean).length

  if (len >= 8 && hasLower && hasUpper && hasDigit) {
    return "strong"
  }

  if (len >= 6 && variety >= 2) {
    return "fair"
  }

  return "weak"
}

/** 0–100 for smooth meter fill (not tied to weak/fair/strong buckets). */
export function getPasswordStrengthScore(password: string): number {
  if (!password) return 0

  let score = 0
  const len = password.length

  score += Math.min(35, (len / 12) * 35)
  if (/[a-z]/.test(password)) score += 15
  if (/[A-Z]/.test(password)) score += 15
  if (/\d/.test(password)) score += 20
  if (/[^A-Za-z0-9]/.test(password)) score += 15

  return Math.min(100, Math.round(score))
}

export function getPasswordStrengthHint(level: PasswordStrengthLevel): string {
  switch (level) {
    case "empty":
      return "At least 8 characters, uppercase, lowercase, and a number."
    case "weak":
      return "Too weak — add length and mixed character types."
    case "fair":
      return "Almost there — include uppercase, lowercase, and a number."
    case "strong":
      return "Strong password"
  }
}
