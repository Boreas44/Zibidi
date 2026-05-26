import { NextResponse, type NextRequest } from "next/server"
import { updateSession } from "@/lib/supabase/middleware"

export async function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl

  // Supabase Site URL often sends ?code= to / — route through auth callback.
  if (pathname === "/" && searchParams.has("code")) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = "/auth/callback"
    if (
      !searchParams.has("next") &&
      searchParams.get("type") === "recovery"
    ) {
      redirectUrl.searchParams.set("next", "/auth/reset-password")
    }
    return NextResponse.redirect(redirectUrl)
  }

  return await updateSession(request)
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
