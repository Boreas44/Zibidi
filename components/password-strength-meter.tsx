"use client"

import {
  getPasswordStrength,
  getPasswordStrengthHint,
  getPasswordStrengthScore,
} from "@/lib/password-strength"
import { cn } from "@/lib/utils"

const STRENGTH_GRADIENT =
  "linear-gradient(90deg, #ff3b30 0%, #ff453a 18%, #ff9500 42%, #ffcc00 58%, #a8e063 78%, #34c759 100%)"

interface PasswordStrengthMeterProps {
  password: string
  className?: string
}

export function PasswordStrengthMeter({
  password,
  className,
}: PasswordStrengthMeterProps) {
  const level = getPasswordStrength(password)
  const hint = getPasswordStrengthHint(level)
  const score = getPasswordStrengthScore(password)
  const fillWidth = password ? Math.max(score, 4) : 0

  return (
    <div className={cn("mt-2", className)} aria-live="polite">
      <div
        className="h-[3px] w-full overflow-hidden rounded-full bg-[rgba(255,255,255,0.12)]"
        role="meter"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={score}
        aria-label={`Password strength: ${level === "empty" ? "none" : level}`}
      >
        <div
          className="h-full overflow-hidden rounded-full transition-[width] duration-300 ease-out"
          style={{ width: `${fillWidth}%` }}
        >
          <div
            className="h-full rounded-full"
            style={{
              width: fillWidth > 0 ? `${(100 / fillWidth) * 100}%` : "0%",
              background: STRENGTH_GRADIENT,
              boxShadow:
                score > 0
                  ? "0 0 10px rgba(255, 69, 58, 0.35), 0 0 14px rgba(52, 199, 89, 0.2)"
                  : undefined,
            }}
          />
        </div>
      </div>
      <p
        className={cn(
          "mt-1.5 text-[11px] leading-snug transition-colors duration-300",
          level === "strong"
            ? "text-[#34c759]"
            : level === "fair"
              ? "text-[#ffcc00]"
              : "text-muted-foreground"
        )}
      >
        {hint}
      </p>
    </div>
  )
}
