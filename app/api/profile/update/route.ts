import { requireAuthServer } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { z } from "zod"

/**
 * Schéma de validation Zod pour le body de la requête
 */
const updateProfileSchema = z.object({
  directive_json: z.record(z.unknown()).optional(),
  onboarding_json: z.record(z.unknown()).optional(),
  onboarding_completed: z.boolean().optional(),
})

type UpdateProfileBody = z.infer<typeof updateProfileSchema>

/**
 * Route API sécurisée pour mettre à jour le profil utilisateur (POST)
 * 
 * Colonnes modifiables par l'utilisateur:
 * - directive_json
 * - onboarding_json
 * - onboarding_completed
 * 
 * Les autres colonnes (plan, is_active, telegram_chat_id, etc.) doivent être
 * modifiées via le service role (webhooks Stripe, n8n, etc.)
 */
export async function POST(request: Request) {
  try {
    // Authentification obligatoire
    const user = await requireAuthServer()
    
    if (process.env.NODE_ENV === "development") {
      console.log(`[API] Profile update request from user: ${user.id}`)
    }

    // Parse et validation du body
    let body: UpdateProfileBody
    try {
      // Vérifier que le body n'est pas vide
      const contentType = request.headers.get("content-type")
      if (!contentType || !contentType.includes("application/json")) {
        return NextResponse.json(
          { ok: false, error: "Content-Type doit être application/json" },
          { status: 400 }
        )
      }

      const text = await request.text()
      if (!text || text.trim() === "") {
        return NextResponse.json(
          { ok: false, error: "Le body ne peut pas être vide" },
          { status: 400 }
        )
      }

      const rawBody = JSON.parse(text)
      body = updateProfileSchema.parse(rawBody)
    } catch (error) {
      if (error instanceof SyntaxError) {
        return NextResponse.json(
          { ok: false, error: "JSON invalide" },
          { status: 400 }
        )
      }
      if (error instanceof z.ZodError) {
        if (process.env.NODE_ENV === "development") {
          console.log("[API] Validation error:", error.errors)
        }
        return NextResponse.json(
          { ok: false, error: "Données invalides", details: error.errors },
          { status: 400 }
        )
      }
      return NextResponse.json(
        { ok: false, error: "Erreur lors du parsing du body" },
        { status: 400 }
      )
    }

    // Vérifier qu'au moins un champ est présent
    if (
      body.directive_json === undefined &&
      body.onboarding_json === undefined &&
      body.onboarding_completed === undefined
    ) {
      return NextResponse.json(
        { ok: false, error: "Au moins un champ doit être fourni" },
        { status: 400 }
      )
    }

    // Préparer les updates (uniquement les colonnes autorisées)
    const updates: Record<string, unknown> = {}
    if (body.directive_json !== undefined) {
      updates.directive_json = body.directive_json
    }
    if (body.onboarding_json !== undefined) {
      updates.onboarding_json = body.onboarding_json
    }
    if (body.onboarding_completed !== undefined) {
      updates.onboarding_completed = body.onboarding_completed
    }

    // Mise à jour dans Supabase
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", user.id)
      .select()
      .single()

    if (error) {
      if (process.env.NODE_ENV === "development") {
        console.log("[API] Supabase error:", error.message)
      }
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: 400 }
      )
    }

    if (process.env.NODE_ENV === "development") {
      console.log(`[API] Profile updated successfully for user: ${user.id}`)
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
      { ok: false, error: "Erreur serveur lors de la mise à jour du profil" },
      { status: 500 }
    )
  }
}
