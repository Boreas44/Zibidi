"use client"

import { useSyncExternalStore } from "react"
import { HomePage, type HomePageProps } from "@/components/home-page"
import { HomePageSkeleton } from "@/components/home-page-skeleton"

function subscribe() {
  return () => {}
}

function getClientSnapshot() {
  return true
}

function getServerSnapshot() {
  return false
}

/**
 * Defers interactive home UI until after mount so SSR HTML is not compared
 * against DOM mutated by browser extensions (e.g. bis_skin_checked).
 */
export function HomePageClient(props: HomePageProps) {
  const mounted = useSyncExternalStore(
    subscribe,
    getClientSnapshot,
    getServerSnapshot
  )

  if (!mounted) {
    return <HomePageSkeleton />
  }

  return <HomePage {...props} />
}
