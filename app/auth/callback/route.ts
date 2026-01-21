import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { getServerEnv } from "@/lib/env"

/**
 * Route de callback pour l'authentification Supabase OAuth (App Router)
 * 
 * Fonctionnalités:
 * - Lit le code d'authentification depuis l'URL (?code=...)
 * - Utilise createServerClient avec cookies pour échanger le code contre une session
 * - Upsert le profil utilisateur dans public.profiles
 * - Redirige vers /profile si contact_email manquant OU onboarding_completed=false
 * - Redirige vers /dashboard sinon
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

    // Récupérer l'utilisateur depuis la session
    const user = data.session.user
    if (!user || !user.id || !user.email) {
      if (process.env.NODE_ENV === "development") {
        console.error("[Auth Callback] User data missing from session")
      }
      const loginUrl = new URL("/login", requestUrl.origin)
      loginUrl.searchParams.set("error", "user_data_missing")
      return NextResponse.redirect(loginUrl)
    }

    // Récupérer le profil existant pour vérifier s'il est nouveau
    const { data: existingProfile } = await supabase
      .from("profiles")
      .select("id, onboarding_completed, directive_json, onboarding_json, profile_json, contact_email")
      .eq("id", user.id)
      .single()

    const isNewProfile = !existingProfile

    // Préparer les données pour l'upsert
    const profileData: Record<string, any> = {
      id: user.id,
      email: user.email,
      is_active: false,
      plan: "free",
    }

    // Si nouveau profil, définir toutes les valeurs par défaut
    if (isNewProfile) {
      profileData.onboarding_completed = false
      profileData.directive_json = {}
      profileData.onboarding_json = {}
      profileData.profile_json = {}
      profileData.contact_email = null // Sera rempli lors de la configuration du profil
      // Colonnes optionnelles (si elles existent dans le schéma)
      profileData.focus = []
      profileData.stack_context = []
      profileData.audience_target = []
    } else {
      // Pour un profil existant, s'assurer que les valeurs par défaut sont présentes si null
      if (!existingProfile.directive_json) profileData.directive_json = {}
      if (!existingProfile.onboarding_json) profileData.onboarding_json = {}
      if (!existingProfile.profile_json) profileData.profile_json = {}
      // Ne pas écraser onboarding_completed ni contact_email si déjà définis
    }

    // Upsert le profil (INSERT ou UPDATE)
    const { error: upsertError } = await supabase
      .from("profiles")
      .upsert(profileData, {
        onConflict: "id",
      })

    if (upsertError) {
      if (process.env.NODE_ENV === "development") {
        console.error("[Auth Callback] Error upserting profile:", upsertError)
      }
      // Même en cas d'erreur d'upsert, on peut continuer si l'utilisateur est authentifié
      // Le trigger handle_new_user peut avoir créé le profil
    }

    // Récupérer le profil final pour vérifier les conditions de redirection
    const { data: finalProfile } = await supabase
      .from("profiles")
      .select("onboarding_completed, contact_email")
      .eq("id", user.id)
      .single()

    // Déterminer la redirection
    let redirectPath = "/dashboard"

    if (finalProfile) {
      // Vérifier si contact_email manque
      const hasContactEmail = finalProfile.contact_email && finalProfile.contact_email.trim() !== ""

      // Rediriger vers /profile si contact_email manquant OU onboarding_completed=false
      if (!hasContactEmail || !finalProfile.onboarding_completed) {
        redirectPath = "/profile"
      }
    } else {
      // Si le profil n'existe toujours pas, rediriger vers /profile
      redirectPath = "/profile"
    }

    // Utiliser next si présent, sinon utiliser redirectPath
    const redirectUrl = next ? new URL(next, requestUrl.origin) : new URL(redirectPath, requestUrl.origin)
    
    if (process.env.NODE_ENV === "development") {
      console.log(`[Auth Callback] User ${user.id} authenticated, redirecting to ${redirectPath}`)
    }

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
