"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { LoadingButton } from "@/components/ui/loading-button"
import { toast } from "sonner"

interface SubscribeButtonProps {
  className?: string
  size?: "default" | "sm" | "lg" | "icon"
}

export default function SubscribeButton({ className, size = "lg" }: SubscribeButtonProps) {
  const [loading, setLoading] = useState(false)

  const handleSubscribe = async () => {
    setLoading(true)

    try {
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      const data = await response.json()

      if (!response.ok) {
        // Gérer les erreurs spécifiques
        if (response.status === 401) {
          toast.error("Authentification requise", {
            description: "Veuillez vous connecter pour vous abonner.",
          })
          // Optionnel: rediriger vers /login
          window.location.href = "/login?next=/linkaday"
          return
        }

        if (response.status === 400) {
          toast.error("Erreur", {
            description: data.error || "Veuillez compléter votre onboarding d'abord.",
          })
          // Optionnel: rediriger vers /onboarding
          if (data.error?.includes("onboarding")) {
            window.location.href = "/onboarding"
          }
          return
        }

        throw new Error(data.error || "Erreur lors de la création de la session de paiement")
      }

      if (data.url) {
        // Rediriger vers Stripe Checkout
        window.location.href = data.url
      } else {
        throw new Error("URL de paiement non reçue")
      }
    } catch (error) {
      console.error("Subscribe error:", error)
      toast.error("Erreur", {
        description: error instanceof Error ? error.message : "Une erreur est survenue lors de l'abonnement.",
      })
      setLoading(false)
    }
  }

  return (
    <LoadingButton
      onClick={handleSubscribe}
      loading={loading}
      loadingText="Redirection..."
      size={size}
      className={className}
    >
      S&apos;abonner 19,99€/mois
    </LoadingButton>
  )
}
