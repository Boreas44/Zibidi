"use client"

import { useId, useState } from "react"
import { Eye, EyeOff } from "lucide-react"
import type { VariantProps } from "class-variance-authority"

import { Input, inputVariants } from "@/components/ui/input"
import { cn } from "@/lib/utils"

export type PasswordInputProps = Omit<
  React.ComponentProps<typeof Input>,
  "type"
> &
  VariantProps<typeof inputVariants>

/**
 * Password field with show/hide toggle. Toggles input type between "password" and "text".
 * Use anywhere you need sign-in, sign-up, or reset-password fields.
 */
export function PasswordInput({
  className,
  id: idProp,
  variant = "ios",
  disabled,
  ...props
}: PasswordInputProps) {
  const generatedId = useId()
  const id = idProp ?? generatedId
  const [visible, setVisible] = useState(false)

  return (
    <div className={cn("relative", className)}>
      <Input
        id={id}
        variant={variant}
        type={visible ? "text" : "password"}
        disabled={disabled}
        className="pr-11"
        {...props}
      />
      <button
        type="button"
        tabIndex={-1}
        disabled={disabled}
        onClick={() => setVisible((v) => !v)}
        className={cn(
          "absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1.5",
          "text-muted-foreground transition-smooth",
          "hover:bg-accent hover:text-foreground",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
          "disabled:pointer-events-none disabled:opacity-50"
        )}
        aria-label={visible ? "Hide password" : "Show password"}
        aria-pressed={visible}
        aria-controls={id}
      >
        {visible ? (
          <EyeOff className="h-4 w-4" aria-hidden />
        ) : (
          <Eye className="h-4 w-4" aria-hidden />
        )}
      </button>
    </div>
  )
}
