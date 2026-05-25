import { cn } from "@/lib/utils"
import { getInitials, hasAvatarUrl } from "@/lib/avatar"

interface UserAvatarProps {
  name: string
  avatarUrl?: string | null
  className?: string
  size?: "sm" | "md" | "lg" | "xl"
}

const sizeClasses = {
  sm: "h-8 w-8 text-xs",
  md: "h-9 w-9 text-sm",
  lg: "h-24 w-24 text-2xl",
  xl: "h-32 w-32 text-3xl",
}

export function UserAvatar({
  name,
  avatarUrl,
  className,
  size = "md",
}: UserAvatarProps) {
  const sizeClass = sizeClasses[size]

  if (hasAvatarUrl(avatarUrl)) {
    return (
      <img
        src={avatarUrl!}
        alt=""
        className={cn("rounded-full object-cover ring-2 ring-border", sizeClass, className)}
      />
    )
  }

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full bg-primary font-semibold text-primary-foreground ring-2 ring-primary/20",
        sizeClass,
        className
      )}
      aria-hidden
    >
      {getInitials(name)}
    </span>
  )
}
