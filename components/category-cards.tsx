"use client"

interface CategoryCardsProps {
  onCategorySelect: (category: string) => void
  selectedCategory: string | null
}

const categories = [
  {
    id: "technology",
    name: "Technology",
    gradient: "from-[#f7971e] via-[#ffd200] to-[#f7971e]",
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&h=200&fit=crop",
  },
  {
    id: "design",
    name: "Design",
    gradient: "from-[#a18cd1] via-[#fbc2eb] to-[#a18cd1]",
    image: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=200&fit=crop",
  },
  {
    id: "development",
    name: "Development",
    gradient: "from-[#11998e] via-[#38ef7d] to-[#11998e]",
    image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&h=200&fit=crop",
  },
  {
    id: "lifestyle",
    name: "Lifestyle",
    gradient: "from-[#f093fb] via-[#f5576c] to-[#f093fb]",
    image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400&h=200&fit=crop",
  },
  {
    id: "business",
    name: "Business",
    gradient: "from-[#4facfe] via-[#00f2fe] to-[#4facfe]",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=200&fit=crop",
  },
  {
    id: "travel",
    name: "Travel",
    gradient: "from-[#fd746c] via-[#ff9068] to-[#fd746c]",
    image: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&h=200&fit=crop",
  },
]

export function CategoryCards({ onCategorySelect, selectedCategory }: CategoryCardsProps) {
  return (
    <section className="mb-10">
      <h2 className="mb-5 text-[22px] font-bold tracking-tight text-foreground">Browse Categories</h2>
      <div className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-none md:grid md:grid-cols-3 md:overflow-visible lg:grid-cols-4 xl:grid-cols-6">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => onCategorySelect(category.id)}
            className={`group relative aspect-[4/3] w-[42vw] shrink-0 snap-start overflow-hidden rounded-2xl transition-smooth hover:scale-[1.03] active:scale-[0.98] md:w-auto ${
              selectedCategory === category.id
                ? "ring-2 ring-primary ring-offset-2 ring-offset-background"
                : ""
            }`}
          >
            {/* Background image */}
            <img
              src={category.image}
              alt={category.name}
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            {/* Gradient overlay */}
            <div className={`absolute inset-0 bg-gradient-to-br ${category.gradient} opacity-75`} />
            {/* Darken bottom for text */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />

            <div className="absolute inset-0 flex items-end p-3.5">
              <span className="text-[13px] font-semibold text-white drop-shadow-sm leading-none">
                {category.name}
              </span>
            </div>
          </button>
        ))}
      </div>
    </section>
  )
}
