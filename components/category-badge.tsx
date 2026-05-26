import { getCategoryById, getCategoryTitle } from "@/lib/categories"
import { cn } from "@/lib/utils"

interface CategoryBadgeProps {
  category: string
  className?: string
  /** Pill style for overlays on images */
  variant?: "pill" | "plain"
  /** When true, geo categories show flag + name; flag-only if false for geo */
  showName?: boolean
}

export function CategoryBadge({
  category,
  className,
  variant = "plain",
  showName = true,
}: CategoryBadgeProps) {
  const cat = getCategoryById(category)
  const label = getCategoryTitle(category)
  const flag = cat?.flag ?? null

  const content =
    flag && !showName ? (
      <span className="text-[15px] leading-none" role="img" aria-label={label}>
        {flag}
      </span>
    ) : flag && showName ? (
      <>
        <span className="text-[14px] leading-none" role="img" aria-hidden>
          {flag}
        </span>
        <span>{label}</span>
      </>
    ) : (
      <span>{label}</span>
    )

  if (variant === "pill") {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full bg-black/50 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur-md",
          className
        )}
      >
        {content}
      </span>
    )
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 text-[12px] font-medium text-foreground/80",
        className
      )}
    >
      {content}
    </span>
  )
}
