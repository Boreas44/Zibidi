"use client"

import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp"

interface OtpCodeInputProps {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
}

export function OtpCodeInput({ value, onChange, disabled }: OtpCodeInputProps) {
  return (
    <div className="flex flex-col items-center gap-3">
      <InputOTP
        maxLength={6}
        value={value}
        onChange={onChange}
        disabled={disabled}
        containerClassName="justify-center gap-2"
      >
        <InputOTPGroup className="gap-2">
          <InputOTPSlot index={0} className="h-12 w-11 rounded-xl border-border text-lg" />
          <InputOTPSlot index={1} className="h-12 w-11 rounded-xl border-border text-lg" />
          <InputOTPSlot index={2} className="h-12 w-11 rounded-xl border-border text-lg" />
        </InputOTPGroup>
        <InputOTPSeparator className="text-muted-foreground" />
        <InputOTPGroup className="gap-2">
          <InputOTPSlot index={3} className="h-12 w-11 rounded-xl border-border text-lg" />
          <InputOTPSlot index={4} className="h-12 w-11 rounded-xl border-border text-lg" />
          <InputOTPSlot index={5} className="h-12 w-11 rounded-xl border-border text-lg" />
        </InputOTPGroup>
      </InputOTP>
      <p className="text-center text-[12px] text-muted-foreground">
        Enter the 6-digit code from your email
      </p>
    </div>
  )
}
