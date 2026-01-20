import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { getServerEnv } from "@/lib/env"

/**
 * Route de callback pour l'authentification Supabase (App Router)
 * 
 * Fonctionnalités:
 * - Lit le code d'authentification depuis l'URL (?code=...)
 * - Utilise createServerClient avec cookies pour échanger le code contre une session
 * - Redirige vers /profile en cas de succès (ou vers next si présent)
 * - Redirige vers /login?error=... en cas d'erreur
 */
export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")
  const error = requestUrl.searchParams.get("error")
  const next = requestUrl.searchParams.get("next")

  // Si OAuth renvoie une erreur dans l'URL
  if (error) {
    const loginUrl = new URL("/login", requestUrl.origin)
    loginUrl.searchParams.set("error", error)
    return NextResponse.redirect(loginUrl)
  }

  // Si pas de code, rediriger vers login avec erreur
  if (!code) {
    const loginUrl = new URL("/login", requestUrl.origin)
    loginUrl.searchParams.set("error", "missing_code")
    return NextResponse.redirect(loginUrl)
  }

  try {
    // Récupérer le cookie store
    const cookieStore = await cookies()
    const env = getServerEnv()

    // Créer le client Supabase pour route handler avec cookies
    const supabase = createServerClient(
      env.NEXT_PUBLIC_SUPABASE_URL,
      env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet: Array<{ name: string; value: string; options?: any }>) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch {
              // Ignorer les erreurs de setAll dans les route handlers
            }
          },
        },
      }
    )

    // Échanger le code contre une session
    const { data, error: supabaseError } = await supabase.auth.exchangeCodeForSession(code)

    if (supabaseError || !data.session) {
      if (process.env.NODE_ENV === "development") {
        console.error("[Auth Callback] Error exchanging code for session:", supabaseError)
      }

      // Rediriger vers login avec erreur
      const loginUrl = new URL("/login", requestUrl.origin)
      loginUrl.searchParams.set("error", supabaseError?.message || "auth_failed")
      return NextResponse.redirect(loginUrl)
    }

    // Succès : rediriger vers /profile (ou next si présent)
    const redirectUrl = next ? new URL(next, requestUrl.origin) : new URL("/profile", requestUrl.origin)
    return NextResponse.redirect(redirectUrl)
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("[Auth Callback] Unexpected error:", error)
    }

    // En cas d'erreur inattendue, rediriger vers login avec erreur
    const loginUrl = new URL("/login", requestUrl.origin)
    loginUrl.searchParams.set("error", error instanceof Error ? error.message : "unexpected_error")
    return NextResponse.redirect(loginUrl)
  }
}
