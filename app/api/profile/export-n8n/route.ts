import { requireAuthServer } from "@/lib/auth"
import { getProfileServer } from "@/lib/auth"
import { NextResponse } from "next/server"

/**
 * Route API pour exporter profile_json vers n8n webhook (POST)
 * 
 * Exigences:
 * - Auth obligatoire
 * - Lit profile_json depuis profiles
 * - POST vers process.env.N8N_PROFILE_WEBHOOK_URL si défini
 * - Si N8N_PROFILE_WEBHOOK_URL non défini, renvoyer ok: false + message
 */
export async function POST(request: Request) {
  try {
    // Authentification obligatoire
    await requireAuthServer()

    // Récupérer le profil avec profile_json
    const profile = await getProfileServer()

    if (!profile) {
      return NextResponse.json(
        { ok: false, error: "Profil non trouvé" },
        { status: 404 }
      )
    }

    // Vérifier que profile_json existe
    if (!profile.profile_json || Object.keys(profile.profile_json).length === 0) {
      return NextResponse.json(
        { ok: false, error: "Aucune donnée de profil à exporter" },
        { status: 400 }
      )
    }

    // Vérifier que N8N_PROFILE_WEBHOOK_URL est défini
    const webhookUrl = process.env.N8N_PROFILE_WEBHOOK_URL
    if (!webhookUrl) {
      return NextResponse.json(
        {
          ok: false,
          error: "Webhook n8n non configuré",
          message: "La variable d'environnement N8N_PROFILE_WEBHOOK_URL n'est pas définie",
        },
        { status: 400 }
      )
    }

    if (process.env.NODE_ENV === "development") {
      console.log(`[API] Exporting profile_json to n8n webhook for user: ${profile.id}`)
    }

    // POST vers le webhook n8n
    try {
      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: profile.id,
          email: profile.email,
          profile_json: profile.profile_json,
          exported_at: new Date().toISOString(),
        }),
      })

      if (!response.ok) {
        const errorText = await response.text().catch(() => "Unknown error")
        if (process.env.NODE_ENV === "development") {
          console.error(`[API] n8n webhook error: ${response.status} - ${errorText}`)
        }
        return NextResponse.json(
          {
            ok: false,
            error: "Erreur lors de l'export vers n8n",
            details: `HTTP ${response.status}: ${errorText}`,
          },
          { status: 500 }
        )
      }

      if (process.env.NODE_ENV === "development") {
        console.log(`[API] Profile exported successfully to n8n for user: ${profile.id}`)
      }

      return NextResponse.json({
        ok: true,
        message: "Profil exporté vers n8n avec succès",
      })
    } catch (fetchError) {
      if (process.env.NODE_ENV === "development") {
        console.error("[API] Fetch error:", fetchError)
      }
      return NextResponse.json(
        {
          ok: false,
          error: "Erreur de connexion au webhook n8n",
          details: fetchError instanceof Error ? fetchError.message : "Unknown error",
        },
        { status: 500 }
      )
    }
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
