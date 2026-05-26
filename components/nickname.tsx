import { cn } from "@/lib/utils"
import { formatNickname, nicknameHandle } from "@/lib/auth/nickname"

type NicknameElement = "span" | "p" | "h3"

interface NicknameProps {
  name: string | null | undefined
  /** Shown when name is empty */
  fallback?: string
  className?: string
  as?: NicknameElement
  /** Include @ prefix (default true) */
  withAt?: boolean
}

const tagClass: Record<NicknameElement, string> = {
  span: "truncate",
  p: "truncate",
  h3: "truncate",
}

/**
 * Consistent @nickname display across the app.
 */
export function Nickname({
  name,
  fallback = "unknown",
  className,
  as: Tag = "span",
  withAt = true,
}: NicknameProps) {
  const handle = nicknameHandle(name) || fallback
  const label = withAt ? formatNickname(handle) : handle

  return (
    <Tag className={cn(tagClass[Tag], className)} title={label}>
      {label}
    </Tag>
  )
}
