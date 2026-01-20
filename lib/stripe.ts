import Stripe from "stripe"
import { env } from "@/lib/env"

/**
 * Client Stripe initialisé avec la clé secrète
 * ⚠️ À utiliser UNIQUEMENT côté serveur
 */
export function getStripeClient(): Stripe {
  return new Stripe(env.STRIPE_SECRET_KEY, {
    apiVersion: "2024-11-20.acacia",
    typescript: true,
  })
}

/**
 * Vérifie la signature d'un webhook Stripe
 * @param payload - Corps de la requête (string ou Buffer)
 * @param signature - Signature du header Stripe
 * @returns L'événement Stripe si la signature est valide, null sinon
 */
export async function verifyWebhookSignature(
  payload: string | Buffer,
  signature: string
): Promise<Stripe.Event | null> {
  try {
    const stripe = getStripeClient()
    const event = stripe.webhooks.constructEvent(
      payload,
      signature,
      env.STRIPE_WEBHOOK_SECRET
    )
    return event
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("[Stripe] Webhook signature verification failed:", error)
    }
    return null
  }
}

/**
 * Extrait l'ID utilisateur depuis une session Stripe Checkout
 * @param session - Session Stripe Checkout
 * @returns L'ID utilisateur (user.id) ou null
 */
export function getUserIdFromCheckoutSession(
  session: Stripe.Checkout.Session
): string | null {
  // Priorité 1: metadata.user_id
  if (session.metadata?.user_id) {
    return session.metadata.user_id
  }

  // Priorité 2: client_reference_id
  if (session.client_reference_id) {
    return session.client_reference_id
  }

  // Priorité 3: customer email (si on a besoin de chercher par email)
  // Note: Cette méthode nécessiterait une requête supplémentaire à Supabase
  // On ne l'utilise que si les autres méthodes échouent
  return null
}
