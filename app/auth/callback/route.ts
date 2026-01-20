import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

/**
 * Route de callback pour l'authentification Supabase (App Router)
 * 
 * Fonctionnalités:
 * - Lit le code d'authentification depuis l'URL (?code=...)
 * - Utilise le client Supabase serveur (avec cookies) pour échanger le code contre une session
 * - Redirige vers /dashboard en cas de succès (ou vers next si présent)
 * - Redirige vers /login?error=1 en cas d'erreur
 */
export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")
  const next = requestUrl.searchParams.get("next")

  // Si pas de code, rediriger vers login avec erreur
  if (!code) {
    const loginUrl = new URL("/login", requestUrl.origin)
    loginUrl.searchParams.set("error", "1")
    return NextResponse.redirect(loginUrl)
  }

  try {
    // Créer le client Supabase serveur (gère les cookies automatiquement)
    const supabase = await createClient()

    // Échanger le code contre une session
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("[Auth Callback] Error exchanging code for session:", error)
      }

      // Rediriger vers login avec erreur
      const loginUrl = new URL("/login", requestUrl.origin)
      loginUrl.searchParams.set("error", "1")
      return NextResponse.redirect(loginUrl)
    }

    // Succès : rediriger vers dashboard (ou next si présent)
    const redirectUrl = next ? new URL(next, requestUrl.origin) : new URL("/dashboard", requestUrl.origin)
    return NextResponse.redirect(redirectUrl)
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("[Auth Callback] Unexpected error:", error)
    }

    // En cas d'erreur inattendue, rediriger vers login avec erreur
    const loginUrl = new URL("/login", requestUrl.origin)
    loginUrl.searchParams.set("error", "1")
    return NextResponse.redirect(loginUrl)
  }
}
