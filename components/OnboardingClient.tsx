"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { LoadingButton } from "@/components/ui/loading-button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { toast } from "sonner"
import { ArrowRight, Check } from "lucide-react"

type Step = 1 | 2 | 3

interface OnboardingData {
  // Étape 1: Ton activité
  secteur: string
  cible: string
  ton: "pro" | "détendu" | "punchy" | ""
  
  // Étape 2: Objectifs LinkedIn
  objectifs: {
    leads: boolean
    recrutement: boolean
    personalBranding: boolean
  }
  frequence: string
  
  // Étape 3: Directives de rédaction
  motsAEviter: string
  style: string
  emojis: boolean
  longueur: string
}

export default function OnboardingClient() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState<Step>(1)
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<OnboardingData>({
    secteur: "",
    cible: "",
    ton: "",
    objectifs: {
      leads: false,
      recrutement: false,
      personalBranding: false,
    },
    frequence: "",
    motsAEviter: "",
    style: "",
    emojis: true,
    longueur: "",
  })

  const progress = ((currentStep - 1) / 2) * 100

  const validateStep1 = (): boolean => {
    return data.secteur.trim() !== "" && data.cible.trim() !== "" && data.ton !== ""
  }

  const validateStep2 = (): boolean => {
    const hasObjective = data.objectifs.leads || data.objectifs.recrutement || data.objectifs.personalBranding
    return hasObjective && data.frequence.trim() !== ""
  }

  const validateStep3 = (): boolean => {
    return data.style.trim() !== "" && data.longueur.trim() !== ""
  }

  const handleNext = () => {
    if (currentStep === 1 && !validateStep1()) {
      toast.error("Veuillez remplir tous les champs")
      return
    }
    if (currentStep === 2 && !validateStep2()) {
      toast.error("Veuillez sélectionner au moins un objectif et indiquer la fréquence")
      return
    }
    if (currentStep < 3) {
      setCurrentStep((prev) => (prev + 1) as Step)
    }
  }

  const handleSubmit = async () => {
    if (!validateStep3()) {
      toast.error("Veuillez remplir tous les champs")
      return
    }

    setLoading(true)

    try {
      // Préparer les données pour l'API
      const directiveJson = {
        motsAEviter: data.motsAEviter.split(",").map((m) => m.trim()).filter(Boolean),
        style: data.style,
        emojis: data.emojis,
        longueur: data.longueur,
      }

      const onboardingJson = {
        etape1: {
          secteur: data.secteur,
          cible: data.cible,
          ton: data.ton,
        },
        etape2: {
          objectifs: data.objectifs,
          frequence: data.frequence,
        },
        etape3: {
          motsAEviter: data.motsAEviter,
          style: data.style,
          emojis: data.emojis,
          longueur: data.longueur,
        },
      }

      const response = await fetch("/api/profile/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          directive_json: directiveJson,
          onboarding_json: onboardingJson,
          onboarding_completed: true,
        }),
      })

      const result = await response.json()

      if (!response.ok || !result.ok) {
        throw new Error(result.error || "Erreur lors de l'enregistrement")
      }

      toast.success("Onboarding enregistré")
      router.push("/billing")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Une erreur est survenue")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 md:space-y-8 px-4">
      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Étape {currentStep} sur 3</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Étape 1: Ton activité */}
      {currentStep === 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Étape 1 : Ton activité</CardTitle>
            <CardDescription>
              Aide-nous à mieux comprendre ton contexte professionnel
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="secteur">Secteur d&apos;activité *</Label>
              <Input
                id="secteur"
                placeholder="Ex: Tech, Finance, Marketing..."
                value={data.secteur}
                onChange={(e) => setData({ ...data, secteur: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cible">Ta cible *</Label>
              <Input
                id="cible"
                placeholder="Ex: Entrepreneurs, CTOs, Directeurs Marketing..."
                value={data.cible}
                onChange={(e) => setData({ ...data, cible: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Ton de communication *</Label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {(["pro", "détendu", "punchy"] as const).map((option) => (
                  <Button
                    key={option}
                    type="button"
                    variant={data.ton === option ? "default" : "outline"}
                    onClick={() => setData({ ...data, ton: option })}
                    className="capitalize"
                  >
                    {data.ton === option && <Check className="mr-2 h-4 w-4" />}
                    {option}
                  </Button>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button onClick={handleNext} size="lg" className="w-full sm:w-auto">
                Continuer
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Étape 2: Objectifs LinkedIn */}
      {currentStep === 2 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Étape 2 : Objectifs LinkedIn</CardTitle>
            <CardDescription>
              Quels sont tes objectifs sur LinkedIn ?
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Objectifs (sélectionne au moins un) *</Label>
              <div className="grid gap-3">
                {[
                  { key: "leads", label: "Générer des leads" },
                  { key: "recrutement", label: "Recruter des talents" },
                  { key: "personalBranding", label: "Personal branding" },
                ].map(({ key, label }) => (
                  <Button
                    key={key}
                    type="button"
                    variant={data.objectifs[key as keyof typeof data.objectifs] ? "default" : "outline"}
                    onClick={() =>
                      setData({
                        ...data,
                        objectifs: {
                          ...data.objectifs,
                          [key]: !data.objectifs[key as keyof typeof data.objectifs],
                        },
                      })
                    }
                    className="justify-start"
                  >
                    {data.objectifs[key as keyof typeof data.objectifs] && (
                      <Check className="mr-2 h-4 w-4" />
                    )}
                    {label}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="frequence">Fréquence de publication souhaitée *</Label>
              <Input
                id="frequence"
                placeholder="Ex: 3 posts par semaine, 1 post par jour..."
                value={data.frequence}
                onChange={(e) => setData({ ...data, frequence: e.target.value })}
              />
            </div>

            <div className="flex flex-col sm:flex-row justify-between gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setCurrentStep(1)}
                size="lg"
                className="w-full sm:w-auto"
              >
                Retour
              </Button>
              <Button onClick={handleNext} size="lg" className="w-full sm:w-auto">
                Continuer
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Étape 3: Directives de rédaction */}
      {currentStep === 3 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Étape 3 : Directives de rédaction</CardTitle>
            <CardDescription>
              Personnalise le style de tes posts LinkedIn
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="motsAEviter">Mots à éviter (séparés par des virgules)</Label>
              <Input
                id="motsAEviter"
                placeholder="Ex: révolutionnaire, disruptif, game-changer..."
                value={data.motsAEviter}
                onChange={(e) => setData({ ...data, motsAEviter: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="style">Style de rédaction *</Label>
              <Textarea
                id="style"
                placeholder="Ex: Style direct et factuel, avec des exemples concrets. Éviter le jargon technique..."
                value={data.style}
                onChange={(e) => setData({ ...data, style: e.target.value })}
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label>Utiliser des emojis ?</Label>
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant={data.emojis ? "default" : "outline"}
                  onClick={() => setData({ ...data, emojis: true })}
                >
                  {data.emojis && <Check className="mr-2 h-4 w-4" />}
                  Oui
                </Button>
                <Button
                  type="button"
                  variant={!data.emojis ? "default" : "outline"}
                  onClick={() => setData({ ...data, emojis: false })}
                >
                  {!data.emojis && <Check className="mr-2 h-4 w-4" />}
                  Non
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="longueur">Longueur des posts *</Label>
              <Input
                id="longueur"
                placeholder="Ex: 200-300 mots, court et percutant, moyen format..."
                value={data.longueur}
                onChange={(e) => setData({ ...data, longueur: e.target.value })}
              />
            </div>

            <div className="flex flex-col sm:flex-row justify-between gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setCurrentStep(2)}
                size="lg"
                className="w-full sm:w-auto"
              >
                Retour
              </Button>
              <LoadingButton
                onClick={handleSubmit}
                size="lg"
                loading={loading}
                loadingText="Enregistrement..."
                className="w-full sm:w-auto"
              >
                Terminer
                <Check className="ml-2 h-4 w-4" />
              </LoadingButton>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
