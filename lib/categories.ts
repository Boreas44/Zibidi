export type CategoryId = "humor" | "ladies" | "war" | "turkey" | "eu" | "usa"

export type PublicationCategory = {
  id: CategoryId
  /** Main category name (Humor, War, …). */
  pillar: string
  /** Desk / section tagline (Irony Dept., …). */
  title: string
  /** Regional flag emoji for web badges (Türkiye, EU, USA). */
  flag?: string
  gradient: string
  /** Direct MP4 URL — played silently on hover. */
  video?: string
  /** GIF URL — shown on hover, hidden on leave. */
  gif?: string
  /** HTML attribution link for the source of external media. */
  source?: string
}

export const PUBLICATION_CATEGORIES: PublicationCategory[] = [
  {
    id: "humor",
    pillar: "Humor",
    title: "Irony Dept.",
    gradient: "from-[#f7971e] via-[#ffd200] to-[#f7971e]",
    video:
      "https://res.cloudinary.com/dsnwi9kev/video/upload/snaptik_7401777603612396807_v3_xufbi6.mp4",
  },
  {
    id: "ladies",
    pillar: "Ladies",
    title: "Her Signal",
    gradient: "from-[#f093fb] via-[#f5576c] to-[#f093fb]",
    video:
      "https://res.cloudinary.com/dsnwi9kev/video/upload/DieserTrendinHamburgimMai-nineaarttrendsetmefreecantgetyououtofmyheaddance-ezgif.com-mute-video_l9uanh.mp4",
    source:
      '<a href="https://www.vecteezy.com/video/43266874-cheerful-happy-woman-walking-near-ocean-beach-on-vacation">cheerful-happy-woman-walking-near-ocean-beach-on-vacation Stock Videos by Vecteezy</a>',
  },
  {
    id: "war",
    pillar: "War",
    title: "Hard Power",
    gradient: "from-[#434343] via-[#1a1a1a] to-[#434343]",
    video:
      "https://res.cloudinary.com/dsnwi9kev/video/upload/v1779814782/vecteezy_fighter-jets-in-formation-from-cockpit-view_72703906_rou2bb.mp4",
  },
  {
    id: "turkey",
    pillar: "Türkiye",
    title: "Anatolia Unfiltered",
    flag: "🇹🇷",
    gradient: "from-[#fd746c] via-[#ff9068] to-[#fd746c]",
    video:
      "https://res.cloudinary.com/dsnwi9kev/video/upload/vecteezy_turkey-realistic-waving-flag-smooth-seamless-loop-4k-video_10248673_nnykwc.mp4",
  },
  {
    id: "eu",
    pillar: "EU",
    title: "Brussels Perspective",
    flag: "🇪🇺",
    gradient: "from-[#4facfe] via-[#00f2fe] to-[#4facfe]",
    video:
      "https://res.cloudinary.com/dsnwi9kev/video/upload/v1779814657/vecteezy_european-union-waving-flag-seamless-loop-animation-4k_9852476_mssmfz.mp4",
  },
  {
    id: "usa",
    pillar: "USA",
    title: "The US Matrix",
    flag: "🇺🇸",
    gradient: "from-[#a18cd1] via-[#fbc2eb] to-[#a18cd1]",
    video:
      "https://res.cloudinary.com/dsnwi9kev/video/upload/v1779814520/vecteezy_american-waving-flag-seamless-loop-animation-4k-resolution_8969666_tupp5e.mp4",
  },
]

const CATEGORY_BY_ID = new Map(
  PUBLICATION_CATEGORIES.map((c) => [c.id, c] as const)
)

const LOOKUP_ALIASES = new Map<string, CategoryId>()

for (const cat of PUBLICATION_CATEGORIES) {
  LOOKUP_ALIASES.set(cat.id, cat.id)
  LOOKUP_ALIASES.set(cat.title.toLowerCase(), cat.id)
  LOOKUP_ALIASES.set(cat.pillar.toLowerCase(), cat.id)
}

function normalizeKey(value: string): string {
  return value.trim().toLowerCase()
}

export function resolveCategoryId(stored: string): CategoryId | null {
  const key = normalizeKey(stored)
  if (LOOKUP_ALIASES.has(key)) {
    return LOOKUP_ALIASES.get(key)!
  }
  return null
}

export function isKnownCategory(stored: string): boolean {
  return resolveCategoryId(stored) !== null
}

export function getCategoryById(id: string): PublicationCategory | undefined {
  const resolved = resolveCategoryId(id)
  return resolved ? CATEGORY_BY_ID.get(resolved) : undefined
}

/** Main category label for posts, filters, and badges. */
export function getCategoryTitle(stored: string): string {
  const cat = getCategoryById(stored)
  return cat?.pillar ?? "Uncategorized"
}

/** Desk tagline (secondary line under the pillar). */
export function getCategoryTagline(stored: string): string | null {
  const cat = getCategoryById(stored)
  return cat?.title ?? null
}

/** Flag emoji for regional categories (shown on web instead of "TR", "EU", etc.). */
export function getCategoryFlag(stored: string): string | null {
  const cat = getCategoryById(stored)
  return cat?.flag ?? null
}

export function postMatchesCategory(postCategory: string, selectedId: string): boolean {
  const postId = resolveCategoryId(postCategory)
  const filterId = resolveCategoryId(selectedId)
  if (postId && filterId) return postId === filterId
  return normalizeKey(postCategory) === normalizeKey(selectedId)
}

export const DEFAULT_CATEGORY_ID: CategoryId = "humor"
