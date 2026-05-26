"use client"

import { useRef, useState } from "react"
import { PUBLICATION_CATEGORIES } from "@/lib/categories"

interface CategoryCardsProps {
  onCategorySelect: (category: string) => void
  selectedCategory: string | null
}

export function CategoryCards({ onCategorySelect, selectedCategory }: CategoryCardsProps) {
  const videoRefs = useRef<Record<string, HTMLVideoElement | null>>({})
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  const handleMouseEnter = (id: string) => {
    setHoveredId(id)
    const v = videoRefs.current[id]
    if (v) v.play().catch(() => {})
  }

  const handleMouseLeave = (id: string) => {
    setHoveredId(null)
    const v = videoRefs.current[id]
    if (v) {
      v.pause()
      v.currentTime = 0
    }
  }

  return (
    <section className="mb-10">
      <h2 className="mb-5 text-[22px] font-bold tracking-tight text-foreground">
        Browse Categories
      </h2>
      <div className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-none md:grid md:grid-cols-3 md:overflow-visible lg:grid-cols-3 xl:grid-cols-6">
        {PUBLICATION_CATEGORIES.map((category) => (
          <button
            key={category.id}
            onClick={() => onCategorySelect(category.id)}
            onMouseEnter={() => handleMouseEnter(category.id)}
            onMouseLeave={() => handleMouseLeave(category.id)}
            className={`group relative aspect-[4/3] w-[42vw] shrink-0 snap-start overflow-hidden rounded-2xl transition-smooth hover:scale-[1.03] active:scale-[0.98] md:w-auto ${
              selectedCategory === category.id
                ? "ring-2 ring-primary ring-offset-2 ring-offset-background"
                : ""
            }`}
          >
            {category.video ? (
              <video
                ref={(el) => { videoRefs.current[category.id] = el }}
                src={category.video}
                poster={category.image}
                muted
                playsInline
                loop
                preload="metadata"
                className="absolute inset-0 h-full w-full object-cover"
              />
            ) : category.gif ? (
              <img
                key={hoveredId === category.id ? `${category.id}-hover` : category.id}
                src={hoveredId === category.id ? category.gif : category.image}
                alt={category.pillar}
                className="absolute inset-0 h-full w-full object-cover"
              />
            ) : (
              <img
                src={category.image}
                alt={category.pillar}
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
            )}
            <div
              className={`absolute inset-0 bg-gradient-to-br ${category.gradient} opacity-45`}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/25 to-transparent" />

            <div className="absolute inset-0 flex flex-col items-start justify-end p-3.5 text-left">
              {category.flag ? (
                <span
                  className="mb-1 text-[22px] leading-none drop-shadow-sm"
                  role="img"
                  aria-label={category.pillar}
                >
                  {category.flag}
                </span>
              ) : null}
              <span className="text-[14px] font-semibold leading-tight text-white drop-shadow-sm">
                {category.pillar}
              </span>
              <span className="mt-0.5 text-[11px] font-medium leading-snug text-white/75">
                {category.title}
              </span>
            </div>
          </button>
        ))}
      </div>
    </section>
  )
}
