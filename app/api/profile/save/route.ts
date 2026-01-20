import { requireAuthServer } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { z } from "zod"
import type { ProfileJson } from "@/lib/types/profile"

/**
 * Schéma de validation Zod pour profile_json
 * Validation légère - on accepte un objet JSON valide
 */
const profileJsonSchema = z.record(z.unknown())

/**
 * Schéma de validation pour le body de la requête
 */
const saveProfileSchema = z.object({
  profile_json: profileJsonSchema,
})

type SaveProfileBody = z.infer<typeof saveProfileSchema>

/**
 * Route API pour sauvegarder profile_json (POST)
 * 
 * Exigences:
 * - Auth obligatoire (Supabase server client + cookies)
 * - Body JSON: { profile_json }
 * - Update dans profiles pour l'utilisateur courant (id = user.id)
 * - Met aussi onboarding_completed=true
 * - Retourne { ok: true } ou { ok: false, error } avec status approprié
 */
export async function POST(request: Request) {
  try {
    // Authentification obligatoire
    const user = await requireAuthServer()

    // Vérifier le Content-Type
    const contentType = request.headers.get("content-type")
    if (!contentType || !contentType.includes("application/json")) {
      return NextResponse.json(
        { ok: false, error: "Content-Type must be application/json" },
        { status: 400 }
      )
    }

    // Lire et parser le body
    let body: SaveProfileBody
    try {
      const rawBody = await request.text()
      if (!rawBody || rawBody.trim() === "") {
        return NextResponse.json(
          { ok: false, error: "Body is required" },
          { status: 400 }
        )
      }
      body = JSON.parse(rawBody)
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("[API] JSON parse error:", error)
      }
      return NextResponse.json(
        { ok: false, error: "Invalid JSON in body" },
        { status: 400 }
      )
    }

    // Valider le body avec Zod
    const validationResult = saveProfileSchema.safeParse(body)
    if (!validationResult.success) {
      if (process.env.NODE_ENV === "development") {
        console.error("[API] Validation error:", validationResult.error)
      }
      return NextResponse.json(
        { ok: false, error: "Invalid body format", details: validationResult.error.errors },
        { status: 400 }
      )
    }

    const { profile_json } = validationResult.data

    if (process.env.NODE_ENV === "development") {
      console.log(`[API] Saving profile_json for user: ${user.id}`)
    }

    // Mettre à jour le profil
    const supabase = await createClient()
    const { error } = await supabase
      .from("profiles")
      .update({
        profile_json: profile_json as unknown as ProfileJson,
        onboarding_completed: true,
      })
      .eq("id", user.id)

    if (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("[API] Supabase update error:", error)
      }
      return NextResponse.json(
        { ok: false, error: "Erreur lors de la sauvegarde" },
        { status: 500 }
      )
    }

    if (process.env.NODE_ENV === "development") {
      console.log(`[API] Profile saved successfully for user: ${user.id}`)
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    // Gestion des erreurs d'authentification
    if (error instanceof Error && error.message.includes("redirect")) {
      return NextResponse.json(
        { ok: false, error: "Non authentifié" },
        { status: 401 }
      )
    }

    if (process.env.NODE_ENV === "development") {
      console.error("[API] Unexpected error:", error)
    }

    return NextResponse.json(
      { ok: false, error: "Erreur serveur" },
      { status: 500 }
    )
  }
}
