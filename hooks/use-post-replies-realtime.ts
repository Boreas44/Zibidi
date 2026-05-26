"use client"

import { useEffect, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import { mapReplyRow, type CommentReply } from "@/lib/replies-shared"
import type { ReplyRow } from "@/lib/database.types"
import { isSupabaseConfigured } from "@/lib/supabase/env"

type UsePostRepliesRealtimeOptions = {
  postId: string | undefined
  enabled: boolean
  currentUserId?: string | null
  onInsert: (reply: CommentReply) => void
}

/**
 * Subscribes to Supabase Realtime INSERT events on `replies` for a post.
 * Injects new replies into local state without a full refresh.
 */
export function usePostRepliesRealtime({
  postId,
  enabled,
  currentUserId,
  onInsert,
}: UsePostRepliesRealtimeOptions) {
  const onInsertRef = useRef(onInsert)
  onInsertRef.current = onInsert

  useEffect(() => {
    if (!enabled || !postId || !isSupabaseConfigured()) {
      return
    }

    const supabase = createClient()

    const channel = supabase
      .channel(`replies:post:${postId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "replies",
          filter: `post_id=eq.${postId}`,
        },
        (payload) => {
          const row = payload.new as ReplyRow
          if (!row?.id) return

          // Author's own insert is usually applied optimistically in the UI.
          if (currentUserId && row.user_id === currentUserId) {
            return
          }

          onInsertRef.current(mapReplyRow(row))
        }
      )
      .subscribe()

    return () => {
      void supabase.removeChannel(channel)
    }
  }, [postId, enabled, currentUserId])
}
