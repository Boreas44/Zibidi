import { fetchPosts } from "@/lib/posts"
import { getSessionProfile } from "@/lib/auth/server"
import { HomePage } from "@/components/home-page"

export default async function Page() {
  const [initialPosts, user] = await Promise.all([
    fetchPosts(),
    getSessionProfile(),
  ])

  return <HomePage initialPosts={initialPosts} user={user} />
}
