import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function PostNotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-4 text-center">
      <h1 className="text-[22px] font-bold text-foreground">Post not found</h1>
      <p className="max-w-sm text-[15px] text-muted-foreground">
        This post may have been removed or the link is incorrect.
      </p>
      <Button asChild>
        <Link href="/">Back to home</Link>
      </Button>
    </div>
  )
}
