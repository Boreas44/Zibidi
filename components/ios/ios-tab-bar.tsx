"use client"

import { cn } from "@/lib/utils"
import { Home, Search, Compass, Rss, PenSquare, LucideIcon } from "lucide-react"
import type { AppTab } from "@/lib/tabs"

interface TabItem {
  id: AppTab
  label: string
  icon: LucideIcon
}

const tabs: TabItem[] = [
  { id: "home", label: "Home", icon: Home },
  { id: "feed", label: "Feed", icon: Rss },
  { id: "search", label: "Search", icon: Search },
  { id: "explore", label: "Explore", icon: Compass },
]

interface IosTabBarProps {
  activeTab: AppTab
  onTabChange: (tab: AppTab) => void
  onCreatePost: () => void
}

export function IosTabBar({ activeTab, onTabChange, onCreatePost }: IosTabBarProps) {
  return (
    <nav className="glass fixed bottom-0 left-0 right-0 z-40 border-t border-border md:hidden safe-bottom">
      <div className="flex items-center justify-around px-1 pt-2">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "ios-tap flex min-w-[3.5rem] flex-col items-center gap-0.5 rounded-xl px-2 py-1.5",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
            >
              <Icon
                className={cn("h-6 w-6", isActive && "fill-primary/20")}
                strokeWidth={isActive ? 2.5 : 2}
              />
              <span className="text-[10px] font-medium">{tab.label}</span>
            </button>
          )
        })}
        <button
          type="button"
          onClick={onCreatePost}
          className="ios-tap flex min-w-[3.5rem] flex-col items-center gap-0.5 rounded-xl px-2 py-1.5 text-primary"
        >
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary">
            <PenSquare className="h-3.5 w-3.5 text-primary-foreground" />
          </span>
          <span className="text-[10px] font-medium">New</span>
        </button>
      </div>
    </nav>
  )
}
