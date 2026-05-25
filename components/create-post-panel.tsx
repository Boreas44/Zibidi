"use client"

import { X, Image as ImageIcon, Link2, Bold, Italic, List } from "lucide-react"
import { useState, useEffect, useRef } from "react"

interface CreatePostPanelProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (post: { title: string; content: string; category: string }) => void
}

const categories = [
  "Technology",
  "Design",
  "Development",
  "Lifestyle",
  "Business",
  "Travel",
]

export function CreatePostPanel({ isOpen, onClose, onSubmit }: CreatePostPanelProps) {
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [category, setCategory] = useState(categories[0])
  const panelRef = useRef<HTMLDivElement>(null)

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose()
      }
    }
    document.addEventListener("keydown", handleEscape)
    return () => document.removeEventListener("keydown", handleEscape)
  }, [isOpen, onClose])

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node) && isOpen) {
        onClose()
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [isOpen, onClose])

  // Lock body scroll when panel is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [isOpen])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (title.trim() && content.trim()) {
      onSubmit({ title, content, category })
      setTitle("")
      setContent("")
      setCategory(categories[0])
      onClose()
    }
  }

  const isValid = title.trim().length > 0 && content.trim().length > 0

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      {/* Slide-in Panel */}
      <div
        ref={panelRef}
        className={`fixed right-0 top-0 z-50 h-full w-full max-w-xl transform bg-[oklch(0.11_0_0)] border-l border-white/[0.07] shadow-2xl transition-transform duration-300 ease-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <form onSubmit={handleSubmit} className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/[0.07] px-6 py-4">
            <h2 className="text-xl font-semibold text-foreground">Create New Post</h2>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full p-2 text-muted-foreground transition-smooth hover:bg-accent hover:text-foreground"
            >
              <X className="h-5 w-5" />
              <span className="sr-only">Close panel</span>
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {/* Title Input */}
            <div className="mb-6">
              <label
                htmlFor="title"
                className="mb-2 block text-sm font-medium text-foreground"
              >
                Title
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter a compelling title..."
                className="w-full rounded-xl border border-white/[0.08] bg-white/[0.06] px-4 py-3 text-foreground placeholder:text-muted-foreground transition-smooth focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            {/* Category Select */}
            <div className="mb-6">
              <label
                htmlFor="category"
                className="mb-2 block text-sm font-medium text-foreground"
              >
                Category
              </label>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={`rounded-full px-4 py-2 text-sm font-medium transition-smooth ${
                      category === cat
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-secondary-foreground hover:bg-accent"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Content Editor */}
            <div className="mb-6">
              <label
                htmlFor="content"
                className="mb-2 block text-sm font-medium text-foreground"
              >
                Content
              </label>
              {/* Toolbar */}
              <div className="mb-2 flex items-center gap-1 rounded-t-xl border border-b-0 border-white/[0.08] bg-white/[0.04] px-3 py-2">
                <button
                  type="button"
                  className="rounded-lg p-2 text-muted-foreground transition-smooth hover:bg-accent hover:text-foreground"
                >
                  <Bold className="h-4 w-4" />
                  <span className="sr-only">Bold</span>
                </button>
                <button
                  type="button"
                  className="rounded-lg p-2 text-muted-foreground transition-smooth hover:bg-accent hover:text-foreground"
                >
                  <Italic className="h-4 w-4" />
                  <span className="sr-only">Italic</span>
                </button>
                <button
                  type="button"
                  className="rounded-lg p-2 text-muted-foreground transition-smooth hover:bg-accent hover:text-foreground"
                >
                  <List className="h-4 w-4" />
                  <span className="sr-only">List</span>
                </button>
                <div className="mx-2 h-5 w-px bg-border" />
                <button
                  type="button"
                  className="rounded-lg p-2 text-muted-foreground transition-smooth hover:bg-accent hover:text-foreground"
                >
                  <ImageIcon className="h-4 w-4" />
                  <span className="sr-only">Add image</span>
                </button>
                <button
                  type="button"
                  className="rounded-lg p-2 text-muted-foreground transition-smooth hover:bg-accent hover:text-foreground"
                >
                  <Link2 className="h-4 w-4" />
                  <span className="sr-only">Add link</span>
                </button>
              </div>
              <textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your thoughts here..."
                rows={12}
                className="w-full rounded-b-xl border border-white/[0.08] bg-white/[0.06] px-4 py-3 text-foreground placeholder:text-muted-foreground transition-smooth focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            {/* Cover Image Upload */}
            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">
                Cover Image
              </label>
              <div className="flex h-32 cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-white/[0.1] bg-white/[0.03] transition-smooth hover:border-primary/40 hover:bg-white/[0.06]">
                <div className="text-center">
                  <ImageIcon className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Click to upload or drag and drop
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 border-t border-white/[0.07] px-6 py-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full px-5 py-2.5 text-sm font-medium text-muted-foreground transition-smooth hover:bg-accent hover:text-foreground"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!isValid}
              className="rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-smooth hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Publish Post
            </button>
          </div>
        </form>
      </div>
    </>
  )
}
