"use client"

import { Bell } from "lucide-react"
import { IosSearchField } from "@/components/ios/ios-search-field"
import { UserAvatar } from "@/components/user-avatar"
import type { AppProfile } from "@/lib/auth/server"

interface SearchHeaderProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  searchInputRef?: React.RefObject<HTMLInputElement | null>
  autoFocusSearch?: boolean
  onOpenProfile?: () => void
  user?: AppProfile | null
}

export function SearchHeader({
  searchQuery,
  onSearchChange,
  searchInputRef,
  autoFocusSearch,
  onOpenProfile,
  user,
}: SearchHeaderProps) {
  const guestLabel = "Sign in"

  return (
    <header className="glass sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-border px-4 py-3 md:px-8 md:py-3.5">
      <IosSearchField
        ref={searchInputRef}
        value={searchQuery}
        onChange={onSearchChange}
        className="max-w-lg flex-1"
        autoFocus={autoFocusSearch}
        placeholder={
          autoFocusSearch
            ? "Search posts, authors, topics…"
            : "Artists, songs, or podcasts"
        }
      />

      <div className="flex shrink-0 items-center gap-1">
        <button
          type="button"
          className="ios-tap relative rounded-full p-2 text-muted-foreground hover:text-foreground"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-primary" />
          <span className="sr-only">Notifications</span>
        </button>
        <button
          type="button"
          onClick={onOpenProfile}
          className="ios-tap flex items-center gap-2 rounded-full py-1 pl-1 pr-2 transition-smooth hover:bg-ios-fill md:pr-3"
          aria-label={user ? `${user.displayName} account` : guestLabel}
        >
          <UserAvatar
            name={user?.displayName ?? guestLabel}
            avatarUrl={user?.avatarUrl}
            size="md"
          />
          <span className="hidden text-[13px] font-medium text-foreground md:inline">
            {user ? user.displayName : guestLabel}
          </span>
        </button>
      </div>
    </header>
  )
}
