"use client"

import { cn } from "@/lib/utils"
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
  activeTab: string
  onTabChange: (tab: string) => void
  onCreatePost: () => void
}

const navItems = [
  { id: "search", label: "Search", icon: Search },
  { id: "home", label: "Home", icon: Home },
  { id: "feed", label: "Feed", icon: Rss },
  { id: "explore", label: "Explore", icon: Compass },
]

const libraryItems = [
  { id: "library", label: "Library", icon: BookOpen },
]

export function Sidebar({ activeTab, onTabChange, onCreatePost }: SidebarProps) {
  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 bg-sidebar border-r border-sidebar-border">
      <div className="flex h-full flex-col px-4 py-7">
        {/* Logo */}
        <div className="mb-9 flex items-center gap-3 px-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/30">
            <BookOpen className="h-4 w-4 text-white" />
          </div>
          <span className="text-[17px] font-semibold tracking-tight text-foreground">
            Blogify
          </span>
        </div>

        {/* Main Navigation */}
        <nav className="flex-1 space-y-0.5">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = activeTab === item.id
            return (
              <button
                key={item.id}
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

          {/* Divider */}
          <div className="my-5 h-px bg-sidebar-border" />

          {/* Library Section */}
          <p className="mb-1.5 px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">
            Library
          </p>
          {libraryItems.map((item) => {
            const Icon = item.icon
            const isActive = activeTab === item.id
            return (
              <button
                key={item.id}
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

        {/* Bottom Actions */}
        <div className="space-y-1.5 pt-4 border-t border-sidebar-border">
          <button
            onClick={onCreatePost}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-primary px-4 py-2.5 text-[13px] font-semibold text-white shadow-md shadow-primary/25 transition-smooth hover:opacity-90 active:scale-95"
          >
            <PenSquare className="h-4 w-4" />
            New Post
          </button>
          <button
            onClick={() => onTabChange("settings")}
            className={cn(
              "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium transition-smooth",
              activeTab === "settings"
                ? "bg-sidebar-accent text-primary"
                : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground"
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
