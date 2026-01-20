import { NextRequest, NextResponse } from "next/server"
import { getStripeClient, verifyWebhookSignature, getUserIdFromCheckoutSession } from "@/lib/stripe"
import { createAdminClient } from "@/lib/supabase/admin"
import Stripe from "stripe"

/**
 * Route webhook Stripe
 * 
 * Gère les événements Stripe, notamment checkout.session.completed
 * pour activer le plan Pro d'un utilisateur.
 * 
 * IMPORTANT: Cette route doit être accessible publiquement (pas d'auth)
 * La sécurité est assurée par la vérification de la signature Stripe.
 */
export async function POST(request: NextRequest) {
  try {
    // Récupérer le body et la signature
    const body = await request.text()
    const signature = request.headers.get("stripe-signature")

    if (!signature) {
      if (process.env.NODE_ENV === "development") {
        console.error("[Webhook] Missing Stripe signature")
      }
      return NextResponse.json(
        { error: "Missing signature" },
        { status: 400 }
      )
    }

    // Vérifier la signature du webhook
    const event = await verifyWebhookSignature(body, signature)

    if (!event) {
      if (process.env.NODE_ENV === "development") {
        console.error("[Webhook] Invalid signature")
      }
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 400 }
      )
    }

    if (process.env.NODE_ENV === "development") {
      console.log(`[Webhook] Received event: ${event.type}`)
    }

    // Gérer l'événement checkout.session.completed
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session

      // Récupérer l'ID utilisateur depuis la session
      const userId = getUserIdFromCheckoutSession(session)

      if (!userId) {
        if (process.env.NODE_ENV === "development") {
          console.error("[Webhook] Could not extract user ID from session:", session.id)
        }
        // On répond 200 pour éviter que Stripe réessaie
        return NextResponse.json({ received: true })
      }

      if (process.env.NODE_ENV === "development") {
        console.log(`[Webhook] Activating Pro plan for user: ${userId}`)
      }

      // Mettre à jour le profil avec le service role (bypass RLS)
      const supabase = createAdminClient()
      const { error } = await supabase
        .from("profiles")
        .update({
          plan: "pro",
          is_active: true,
        })
        .eq("id", userId)

      if (error) {
        if (process.env.NODE_ENV === "development") {
          console.error("[Webhook] Error updating profile:", error)
        }
        // On répond 200 pour éviter que Stripe réessaie
        // Mais on log l'erreur pour debugging
        return NextResponse.json({ received: true, error: "Update failed" })
      }

      if (process.env.NODE_ENV === "development") {
        console.log(`[Webhook] Successfully activated Pro plan for user: ${userId}`)
      }
    }

    // Répondre rapidement avec 200
    // Stripe attend une réponse rapide (< 3 secondes)
    return NextResponse.json({ received: true })
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("[Webhook] Unexpected error:", error)
    }

    // Répondre 200 même en cas d'erreur pour éviter les retries Stripe
    // (sauf si c'est une erreur de signature)
    return NextResponse.json(
      { received: true, error: "Internal error" },
      { status: 200 }
    )
  }
}

// Configuration pour les webhooks Stripe
export const runtime = "nodejs"
export const dynamic = "force-dynamic"
