import type { PostReactionKind, PostReactionState } from "@/lib/post-reactions"

export type ReactionPostSnapshot = {
  likes: number
  dislikes: number
  isLiked: boolean
  isDisliked: boolean
}

/** Client-side preview of toggle — matches server post_reactions rules. */
export function computeOptimisticReaction(
  post: ReactionPostSnapshot,
  reaction: PostReactionKind
): PostReactionState {
  let likes = post.likes
  let dislikes = post.dislikes

  if (post.isLiked && reaction === "like") {
    likes = Math.max(0, likes - 1)
    return { likes, dislikes, userReaction: null }
  }

  if (post.isDisliked && reaction === "dislike") {
    dislikes = Math.max(0, dislikes - 1)
    return { likes, dislikes, userReaction: null }
  }

  if (post.isLiked && reaction === "dislike") {
    likes = Math.max(0, likes - 1)
    dislikes += 1
    return { likes, dislikes, userReaction: "dislike" }
  }

  if (post.isDisliked && reaction === "like") {
    dislikes = Math.max(0, dislikes - 1)
    likes += 1
    return { likes, dislikes, userReaction: "like" }
  }

  if (reaction === "like") {
    likes += 1
  } else {
    dislikes += 1
  }
  return { likes, dislikes, userReaction: reaction }
}

export function snapshotFromPost(post: ReactionPostSnapshot): ReactionPostSnapshot {
  return {
    likes: post.likes,
    dislikes: post.dislikes,
    isLiked: post.isLiked,
    isDisliked: post.isDisliked,
  }
}
