/** Minimal shell for SSR — real feed mounts client-only to avoid extension hydration noise. */
export function HomePageSkeleton() {
  return (
    <div
      className="min-h-screen bg-background"
      aria-busy="true"
      aria-label="Loading"
      suppressHydrationWarning
    />
  )
}
