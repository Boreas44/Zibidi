"use client"

import { useState, useMemo, useRef, useEffect, useCallback } from "react"
import { Search } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { Sidebar } from "@/components/sidebar"
import { SearchHeader } from "@/components/search-header"
import { BlogCard, type BlogPost } from "@/components/blog-card"
import { CreatePostPanel } from "@/components/create-post-panel"
import { SettingsPanel } from "@/components/settings-panel"
import { ProfilePanel } from "@/components/profile-panel"
import { AuthPanel } from "@/components/auth-panel"
import { CategoryCards } from "@/components/category-cards"
import { IosTabBar } from "@/components/ios/ios-tab-bar"
import { createPostAction, deletePostAction } from "@/app/actions/posts"
import { TAB_META, type AppTab } from "@/lib/tabs"
import type { AppProfile } from "@/lib/auth/server"

interface HomePageProps {
  initialPosts: BlogPost[]
  user: AppProfile | null
}

function matchesSearch(post: BlogPost, query: string): boolean {
  if (!query) return true
  const q = query.toLowerCase()
  return (
    post.title.toLowerCase().includes(q) ||
    post.excerpt.toLowerCase().includes(q) ||
    post.author.name.toLowerCase().includes(q) ||
    post.category.toLowerCase().includes(q)
  )
}

export function HomePage({ initialPosts, user }: HomePageProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<AppTab>("home")
  const [searchQuery, setSearchQuery] = useState("")
  const [isPanelOpen, setIsPanelOpen] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [isAuthOpen, setIsAuthOpen] = useState(false)
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [deletingPostId, setDeletingPostId] = useState<string | null>(null)
  const [posts, setPosts] = useState<BlogPost[]>(initialPosts)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  const handleTabChange = useCallback((tab: AppTab) => {
    setActiveTab(tab)
    if (tab !== "home" && tab !== "explore") {
      setSelectedCategory(null)
    }
  }, [])

  useEffect(() => {
    if (activeTab === "search") {
      const t = setTimeout(() => searchInputRef.current?.focus(), 100)
      return () => clearTimeout(t)
    }
  }, [activeTab])

  const openAuth = (mode: "signin" | "signup" = "signin") => {
    setAuthMode(mode)
    setIsAuthOpen(true)
  }

  const openProfile = () => {
    if (user) {
      setIsProfileOpen(true)
    } else {
      openAuth("signin")
    }
  }

  const tryOpenCreatePost = () => {
    if (!user) {
      toast.error("Sign in to create a post")
      openAuth("signup")
      return
    }
    setIsPanelOpen(true)
  }

  const myPostCount = useMemo(
    () =>
      user
        ? posts.filter((p) => p.userId === user.id).length
        : 0,
    [posts, user]
  )
  const savedCount = useMemo(
    () => posts.filter((p) => p.isBookmarked).length,
    [posts]
  )

  const tabPosts = useMemo(() => {
    let list = [...posts]

    if (activeTab === "library") {
      list = list.filter((p) => p.isBookmarked)
    }

    if (activeTab === "search" && !searchQuery.trim()) {
      return []
    }

    list = list.filter((p) => matchesSearch(p, searchQuery))

    if (
      selectedCategory &&
      (activeTab === "home" || activeTab === "explore")
    ) {
      list = list.filter(
        (p) => p.category.toLowerCase() === selectedCategory.toLowerCase()
      )
    }

    if (activeTab === "feed") {
      list = [...list].reverse()
    }

    return list
  }, [posts, activeTab, searchQuery, selectedCategory])

  const meta = TAB_META[activeTab]
  const sectionTitle =
    selectedCategory && (activeTab === "home" || activeTab === "explore")
      ? `${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)}`
      : meta.title

  const handleLike = (id: string) => {
    setPosts((prev) =>
      prev.map((post) =>
        post.id === id
          ? {
              ...post,
              isLiked: !post.isLiked,
              likes: post.isLiked ? post.likes - 1 : post.likes + 1,
            }
          : post
      )
    )
  }

  const handleBookmark = (id: string) => {
    if (!user) {
      toast.error("Sign in to save posts")
      openAuth("signin")
      return
    }
    setPosts((prev) =>
      prev.map((post) =>
        post.id === id
          ? { ...post, isBookmarked: !post.isBookmarked }
          : post
      )
    )
  }

  const handleDeletePost = async (postId: string) => {
    if (!user) {
      toast.error("Sign in to delete a post")
      openAuth("signin")
      return
    }
    setDeletingPostId(postId)
    try {
      const result = await deletePostAction(postId)
      if (result.success) {
        setPosts((prev) => prev.filter((p) => p.id !== postId))
        toast.success("Post deleted")
        router.refresh()
      } else {
        toast.error(result.error)
      }
    } catch {
      toast.error("Could not delete post.")
    } finally {
      setDeletingPostId(null)
    }
  }

  const handleCreatePost = async (newPost: {
    title: string
    content: string
    category: string
  }) => {
    setIsSubmitting(true)
    try {
      const result = await createPostAction(newPost)
      if (result.success) {
        setPosts((prev) => [result.post, ...prev])
        setIsPanelOpen(false)
        setActiveTab("home")
        toast.success("Post published")
        router.refresh()
      } else {
        toast.error(result.error)
      }
    } catch {
      toast.error("Something went wrong. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCategorySelect = (category: string) => {
    setSelectedCategory((prev) => (prev === category ? null : category))
    if (activeTab !== "explore") {
      setActiveTab("explore")
    }
  }

  const showCategories = activeTab === "home" || activeTab === "explore"
  const showSearchHero = activeTab === "search" && !searchQuery.trim()

  return (
    <div className="min-h-screen bg-background">
      <Sidebar
        activeTab={activeTab}
        onTabChange={handleTabChange}
        onCreatePost={tryOpenCreatePost}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenProfile={openProfile}
        user={user}
      />

      <main className="pb-24 md:ml-64 md:pb-0">
        <SearchHeader
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          searchInputRef={searchInputRef}
          autoFocusSearch={activeTab === "search"}
          onOpenProfile={openProfile}
          user={user}
        />

        <div className="ambient-gradient">
          <div className="px-4 py-6 md:px-8 md:py-8">
            {showSearchHero && (
              <div className="mb-8 flex flex-col items-center justify-center rounded-2xl border border-border bg-ios-fill-secondary py-14 text-center">
                <div className="mb-4 rounded-full bg-ios-fill p-5">
                  <Search className="h-10 w-10 text-primary" />
                </div>
                <h2 className="text-[22px] font-bold text-foreground">
                  {meta.emptyTitle}
                </h2>
                <p className="mt-2 max-w-sm text-[15px] text-muted-foreground">
                  {meta.emptyHint}
                </p>
              </div>
            )}

            {showCategories && (
              <CategoryCards
                onCategorySelect={handleCategorySelect}
                selectedCategory={selectedCategory}
              />
            )}

            {!showSearchHero && (
              <section>
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <h2 className="text-[22px] font-bold tracking-tight text-foreground">
                      {sectionTitle}
                    </h2>
                    <p className="mt-1 text-[13px] text-muted-foreground">
                      {tabPosts.length} posts
                      {activeTab === "feed" ? " in your feed" : ""}
                    </p>
                  </div>
                  {selectedCategory &&
                    (activeTab === "home" || activeTab === "explore") && (
                      <button
                        type="button"
                        onClick={() => setSelectedCategory(null)}
                        className="rounded-full bg-ios-fill px-4 py-2 text-[13px] font-medium text-foreground/80 transition-smooth hover:bg-accent"
                      >
                        Clear Filter
                      </button>
                    )}
                </div>

                {tabPosts.length > 0 ? (
                  <div
                    className={
                      activeTab === "feed"
                        ? "flex flex-col gap-4"
                        : "grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                    }
                  >
                    {tabPosts.map((post) => (
                      <BlogCard
                        key={post.id}
                        post={post}
                        isOwner={!!user?.id && post.userId === user.id}
                        onLike={handleLike}
                        onBookmark={handleBookmark}
                        onDelete={handleDeletePost}
                        isDeleting={deletingPostId === post.id}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-ios-fill-secondary py-16">
                    <div className="mb-4 rounded-full bg-ios-fill p-4">
                      <svg
                        className="h-8 w-8 text-muted-foreground"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <h3 className="mb-1 text-lg font-semibold text-foreground">
                      {meta.emptyTitle}
                    </h3>
                    <p className="text-center text-sm text-muted-foreground">
                      {meta.emptyHint}
                    </p>
                  </div>
                )}
              </section>
            )}
          </div>
        </div>
      </main>

      <CreatePostPanel
        isOpen={isPanelOpen}
        onClose={() => setIsPanelOpen(false)}
        onSubmit={handleCreatePost}
        isSubmitting={isSubmitting}
      />

      <AuthPanel
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        defaultMode={authMode}
      />

      <ProfilePanel
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        onOpenSettings={() => {
          setIsProfileOpen(false)
          setIsSettingsOpen(true)
        }}
        onOpenAuth={openAuth}
        user={user}
        postCount={myPostCount}
        savedCount={savedCount}
        onViewLibrary={() => setActiveTab("library")}
      />

      <SettingsPanel
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      <IosTabBar
        activeTab={activeTab}
        onTabChange={handleTabChange}
        onCreatePost={tryOpenCreatePost}
      />
    </div>
  )
}
