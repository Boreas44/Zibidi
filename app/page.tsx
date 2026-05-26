import { fetchPosts } from "@/lib/posts"
import { getSessionProfile } from "@/lib/auth/server"
import { HomePageClient } from "@/components/home-page-client"

export default async function Page() {
  const [initialPosts, user] = await Promise.all([
    fetchPosts(),
    getSessionProfile(),
  ])

  return <HomePageClient initialPosts={initialPosts} user={user} />
}
