"use client"

import { cn } from "@/lib/utils"
import type { AppTab } from "@/lib/tabs"
import type { AppProfile } from "@/lib/auth/server"
import { UserAvatar } from "@/components/user-avatar"
import {
  Search,
  Home,
  Compass,
  Rss,
  BookOpen,
  PenSquare,
  Settings,
} from "lucide-react"

interface SidebarProps {
  activeTab: AppTab
  onTabChange: (tab: AppTab) => void
  onCreatePost: () => void
  onOpenSettings: () => void
  onOpenProfile: () => void
  user?: AppProfile | null
}

const navItems: { id: AppTab; label: string; icon: typeof Search }[] = [
  { id: "search", label: "Search", icon: Search },
  { id: "home", label: "Home", icon: Home },
  { id: "feed", label: "Feed", icon: Rss },
  { id: "explore", label: "Explore", icon: Compass },
]

const libraryItems: { id: AppTab; label: string; icon: typeof BookOpen }[] = [
  { id: "library", label: "Library", icon: BookOpen },
]

export function Sidebar({
  activeTab,
  onTabChange,
  onCreatePost,
  onOpenSettings,
  onOpenProfile,
  user,
}: SidebarProps) {
  return (
    <aside className="fixed left-0 top-0 z-40 hidden h-screen w-64 border-r border-sidebar-border bg-sidebar md:block">
      <div className="flex h-full flex-col px-4 py-7">
        <div className="mb-9 flex items-center gap-3 px-2">
          {/* h-9 slot — wide logo, no crop/round */}
          <img
            src="/LOGO.png"
            alt="Zibidi"
            width={120}
            height={36}
            className="h-9 w-auto shrink-0 object-contain object-left"
            decoding="async"
          />
          <span className="text-[17px] font-semibold tracking-tight text-foreground">
            Zibidi
          </span>
        </div>

        <nav className="flex-1 space-y-0.5">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = activeTab === item.id
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onTabChange(item.id)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium transition-smooth",
                  isActive
                    ? "bg-sidebar-accent text-primary"
                    : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground"
                )}
              >
                <Icon className={cn("h-[18px] w-[18px]", isActive ? "text-primary" : "")} />
                {item.label}
              </button>
            )
          })}

          <div className="my-5 h-px bg-sidebar-border" />

          <p className="mb-1.5 px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">
            Library
          </p>
          {libraryItems.map((item) => {
            const Icon = item.icon
            const isActive = activeTab === item.id
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onTabChange(item.id)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium transition-smooth",
                  isActive
                    ? "bg-sidebar-accent text-primary"
                    : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground"
                )}
              >
                <Icon className={cn("h-[18px] w-[18px]", isActive ? "text-primary" : "")} />
                {item.label}
              </button>
            )
          })}
        </nav>

        <div className="space-y-1.5 border-t border-sidebar-border pt-4">
          <button
            type="button"
            onClick={onOpenProfile}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-smooth hover:bg-sidebar-accent"
          >
            <UserAvatar
              name={user?.displayName ?? "Sign in"}
              avatarUrl={user?.avatarUrl}
              size="sm"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-medium text-foreground">
                {user ? user.displayName : "Sign in"}
              </p>
              <p className="text-[11px] text-muted-foreground">
                {user ? "View account" : "Create account"}
              </p>
            </div>
          </button>
          <button
            type="button"
            onClick={onCreatePost}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-primary px-4 py-2.5 text-[13px] font-semibold text-white shadow-md shadow-primary/25 transition-smooth hover:opacity-90 active:scale-95"
          >
            <PenSquare className="h-4 w-4" />
            New Post
          </button>
          <button
            type="button"
            onClick={onOpenSettings}
            className={cn(
              "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium transition-smooth",
              "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground"
            )}
          >
            <Settings className="h-[18px] w-[18px]" />
            Settings
          </button>
        </div>
      </div>
    </aside>
  )
}
