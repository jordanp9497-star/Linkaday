import { requireAuthServer } from "@/lib/auth"
import { getProfileServer } from "@/lib/auth"
import { NextResponse } from "next/server"
import { requireStripeEnv } from "@/lib/env"
import Stripe from "stripe"

/**
 * Route API pour créer une session Stripe Checkout
 * 
 * Vérifications:
 * - Utilisateur authentifié
 * - Onboarding complété
 * - Crée une subscription Stripe
 */
export async function POST(request: Request) {
  try {
    // Authentification obligatoire
    const user = await requireAuthServer()

    // Vérifier que l'onboarding est complété
    const profile = await getProfileServer()
    if (!profile?.onboarding_completed) {
      return NextResponse.json(
        { ok: false, error: "Onboarding non complété" },
        { status: 400 }
      )
    }

    // Vérifier que l'utilisateur n'est pas déjà abonné
    if (profile.plan === "pro" && profile.is_active) {
      return NextResponse.json(
        { ok: false, error: "Vous êtes déjà abonné au Plan Pro" },
        { status: 400 }
      )
    }

    if (process.env.NODE_ENV === "development") {
      console.log(`[API] Creating Stripe checkout for user: ${user.id}`)
    }

    // Vérifier que les variables Stripe sont configurées et récupérer les valeurs
    let stripeEnv
    try {
      stripeEnv = requireStripeEnv()
    } catch (error) {
      return NextResponse.json(
        { ok: false, error: error instanceof Error ? error.message : "Stripe env missing" },
        { status: 500 }
      )
    }

    // Initialiser Stripe (on réutilise stripeEnv pour éviter la double vérification)
    const stripe = new Stripe(stripeEnv.STRIPE_SECRET_KEY, {
      apiVersion: "2023-10-16",
      typescript: true,
    })

    // Créer la session Checkout
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: stripeEnv.STRIPE_PRICE_ID,
          quantity: 1,
        },
      ],
      customer_email: user.email,
      client_reference_id: user.id,
      success_url: `${stripeEnv.NEXT_PUBLIC_APP_URL}/connect-telegram?success=1`,
      cancel_url: `${stripeEnv.NEXT_PUBLIC_APP_URL}/billing?canceled=1`,
      metadata: {
        user_id: user.id,
        email: user.email || "",
      },
    })

    if (process.env.NODE_ENV === "development") {
      console.log(`[API] Stripe checkout session created: ${session.id}`)
    }

    return NextResponse.json({
      ok: true,
      url: session.url,
    })
  } catch (error) {
    // Gestion des erreurs d'authentification
    if (error instanceof Error && error.message.includes("redirect")) {
      return NextResponse.json(
        { ok: false, error: "Non authentifié" },
        { status: 401 }
      )
    }

    if (process.env.NODE_ENV === "development") {
      console.error("[API] Stripe checkout error:", error)
    }

    // Gestion des erreurs Stripe
    if (error instanceof Stripe.errors.StripeError) {
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { ok: false, error: "Erreur lors de la création de la session de paiement" },
      { status: 500 }
    )
  }
}
