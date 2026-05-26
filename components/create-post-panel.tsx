"use client"

import { Bold, Italic, List } from "lucide-react"
import { useState } from "react"
import { useIsMobile } from "@/hooks/use-mobile"
import { PostMediaInput } from "@/components/post-media-input"
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
} from "@/components/ui/drawer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  DEFAULT_CATEGORY_ID,
  PUBLICATION_CATEGORIES,
  type CategoryId,
} from "@/lib/categories"
import type { PostMedia } from "@/lib/post-media"

interface CreatePostPanelProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (post: {
    title: string
    content: string
    category: string
    media?: PostMedia | null
  }) => void | Promise<void>
  isSubmitting?: boolean
}

export function CreatePostPanel({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting = false,
}: CreatePostPanelProps) {
  const isMobile = useIsMobile()
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [category, setCategory] = useState<CategoryId>(DEFAULT_CATEGORY_ID)
  const [media, setMedia] = useState<PostMedia | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !content.trim() || isSubmitting) return
    await onSubmit({ title, content, category, media })
    setTitle("")
    setContent("")
    setCategory(DEFAULT_CATEGORY_ID)
    setMedia(null)
  }

  const isValid = title.trim().length > 0 && content.trim().length > 0

  return (
    <Drawer
      open={isOpen}
      onOpenChange={(open) => !open && onClose()}
      direction={isMobile ? "bottom" : "right"}
    >
      <DrawerContent className="bg-card">
        <form onSubmit={handleSubmit} className="flex max-h-[90vh] flex-col md:max-h-none md:h-full">
          <DrawerHeader className="border-b border-border text-left">
            <DrawerTitle className="text-[20px] font-semibold">New Post</DrawerTitle>
          </DrawerHeader>

          <div className="flex-1 overflow-y-auto p-4 md:p-6">
            <div className="mb-5">
              <label htmlFor="title" className="mb-2 block text-[13px] font-medium text-muted-foreground">
                Title
              </label>
              <Input
                id="title"
                variant="ios"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter a compelling title..."
              />
            </div>

            <div className="mb-5">
              <label className="mb-2 block text-[13px] font-medium text-muted-foreground">
                Category
              </label>
              <div className="flex flex-wrap gap-2">
                {PUBLICATION_CATEGORIES.map((cat) => (
                  <Button
                    key={cat.id}
                    type="button"
                    variant={category === cat.id ? "default" : "ios"}
                    size="sm"
                    onClick={() => setCategory(cat.id)}
                    className={cat.flag ? "gap-1.5" : undefined}
                  >
                    {cat.flag ? (
                      <span className="text-base leading-none" aria-hidden>
                        {cat.flag}
                      </span>
                    ) : null}
                    <span>{cat.pillar}</span>
                  </Button>
                ))}
              </div>
            </div>

            <div className="mb-5">
              <label htmlFor="content" className="mb-2 block text-[13px] font-medium text-muted-foreground">
                Content
              </label>
              <div className="mb-2 flex items-center gap-1 rounded-t-2xl border border-b-0 border-border bg-ios-fill-secondary px-3 py-2">
                <Button type="button" variant="ghost" size="icon-sm" aria-label="Bold">
                  <Bold className="h-4 w-4" />
                </Button>
                <Button type="button" variant="ghost" size="icon-sm" aria-label="Italic">
                  <Italic className="h-4 w-4" />
                </Button>
                <Button type="button" variant="ghost" size="icon-sm" aria-label="List">
                  <List className="h-4 w-4" />
                </Button>
                <div className="mx-1 h-5 w-px bg-border" />
              </div>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your thoughts here..."
                rows={10}
                className="min-h-[200px] rounded-t-none rounded-b-2xl border-border bg-ios-fill text-[17px] focus-visible:ring-ring/30"
              />
            </div>

            <div>
              <label className="mb-2 block text-[13px] font-medium text-muted-foreground">
                Media
              </label>
              <PostMediaInput
                value={media}
                onChange={setMedia}
                disabled={isSubmitting}
              />
            </div>
          </div>

          <DrawerFooter className="flex-row justify-end gap-2 border-t border-border">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={!isValid || isSubmitting}>
              {isSubmitting ? "Publishing…" : "Publish"}
            </Button>
          </DrawerFooter>
        </form>
      </DrawerContent>
    </Drawer>
  )
}
