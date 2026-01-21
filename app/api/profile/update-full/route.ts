import { requireAuthServer } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { z } from "zod"

/**
 * Schéma de validation Zod pour le body de la requête complète
 */
const updateFullProfileSchema = z.object({
  contact_email: z.string().email().optional(),
  job_title: z.string().optional(),
  industry: z.string().optional(),
  seniority: z.string().optional(),
  tone: z.string().optional(),
  focus: z.array(z.string()).optional(),
  stack_context: z.array(z.string()).optional(),
  audience_target: z.array(z.string()).optional(),
  directive_json: z.record(z.unknown()).optional(),
  personal_json: z.record(z.unknown()).optional(),
  onboarding_json: z.record(z.unknown()).optional(),
  onboarding_completed: z.boolean().optional(),
})

type UpdateFullProfileBody = z.infer<typeof updateFullProfileSchema>

/**
 * Route API pour mettre à jour TOUS les champs du profil utilisateur (POST)
 * 
 * Colonnes modifiables:
 * - contact_email
 * - job_title, industry, seniority, tone (si colonnes existent)
 * - focus, stack_context, audience_target (arrays)
 * - directive_json, personal_json, onboarding_json
 * - onboarding_completed
 */
export async function POST(request: Request) {
  try {
    // Authentification obligatoire
    const user = await requireAuthServer()

    if (process.env.NODE_ENV === "development") {
      console.log(`[API] Full profile update request from user: ${user.id}`)
    }

    // Parse et validation du body
    let body: UpdateFullProfileBody
    try {
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
      body = updateFullProfileSchema.parse(rawBody)
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

    // Préparer les updates
    const updates: Record<string, unknown> = {}

    // Champs directs (si colonnes existent)
    if (body.contact_email !== undefined) updates.contact_email = body.contact_email
    if (body.job_title !== undefined) updates.job_title = body.job_title
    if (body.industry !== undefined) updates.industry = body.industry
    if (body.seniority !== undefined) updates.seniority = body.seniority
    if (body.tone !== undefined) updates.tone = body.tone

    // Arrays
    if (body.focus !== undefined) updates.focus = body.focus
    if (body.stack_context !== undefined) updates.stack_context = body.stack_context
    if (body.audience_target !== undefined) updates.audience_target = body.audience_target

    // JSON fields
    if (body.directive_json !== undefined) updates.directive_json = body.directive_json
    if (body.personal_json !== undefined) updates.personal_json = body.personal_json
    if (body.onboarding_json !== undefined) updates.onboarding_json = body.onboarding_json
    if (body.onboarding_completed !== undefined) updates.onboarding_completed = body.onboarding_completed

    // Vérifier qu'au moins un champ est présent
    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { ok: false, error: "Au moins un champ doit être fourni" },
        { status: 400 }
      )
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
      console.log(`[API] Full profile updated successfully for user: ${user.id}`)
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
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
