"use client"

import { useState, useMemo } from "react"
import { Sidebar } from "@/components/sidebar"
import { SearchHeader } from "@/components/search-header"
import { BlogCard, type BlogPost } from "@/components/blog-card"
import { CreatePostPanel } from "@/components/create-post-panel"
import { CategoryCards } from "@/components/category-cards"
import { mockPosts } from "@/lib/mock-data"

export default function Home() {
  const [activeTab, setActiveTab] = useState("home")
  const [searchQuery, setSearchQuery] = useState("")
  const [isPanelOpen, setIsPanelOpen] = useState(false)
  const [posts, setPosts] = useState<BlogPost[]>(mockPosts)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  // Filter posts based on search query and category
  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      const matchesSearch =
        searchQuery === "" ||
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.author.name.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesCategory =
        selectedCategory === null ||
        post.category.toLowerCase() === selectedCategory.toLowerCase()

      return matchesSearch && matchesCategory
    })
  }, [posts, searchQuery, selectedCategory])

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
    setPosts((prev) =>
      prev.map((post) =>
        post.id === id
          ? { ...post, isBookmarked: !post.isBookmarked }
          : post
      )
    )
  }

  const handleCreatePost = (newPost: {
    title: string
    content: string
    category: string
  }) => {
    const post: BlogPost = {
      id: String(Date.now()),
      title: newPost.title,
      excerpt: newPost.content.slice(0, 150) + "...",
      author: {
        name: "You",
        avatar:
          "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop",
      },
      coverImage:
        "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&h=500&fit=crop",
      category: newPost.category,
      readTime: `${Math.ceil(newPost.content.split(" ").length / 200)} min read`,
      likes: 0,
      comments: 0,
      createdAt: new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      isLiked: false,
      isBookmarked: false,
    }
    setPosts((prev) => [post, ...prev])
  }

  const handleCategorySelect = (category: string) => {
    setSelectedCategory((prev) => (prev === category ? null : category))
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onCreatePost={() => setIsPanelOpen(true)}
      />

      {/* Main Content */}
      <main className="ml-64">
        <SearchHeader
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        {/* Ambient gradient hero zone */}
        <div className="ambient-gradient">
        <div className="px-8 py-8">
          {/* Category Cards - Apple Music Style */}
          <CategoryCards
            onCategorySelect={handleCategorySelect}
            selectedCategory={selectedCategory}
          />

          {/* Posts Section */}
          <section>
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-[22px] font-bold tracking-tight text-foreground">
                  {selectedCategory
                    ? `${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} Posts`
                    : "Latest Posts"}
                </h2>
                <p className="mt-1 text-[13px] text-muted-foreground">
                  {filteredPosts.length} posts found
                </p>
              </div>
              {selectedCategory && (
                <button
                  onClick={() => setSelectedCategory(null)}
                  className="rounded-full bg-white/[0.08] px-4 py-2 text-[13px] font-medium text-foreground/80 transition-smooth hover:bg-white/[0.12]"
                >
                  Clear Filter
                </button>
              )}
            </div>

            {/* Posts Grid */}
            {filteredPosts.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filteredPosts.map((post) => (
                  <BlogCard
                    key={post.id}
                    post={post}
                    onLike={handleLike}
                    onBookmark={handleBookmark}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/[0.1] bg-white/[0.02] py-16">
                <div className="mb-4 rounded-full bg-white/[0.06] p-4">
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
                  No posts found
                </h3>
                <p className="text-sm text-muted-foreground">
                  Try adjusting your search or filter criteria
                </p>
              </div>
            )}
          </section>
        </div>
        </div>
      </main>

      {/* Create Post Panel */}
      <CreatePostPanel
        isOpen={isPanelOpen}
        onClose={() => setIsPanelOpen(false)}
        onSubmit={handleCreatePost}
      />
    </div>
  )
}
