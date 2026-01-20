"use client"

import { useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { MessageSquare, Check, Clock, ExternalLink } from "lucide-react"

interface ConnectTelegramClientProps {
  isActive: boolean
  plan: "free" | "pro"
  telegramChatId: string | null
}

export default function ConnectTelegramClient({
  isActive,
  plan,
  telegramChatId,
}: ConnectTelegramClientProps) {
  const searchParams = useSearchParams()

  // Afficher le toast si success=1 (une seule fois)
  useEffect(() => {
    const success = searchParams.get("success")
    if (success === "1") {
      toast.success("Paiement confirmé ✅")
      // Nettoyer l'URL pour éviter de réafficher le toast
      const url = new URL(window.location.href)
      url.searchParams.delete("success")
      window.history.replaceState({}, "", url.toString())
    }
  }, [searchParams])

  const telegramUrl = `https://t.me/${process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME}?start=1`
  const isConnected = telegramChatId !== null

  return (
    <div className="space-y-6 md:space-y-8 px-4">
      {/* En-tête */}
      <div className="text-center">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">Connecter Telegram</h1>
        <p className="text-muted-foreground text-base md:text-lg">
          Reçois tes thèmes de posts LinkedIn automatiquement chaque jour
        </p>
      </div>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-6 w-6" />
            Instructions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold">
                1
              </div>
              <div>
                <div className="font-semibold">Ouvre Telegram</div>
                <div className="text-sm text-muted-foreground">
                  Clique sur le bouton ci-dessous pour ouvrir Telegram
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold">
                2
              </div>
              <div>
                <div className="font-semibold">Clique Start</div>
                <div className="text-sm text-muted-foreground">
                  Dans la conversation avec le bot, clique sur le bouton "Start"
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold">
                3
              </div>
              <div>
                <div className="font-semibold">Tu recevras tes thèmes automatiquement chaque jour</div>
                <div className="text-sm text-muted-foreground">
                  Le bot t'enverra des thèmes de posts personnalisés selon tes préférences
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4">
            <Button
              size="lg"
              className="w-full"
              onClick={() => window.open(telegramUrl, "_blank")}
            >
              <MessageSquare className="mr-2 h-5 w-5" />
              Ouvrir Telegram
              <ExternalLink className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* État */}
      <Card>
        <CardHeader>
          <CardTitle>État de la connexion</CardTitle>
          <CardDescription>Informations sur ton abonnement et ta connexion Telegram</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Plan</span>
            <Badge variant={plan === "pro" ? "default" : "secondary"} className="capitalize">
              {plan}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Statut</span>
            <Badge variant={isActive ? "default" : "secondary"}>
              {isActive ? "Actif" : "Inactif"}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Telegram</span>
            <div className="flex items-center gap-2">
              {isConnected ? (
                <>
                  <Check className="h-4 w-4 text-primary" />
                  <span className="font-semibold text-primary">Connecté ✅</span>
                </>
              ) : (
                <>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">En attente de Start</span>
                </>
              )}
            </div>
          </div>
          {isConnected && (
            <div className="pt-2 border-t">
              <div className="text-sm text-muted-foreground">
                Chat ID: <span className="font-mono">{telegramChatId}</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
