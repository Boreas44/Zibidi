"use client"

import { useState, useMemo, useRef, useEffect, useCallback } from "react"
import { Search } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { Sidebar } from "@/components/sidebar"
import { SearchHeader } from "@/components/search-header"
import { BlogCard, type BlogPost } from "@/components/blog-card"
import { CreatePostPanel } from "@/components/create-post-panel"
import { PostCommentsOverlay } from "@/components/post-comments-overlay"
import { SettingsPanel } from "@/components/settings-panel"
import { ProfilePanel } from "@/components/profile-panel"
import { AuthPanel } from "@/components/auth-panel"
import { CategoryCards } from "@/components/category-cards"
import { IosTabBar } from "@/components/ios/ios-tab-bar"
import { togglePostReactionAction } from "@/app/actions/reactions"
import { toggleSavedPostAction } from "@/app/actions/saved-posts"
import { createPostAction, deletePostAction } from "@/app/actions/posts"
import type { PostMedia } from "@/lib/post-media"
import type { PostReactionKind } from "@/lib/post-reactions"
import {
  computeOptimisticReaction,
  snapshotFromPost,
} from "@/lib/reaction-optimistic"
import {
  getCategoryTagline,
  getCategoryTitle,
  postMatchesCategory,
} from "@/lib/categories"
import { TAB_META, type AppTab } from "@/lib/tabs"
import type { AppProfile } from "@/lib/auth/server"

export interface HomePageProps {
  initialPosts: BlogPost[]
  user: AppProfile | null
}

function matchesSearch(post: BlogPost, query: string): boolean {
  if (!query) return true
  const q = query.toLowerCase()
  const pillar = getCategoryTitle(post.category).toLowerCase()
  const tagline = getCategoryTagline(post.category)?.toLowerCase() ?? ""
  return (
    post.title.toLowerCase().includes(q) ||
    post.excerpt.toLowerCase().includes(q) ||
    post.author.name.toLowerCase().includes(q) ||
    post.category.toLowerCase().includes(q) ||
    pillar.includes(q) ||
    tagline.includes(q)
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
  const [commentsPost, setCommentsPost] = useState<BlogPost | null>(null)
  const reactionRequestSeq = useRef<Record<string, number>>({})
  const [posts, setPosts] = useState<BlogPost[]>(initialPosts)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  useEffect(() => {
    setPosts(initialPosts)
  }, [initialPosts])

  useEffect(() => {
    if (!user) return
    const author = {
      name: user.displayName,
      avatar: user.avatarUrl ?? "",
    }
    setPosts((prev) =>
      prev.map((post) =>
        post.userId === user.id ? { ...post, author } : post
      )
    )
    setCommentsPost((prev) =>
      prev?.userId === user.id ? { ...prev, author } : prev
    )
  }, [user?.id, user?.displayName, user?.avatarUrl])

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
      list = list.filter((p) => postMatchesCategory(p.category, selectedCategory))
    }

    if (activeTab === "feed") {
      list = [...list].reverse()
    }

    return list
  }, [posts, activeTab, searchQuery, selectedCategory])

  const meta = TAB_META[activeTab]
  const filteredCategoryTagline =
    selectedCategory && (activeTab === "home" || activeTab === "explore")
      ? getCategoryTagline(selectedCategory)
      : null
  const sectionTitle =
    selectedCategory && (activeTab === "home" || activeTab === "explore")
      ? getCategoryTitle(selectedCategory)
      : meta.title

  const applyPostReactionState = useCallback(
    (
      postId: string,
      state: {
        likes: number
        dislikes: number
        userReaction: PostReactionKind | null
      }
    ) => {
      setPosts((prev) =>
        prev.map((post) =>
          post.id === postId
            ? {
                ...post,
                likes: state.likes,
                dislikes: state.dislikes,
                isLiked: state.userReaction === "like",
                isDisliked: state.userReaction === "dislike",
              }
            : post
        )
      )
    },
    []
  )

  const handleReaction = (postId: string, reaction: PostReactionKind) => {
    if (!user) {
      toast.error("Sign in to react to posts")
      openAuth("signin")
      return
    }

    let rollback: ReturnType<typeof snapshotFromPost> | null = null

    setPosts((prev) => {
      const post = prev.find((p) => p.id === postId)
      if (!post) return prev

      rollback = snapshotFromPost(post)
      const next = computeOptimisticReaction(post, reaction)
      return prev.map((p) =>
        p.id === postId
          ? {
              ...p,
              likes: next.likes,
              dislikes: next.dislikes,
              isLiked: next.userReaction === "like",
              isDisliked: next.userReaction === "dislike",
            }
          : p
      )
    })

    if (!rollback) return

    const seq = (reactionRequestSeq.current[postId] ?? 0) + 1
    reactionRequestSeq.current[postId] = seq

    void (async () => {
      try {
        const result = await togglePostReactionAction({ postId, reaction })
        if (reactionRequestSeq.current[postId] !== seq) return

        if (result.success) {
          applyPostReactionState(postId, result.state)
        } else {
          const saved = rollback
          setPosts((prev) =>
            prev.map((p) =>
              p.id === postId
                ? {
                    ...p,
                    likes: saved.likes,
                    dislikes: saved.dislikes,
                    isLiked: saved.isLiked,
                    isDisliked: saved.isDisliked,
                  }
                : p
            )
          )
          toast.error(result.error)
        }
      } catch {
        if (reactionRequestSeq.current[postId] !== seq) return
        const saved = rollback
        setPosts((prev) =>
          prev.map((p) =>
            p.id === postId
              ? {
                  ...p,
                  likes: saved.likes,
                  dislikes: saved.dislikes,
                  isLiked: saved.isLiked,
                  isDisliked: saved.isDisliked,
                }
              : p
          )
        )
        toast.error("Could not update reaction.")
      }
    })()
  }

  const handleLike = (id: string) => {
    handleReaction(id, "like")
  }

  const handleDislike = (id: string) => {
    handleReaction(id, "dislike")
  }

  const openPost = useCallback(
    (post: BlogPost) => {
      router.push(`/post/${post.id}`)
    },
    [router]
  )

  const openPostComments = useCallback((post: BlogPost) => {
    setCommentsPost(post)
  }, [])

  const handleCommentCountChange = useCallback((postId: string, count: number) => {
    setPosts((prev) =>
      prev.map((p) => (p.id === postId && p.comments !== count ? { ...p, comments: count } : p))
    )
    setCommentsPost((prev) => {
      if (!prev || prev.id !== postId || prev.comments === count) return prev
      return { ...prev, comments: count }
    })
  }, [])

  const handleOverlayPostChange = useCallback((updated: BlogPost) => {
    setPosts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)))
    setCommentsPost(updated)
  }, [])

  const handleBookmark = (id: string) => {
    if (!user) {
      toast.error("Sign in to save posts")
      openAuth("signin")
      return
    }

    const current = posts.find((p) => p.id === id)
    if (!current) return

    const previous = current.isBookmarked
    const optimistic = !previous

    setPosts((prev) =>
      prev.map((post) =>
        post.id === id ? { ...post, isBookmarked: optimistic } : post
      )
    )
    setCommentsPost((prev) =>
      prev?.id === id ? { ...prev, isBookmarked: optimistic } : prev
    )

    void (async () => {
      try {
        const result = await toggleSavedPostAction({ postId: id })
        if (!result.success) {
          setPosts((prev) =>
            prev.map((post) =>
              post.id === id ? { ...post, isBookmarked: previous } : post
            )
          )
          setCommentsPost((prev) =>
            prev?.id === id ? { ...prev, isBookmarked: previous } : prev
          )
          toast.error(result.error)
          return
        }
        setPosts((prev) =>
          prev.map((post) =>
            post.id === id ? { ...post, isBookmarked: result.saved } : post
          )
        )
        setCommentsPost((prev) =>
          prev?.id === id ? { ...prev, isBookmarked: result.saved } : prev
        )
        toast.success(result.saved ? "Post saved to Library" : "Removed from Library")
      } catch {
        setPosts((prev) =>
          prev.map((post) =>
            post.id === id ? { ...post, isBookmarked: previous } : post
          )
        )
        setCommentsPost((prev) =>
          prev?.id === id ? { ...prev, isBookmarked: previous } : prev
        )
        toast.error("Could not update saved post.")
      }
    })()
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
    media?: PostMedia | null
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
                    {filteredCategoryTagline ? (
                      <p className="mt-0.5 text-[13px] text-muted-foreground">
                        {filteredCategoryTagline}
                      </p>
                    ) : null}
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
                        onOpen={openPost}
                        onLike={handleLike}
                        onDislike={handleDislike}
                        onComment={openPostComments}
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

      <PostCommentsOverlay
        post={commentsPost}
        isOpen={!!commentsPost}
        onClose={() => setCommentsPost(null)}
        user={user}
        onOpenAuth={openAuth}
        onPostChange={handleOverlayPostChange}
        onCommentCountChange={handleCommentCountChange}
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
