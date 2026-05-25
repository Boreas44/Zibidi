import { cn } from "@/lib/utils"
import { hasAvatarUrl } from "@/lib/avatar"

const BRAND_PLACEHOLDER_SRC = "/WhiteLGO.png"

interface UserAvatarProps {
  name: string
  avatarUrl?: string | null
  className?: string
  size?: "sm" | "md" | "lg" | "xl"
}

const sizeClasses = {
  sm: "h-8 w-8",
  md: "h-9 w-9",
  lg: "h-24 w-24",
  xl: "h-32 w-32",
}

const logoScaleClasses = {
  sm: "h-[70%] w-[70%]",
  md: "h-[68%] w-[68%]",
  lg: "h-[62%] w-[62%]",
  xl: "h-[58%] w-[58%]",
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

  /* Guest veya profil fotoğrafı yok — baş harf yerine marka maskesi */
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#f0355d] ring-2 ring-[#f0355d]/30",
        sizeClass,
        className
      )}
      role="img"
      aria-label={name}
    >
      <img
        src={BRAND_PLACEHOLDER_SRC}
        alt=""
        className={cn("object-contain", logoScaleClasses[size])}
        decoding="async"
      />
    </span>
  )
}
