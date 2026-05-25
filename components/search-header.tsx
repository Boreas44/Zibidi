"use client"

import { Search, Bell, User } from "lucide-react"
import { useState } from "react"

interface SearchHeaderProps {
  searchQuery: string
  onSearchChange: (query: string) => void
}

export function SearchHeader({ searchQuery, onSearchChange }: SearchHeaderProps) {
  const [isFocused, setIsFocused] = useState(false)

  return (
    <header className="glass sticky top-0 z-30 flex items-center justify-between border-b border-white/[0.06] px-8 py-3.5">
      {/* Search Bar */}
      <div className="relative max-w-lg flex-1">
        <div
          className={`flex items-center gap-2.5 rounded-full bg-white/[0.08] px-4 py-2.5 transition-smooth ${
            isFocused
              ? "bg-white/[0.12] ring-1 ring-primary/40"
              : "hover:bg-white/[0.10]"
          }`}
        >
          <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
          <input
            type="text"
            placeholder="Artists, songs, or podcasts"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className="flex-1 bg-transparent text-[13px] text-foreground placeholder:text-muted-foreground/70 focus:outline-none"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange("")}
              className="shrink-0 rounded-full p-0.5 text-muted-foreground transition-smooth hover:text-foreground"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
              <span className="sr-only">Clear</span>
            </button>
          )}
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-1.5 ml-4">
        <button className="relative rounded-full p-2 text-muted-foreground transition-smooth hover:bg-white/[0.08] hover:text-foreground">
          <Bell className="h-5 w-5" />
          <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-primary" />
          <span className="sr-only">Notifications</span>
        </button>
        <button className="flex h-8 w-8 items-center justify-center rounded-full bg-primary shadow-md shadow-primary/30 text-sm font-semibold text-white transition-smooth hover:opacity-90 active:scale-95">
          <User className="h-4 w-4" />
          <span className="sr-only">Profile</span>
        </button>
      </div>
    </header>
  )
}
