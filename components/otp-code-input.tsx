"use client"

import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp"
import { EMAIL_OTP_LENGTH, emailOtpLengthLabel } from "@/lib/auth/otp"
import { cn } from "@/lib/utils"

const slotClassName = cn(
  "!rounded-2xl !border-2 !border-solid",
  "h-[3.75rem] w-[3.1rem] sm:w-[3.35rem]",
  "border-white/20 bg-ios-fill-secondary",
  "text-[1.75rem] font-bold tabular-nums tracking-tight text-foreground",
  "shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08),0_2px_8px_rgba(0,0,0,0.25)]",
  "transition-[border-color,box-shadow,background-color,transform] duration-200 ease-out",
  "data-[active=true]:!border-primary data-[active=true]:!ring-[3px] data-[active=true]:!ring-primary/40",
  "data-[filled=true]:border-white/30 data-[filled=true]:bg-accent/90",
  "data-[active=true]:bg-primary/20 data-[active=true]:scale-[1.03] data-[active=true]:z-10",
  "data-[active=true]:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.12),0_0_0_1px_var(--primary),0_4px_16px_rgba(0,0,0,0.35)]",
  "aria-invalid:!border-destructive aria-invalid:data-[active=true]:!ring-destructive/40"
)

interface OtpCodeInputProps {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
}

function OtpSlotGroup({ startIndex }: { startIndex: number }) {
  const count = EMAIL_OTP_LENGTH === 8 ? 4 : 3
  return (
    <InputOTPGroup className="gap-2.5 sm:gap-3">
      {Array.from({ length: count }, (_, i) => (
        <InputOTPSlot key={startIndex + i} index={startIndex + i} className={slotClassName} />
      ))}
    </InputOTPGroup>
  )
}

export function OtpCodeInput({ value, onChange, disabled }: OtpCodeInputProps) {
  const label = emailOtpLengthLabel()

  return (
    <div className="flex flex-col items-center gap-4">
      <InputOTP
        maxLength={EMAIL_OTP_LENGTH}
        value={value}
        onChange={onChange}
        disabled={disabled}
        containerClassName="justify-center gap-3 sm:gap-3.5"
      >
        <OtpSlotGroup startIndex={0} />

        <span
          className="select-none px-0.5 text-[1.5rem] font-light leading-none text-foreground/45"
          aria-hidden
        >
          ·
        </span>

        <OtpSlotGroup startIndex={EMAIL_OTP_LENGTH === 8 ? 4 : 3} />
      </InputOTP>

      <p className="max-w-[16rem] text-center text-[13px] leading-snug text-foreground/65">
        Enter the <span className="font-medium text-foreground/90">{label}</span> code from your
        email
      </p>
    </div>
  )
}
