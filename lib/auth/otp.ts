/** Must match Supabase → Authentication → Providers → Email → Email OTP length */
export const EMAIL_OTP_LENGTH = 6

export function normalizeEmailOtp(token: string) {
  return token.replace(/\D/g, "").slice(0, EMAIL_OTP_LENGTH)
}

export function isCompleteEmailOtp(token: string) {
  return normalizeEmailOtp(token).length === EMAIL_OTP_LENGTH
}

export function emailOtpLengthLabel() {
  return `${EMAIL_OTP_LENGTH}-digit`
}
