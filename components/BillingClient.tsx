"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { LoadingButton } from "@/components/ui/loading-button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { Check, Zap, Calendar, MessageSquare, ArrowRight } from "lucide-react"

interface BillingClientProps {
  isSubscribed: boolean
}

export default function BillingClient({ isSubscribed }: BillingClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(false)

  // Afficher un message si l'utilisateur a annulé (une seule fois)
  useEffect(() => {
    const canceled = searchParams.get("canceled") === "1"
    if (canceled) {
      toast.info("Paiement annulé")
      // Nettoyer l'URL pour éviter de réafficher le toast
      router.replace("/billing", { scroll: false })
    }
  }, [searchParams, router])

  const handleSubscribe = async () => {
    setLoading(true)

    try {
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      const result = await response.json()

      if (!response.ok || !result.ok) {
        throw new Error(result.error || "Erreur lors de la création de la session de paiement")
      }

      // Rediriger vers Stripe Checkout
      if (result.url) {
        window.location.href = result.url
      } else {
        throw new Error("URL de checkout non reçue")
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Une erreur est survenue")
      setLoading(false)
    }
  }

  if (isSubscribed) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Check className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-3xl">Déjà abonné ✅</CardTitle>
          <CardDescription className="text-lg">
            Vous bénéficiez du Plan Pro avec tous ses avantages
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Check className="h-5 w-5 text-primary" />
              <span>Posts quotidiens automatiques</span>
            </div>
            <div className="flex items-center gap-3">
              <Check className="h-5 w-5 text-primary" />
              <span>Validation via Telegram</span>
            </div>
            <div className="flex items-center gap-3">
              <Check className="h-5 w-5 text-primary" />
              <span>Planification avancée</span>
            </div>
          </div>
          <div className="pt-4">
            <Button
              size="lg"
              className="w-full"
              onClick={() => router.push("/connect-telegram")}
            >
              Connecter Telegram
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-3xl">Plan Pro</CardTitle>
        <CardDescription className="text-lg">
          Accédez à toutes les fonctionnalités premium
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Prix */}
        <div className="text-center">
          <div className="text-4xl font-bold">9,90€</div>
          <div className="text-muted-foreground">/mois</div>
        </div>

        {/* Bénéfices */}
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <Zap className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <div className="font-semibold">Posts quotidiens</div>
              <div className="text-sm text-muted-foreground">
                Génération automatique de posts LinkedIn personnalisés chaque jour
              </div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <MessageSquare className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <div className="font-semibold">Validation Telegram</div>
              <div className="text-sm text-muted-foreground">
                Valide ou régénère tes posts directement depuis Telegram
              </div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Calendar className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <div className="font-semibold">Planification</div>
              <div className="text-sm text-muted-foreground">
                Programme tes publications à l&apos;avance
              </div>
            </div>
          </div>
        </div>

        {/* Bouton S'abonner */}
        <div className="pt-4">
          <LoadingButton
            size="lg"
            className="w-full"
            onClick={handleSubscribe}
            loading={loading}
            loadingText="Redirection..."
          >
            S&apos;abonner
            <ArrowRight className="ml-2 h-4 w-4" />
          </LoadingButton>
        </div>
      </CardContent>
    </Card>
  )
}
