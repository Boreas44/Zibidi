import { notFound } from "next/navigation"
import { PostDetailPage } from "@/components/post-detail-page"
import { getSessionProfile } from "@/lib/auth/server"
import { fetchPostById } from "@/lib/posts"

interface PostPageProps {
  params: Promise<{ id: string }>
}

export default async function PostPage({ params }: PostPageProps) {
  const { id } = await params
  const [{ post, error }, user] = await Promise.all([
    fetchPostById(id),
    getSessionProfile(),
  ])

  if (error) {
    throw new Error(error)
  }

  if (!post) {
    notFound()
  }

  return <PostDetailPage initialPost={post} user={user} />
}
