import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"
import { getServerEnv } from "@/lib/env"

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const env = getServerEnv()

  // Créer le client Supabase avec gestion des cookies pour middleware
  const supabase = createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: Array<{ name: string; value: string; options?: any }>) {
          // Mettre à jour les cookies dans la requête
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value)
          })
          
          // Créer une nouvelle réponse avec les cookies mis à jour
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          
          // Appliquer les cookies à la réponse (Supabase SSR gère déjà les options)
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  // Rafraîchir la session si nécessaire (important pour Vercel/Railway)
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Routes protégées
  const protectedRoutes = ["/onboarding", "/billing", "/connect-telegram", "/dashboard", "/profile"]
  const isProtectedRoute = protectedRoutes.some((route) =>
    request.nextUrl.pathname.startsWith(route)
  )

  // Si route protégée et utilisateur non connecté => rediriger vers /login
  if (isProtectedRoute && !user) {
    const redirectUrl = new URL("/login", request.url)
    redirectUrl.searchParams.set("next", request.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // Retourner la réponse avec les cookies mis à jour
  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - api routes (webhooks, etc.)
     * - public folder
     * - file extensions (images, etc.)
     */
    "/((?!_next/static|_next/image|favicon.ico|api|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
}
