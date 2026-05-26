"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { PasswordInput } from "@/components/password-input"
import { Label } from "@/components/ui/label"
import { PasswordStrengthMeter } from "@/components/password-strength-meter"
import { updatePasswordAction } from "@/app/actions/auth"
import {
  isStrongPassword,
  PASSWORD_STRONG_ERROR,
} from "@/lib/password-strength"

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const canSubmit =
    isStrongPassword(password) && password === confirm && confirm.length > 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isStrongPassword(password)) {
      toast.error(PASSWORD_STRONG_ERROR)
      return
    }
    if (password !== confirm) {
      toast.error("Passwords do not match.")
      return
    }
    setIsLoading(true)
    try {
      const result = await updatePasswordAction({ password })
      if (result.success) {
        toast.success(result.message ?? "Password updated")
        router.push("/")
        router.refresh()
      } else {
        toast.error(result.error)
      }
    } catch {
      toast.error("Something went wrong.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="ambient-gradient flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-xl">
        <h1 className="text-[22px] font-bold text-foreground">Set a new password</h1>
        <p className="mt-2 text-[15px] text-muted-foreground">
          Choose a strong password for your Zibidi account.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <Label htmlFor="new-password" className="text-[13px] text-muted-foreground">
              New password
            </Label>
            <PasswordInput
              id="new-password"
              variant="ios"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1"
              autoComplete="new-password"
              required
              minLength={8}
            />
            <PasswordStrengthMeter password={password} />
          </div>
          <div>
            <Label htmlFor="confirm-password" className="text-[13px] text-muted-foreground">
              Confirm password
            </Label>
            <PasswordInput
              id="confirm-password"
              variant="ios"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="mt-1"
              autoComplete="new-password"
              required
              minLength={8}
            />
            {confirm.length > 0 && password !== confirm && (
              <p className="mt-1.5 text-[11px] text-[#ff3b30]">Passwords do not match.</p>
            )}
          </div>
          <Button type="submit" className="w-full" disabled={isLoading || !canSubmit}>
            {isLoading ? "Saving…" : "Update password"}
          </Button>
        </form>

        <p className="mt-6 text-center text-[13px] text-muted-foreground">
          <Link href="/" className="text-primary hover:underline">
            Back to home
          </Link>
        </p>
      </div>
    </div>
  )
}
