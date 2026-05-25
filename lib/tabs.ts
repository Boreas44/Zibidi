export type AppTab = "search" | "home" | "feed" | "explore" | "library"

export const TAB_META: Record<
  AppTab,
  { title: string; subtitle: string; emptyTitle: string; emptyHint: string }
> = {
  search: {
    title: "Search",
    subtitle: "Find posts, authors, and topics",
    emptyTitle: "Search Blogify",
    emptyHint: "Type in the bar above to find posts and authors",
  },
  home: {
    title: "Latest Posts",
    subtitle: "Fresh stories from the community",
    emptyTitle: "No posts yet",
    emptyHint: "Create your first post with New Post",
  },
  feed: {
    title: "Your Feed",
    subtitle: "Posts in chronological order",
    emptyTitle: "Feed is empty",
    emptyHint: "Follow topics or publish a post to fill your feed",
  },
  explore: {
    title: "Explore",
    subtitle: "Browse by category",
    emptyTitle: "Nothing to explore yet",
    emptyHint: "Pick a category above or publish a post",
  },
  library: {
    title: "Library",
    subtitle: "Posts you saved",
    emptyTitle: "No saved posts",
    emptyHint: "Bookmark posts to see them here",
  },
}
