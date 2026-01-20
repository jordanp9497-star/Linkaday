"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { LoadingButton } from "@/components/ui/loading-button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"
import { ArrowRight, ArrowLeft, Save, Download, Check } from "lucide-react"
import type { ProfileJson } from "@/lib/types/profile"
import { defaultProfileJson } from "@/lib/types/profile"

interface ProfileWizardProps {
  initialData: ProfileJson
}

type WizardStep =
  | "identity"
  | "audience"
  | "offer"
  | "positioning"
  | "voice"
  | "advanced"

const STEP_ORDER: WizardStep[] = [
  "identity",
  "audience",
  "offer",
  "positioning",
  "voice",
  "advanced",
]

const STEP_LABELS: Record<WizardStep, string> = {
  identity: "Identité",
  audience: "Audience",
  offer: "Offre & Preuves",
  positioning: "Positionnement",
  voice: "Style",
  advanced: "Avancé",
}

export default function ProfileWizard({ initialData }: ProfileWizardProps) {
  const [data, setData] = useState<ProfileJson>(initialData)
  const [currentStep, setCurrentStep] = useState<WizardStep>("identity")
  const [saving, setSaving] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)

  // Calculer le pourcentage de complétion
  const completionPercentage = calculateCompletion(data)

  // Autosave après 2 secondes d'inactivité
  useEffect(() => {
    const timer = setTimeout(() => {
      handleAutoSave()
    }, 2000)

    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data])

  const handleAutoSave = useCallback(async () => {
    try {
      const response = await fetch("/api/profile/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile_json: data }),
      })

      const result = await response.json()
      if (result.ok) {
        setLastSaved(new Date())
      }
    } catch (error) {
      // Silently fail for autosave
      if (process.env.NODE_ENV === "development") {
        console.error("Autosave error:", error)
      }
    }
  }, [data])

  const handleSave = async () => {
    setSaving(true)
    try {
      const response = await fetch("/api/profile/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile_json: data }),
      })

      const result = await response.json()

      if (!response.ok || !result.ok) {
        throw new Error(result.error || "Erreur lors de la sauvegarde")
      }

      toast.success("Profil sauvegardé avec succès")
      setLastSaved(new Date())
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Une erreur est survenue")
    } finally {
      setSaving(false)
    }
  }

  const handleExportN8n = async () => {
    setExporting(true)
    try {
      const response = await fetch("/api/profile/export-n8n", {
        method: "POST",
      })

      const result = await response.json()

      if (!response.ok || !result.ok) {
        throw new Error(result.error || result.message || "Erreur lors de l'export")
      }

      toast.success("Profil exporté vers n8n avec succès")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Une erreur est survenue")
    } finally {
      setExporting(false)
    }
  }

  const updateData = (section: keyof ProfileJson, updates: any) => {
    setData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        ...updates,
      },
    }))
  }

  const addArrayItem = (section: keyof ProfileJson, field: string, value: string) => {
    if (!value.trim()) return
    const current = (data[section] as any)?.[field] || []
    updateData(section, { [field]: [...current, value.trim()] })
  }

  const removeArrayItem = (section: keyof ProfileJson, field: string, index: number) => {
    const current = (data[section] as any)?.[field] || []
    updateData(section, { [field]: current.filter((_: any, i: number) => i !== index) })
  }

  const currentStepIndex = STEP_ORDER.indexOf(currentStep)
  const canGoNext = currentStepIndex < STEP_ORDER.length - 1
  const canGoPrev = currentStepIndex > 0

  const goToStep = (step: WizardStep) => {
    setCurrentStep(step)
  }

  const goNext = () => {
    if (canGoNext) {
      setCurrentStep(STEP_ORDER[currentStepIndex + 1])
    }
  }

  const goPrev = () => {
    if (canGoPrev) {
      setCurrentStep(STEP_ORDER[currentStepIndex - 1])
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Colonne principale - Wizard */}
      <div className="lg:col-span-2 space-y-6">
        {/* Progress bar */}
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Progression</span>
                <span className="font-semibold">{completionPercentage}%</span>
              </div>
              <Progress value={completionPercentage} className="h-2" />
            </div>
          </CardContent>
        </Card>

        {/* Steps navigation */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-2">
              {STEP_ORDER.map((step, index) => (
                <Button
                  key={step}
                  variant={currentStep === step ? "default" : "outline"}
                  size="sm"
                  onClick={() => goToStep(step)}
                  className="text-xs"
                >
                  {index + 1}. {STEP_LABELS[step]}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Wizard content */}
        <Card>
          <CardHeader>
            <CardTitle>{STEP_LABELS[currentStep]}</CardTitle>
            <CardDescription>
              {getStepDescription(currentStep)}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {currentStep === "identity" && (
              <IdentityStep data={data.identity} updateData={updateData} />
            )}
            {currentStep === "audience" && (
              <AudienceStep data={data.audience} updateData={updateData} addArrayItem={addArrayItem} removeArrayItem={removeArrayItem} />
            )}
            {currentStep === "offer" && (
              <OfferStep data={data.offer} updateData={updateData} addArrayItem={addArrayItem} removeArrayItem={removeArrayItem} />
            )}
            {currentStep === "positioning" && (
              <PositioningStep data={data.positioning} updateData={updateData} addArrayItem={addArrayItem} removeArrayItem={removeArrayItem} />
            )}
            {currentStep === "voice" && (
              <VoiceStep data={data.voice} updateData={updateData} addArrayItem={addArrayItem} removeArrayItem={removeArrayItem} />
            )}
            {currentStep === "advanced" && (
              <AdvancedStep data={data} updateData={updateData} addArrayItem={addArrayItem} removeArrayItem={removeArrayItem} />
            )}

            {/* Navigation buttons */}
            <div className="flex justify-between pt-4 border-t">
              <Button variant="outline" onClick={goPrev} disabled={!canGoPrev}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Précédent
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleSave} disabled={saving}>
                  <Save className="mr-2 h-4 w-4" />
                  {saving ? "Sauvegarde..." : "Sauvegarder"}
                </Button>
                {canGoNext && (
                  <Button onClick={goNext}>
                    Suivant
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Colonne droite - Preview */}
      <div className="lg:col-span-1">
        <Card className="sticky top-4">
          <CardHeader>
            <CardTitle className="text-lg">Résumé Profil</CardTitle>
            <CardDescription>
              {lastSaved && (
                <span className="text-xs text-muted-foreground">
                  Dernière sauvegarde: {lastSaved.toLocaleTimeString()}
                </span>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-muted p-4 rounded-lg">
                <pre className="text-xs overflow-auto max-h-[400px]">
                  {JSON.stringify(data, null, 2)}
                </pre>
              </div>
              <div className="flex flex-col gap-2">
                <LoadingButton
                  onClick={handleSave}
                  loading={saving}
                  className="w-full"
                >
                  <Save className="mr-2 h-4 w-4" />
                  Sauvegarder
                </LoadingButton>
                <Button
                  variant="outline"
                  onClick={handleExportN8n}
                  disabled={exporting}
                  className="w-full"
                >
                  <Download className="mr-2 h-4 w-4" />
                  {exporting ? "Export..." : "Exporter vers n8n"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// Helper functions
function calculateCompletion(data: ProfileJson): number {
  const sections = Object.keys(data)
  let totalFields = 0
  let filledFields = 0

  sections.forEach((sectionKey) => {
    const section = data[sectionKey as keyof ProfileJson] as any
    if (typeof section === "object" && section !== null) {
      Object.keys(section).forEach((fieldKey) => {
        totalFields++
        const value = section[fieldKey]
        if (value !== undefined && value !== null && value !== "") {
          if (Array.isArray(value)) {
            if (value.length > 0) filledFields++
          } else {
            filledFields++
          }
        }
      })
    }
  })

  return totalFields > 0 ? Math.round((filledFields / totalFields) * 100) : 0
}

function getStepDescription(step: WizardStep): string {
  const descriptions: Record<WizardStep, string> = {
    identity: "Définissez votre identité professionnelle",
    audience: "Décrivez votre audience cible",
    offer: "Présentez votre offre et vos preuves",
    positioning: "Affinez votre positionnement",
    voice: "Définissez votre style et votre voix",
    advanced: "Paramètres avancés et stratégie de contenu",
  }
  return descriptions[step]
}

// Step components (simplified - will be expanded)
function IdentityStep({ data, updateData }: any) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="headline">Headline LinkedIn *</Label>
        <Input
          id="headline"
          placeholder="Ex: CEO @ Startup | Expert en Growth"
          value={data.headline || ""}
          onChange={(e) => updateData("identity", { headline: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="industry">Industrie</Label>
        <Input
          id="industry"
          placeholder="Ex: Tech, Finance, Marketing"
          value={data.industry || ""}
          onChange={(e) => updateData("identity", { industry: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="level">Niveau</Label>
        <Input
          id="level"
          placeholder="Ex: C-Level, Manager, Indépendant"
          value={data.level || ""}
          onChange={(e) => updateData("identity", { level: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="location">Localisation</Label>
        <Input
          id="location"
          placeholder="Ex: Paris, France"
          value={data.location || ""}
          onChange={(e) => updateData("identity", { location: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="pronoun_style">Style de pronom</Label>
        <div className="flex gap-2">
          {(["tu", "vous", "mixte"] as const).map((option) => (
            <Button
              key={option}
              type="button"
              variant={data.pronoun_style === option ? "default" : "outline"}
              onClick={() => updateData("identity", { pronoun_style: option })}
              className="capitalize"
            >
              {option}
            </Button>
          ))}
        </div>
      </div>
    </div>
  )
}

function AudienceStep({ data, updateData, addArrayItem, removeArrayItem }: any) {
  const [painInput, setPainInput] = useState("")
  const [objectionInput, setObjectionInput] = useState("")

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="icp">Ideal Customer Profile (ICP)</Label>
        <Textarea
          id="icp"
          placeholder="Décrivez votre client idéal..."
          value={data.icp || ""}
          onChange={(e) => updateData("audience", { icp: e.target.value })}
          rows={4}
        />
      </div>
      <div className="space-y-2">
        <Label>Douleurs de l&apos;audience</Label>
        <div className="flex gap-2">
          <Input
            placeholder="Ajouter une douleur..."
            value={painInput}
            onChange={(e) => setPainInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault()
                addArrayItem("audience", "pains", painInput)
                setPainInput("")
              }
            }}
          />
          <Button
            type="button"
            onClick={() => {
              addArrayItem("audience", "pains", painInput)
              setPainInput("")
            }}
          >
            Ajouter
          </Button>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {(data.pains || []).map((pain: string, index: number) => (
            <Badge key={index} variant="secondary" className="cursor-pointer" onClick={() => removeArrayItem("audience", "pains", index)}>
              {pain} ×
            </Badge>
          ))}
        </div>
      </div>
      <div className="space-y-2">
        <Label>Objections fréquentes</Label>
        <div className="flex gap-2">
          <Input
            placeholder="Ajouter une objection..."
            value={objectionInput}
            onChange={(e) => setObjectionInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault()
                addArrayItem("audience", "objections", objectionInput)
                setObjectionInput("")
              }
            }}
          />
          <Button
            type="button"
            onClick={() => {
              addArrayItem("audience", "objections", objectionInput)
              setObjectionInput("")
            }}
          >
            Ajouter
          </Button>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {(data.objections || []).map((objection: string, index: number) => (
            <Badge key={index} variant="secondary" className="cursor-pointer" onClick={() => removeArrayItem("audience", "objections", index)}>
              {objection} ×
            </Badge>
          ))}
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="maturity">Maturité de l&apos;audience</Label>
        <div className="flex gap-2">
          {(["débutant", "intermédiaire", "avancé", "expert"] as const).map((option) => (
            <Button
              key={option}
              type="button"
              variant={data.maturity === option ? "default" : "outline"}
              onClick={() => updateData("audience", { maturity: option })}
              className="capitalize"
            >
              {option}
            </Button>
          ))}
        </div>
      </div>
    </div>
  )
}

function OfferStep({ data, updateData, addArrayItem, removeArrayItem }: any) {
  const [proofInput, setProofInput] = useState("")

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="primary_offer">Offre principale</Label>
        <Textarea
          id="primary_offer"
          placeholder="Décrivez votre offre principale..."
          value={data.primary_offer || ""}
          onChange={(e) => updateData("offer", { primary_offer: e.target.value })}
          rows={3}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="promise">Promesse principale</Label>
        <Input
          id="promise"
          placeholder="Ex: Doublez vos ventes en 3 mois"
          value={data.promise || ""}
          onChange={(e) => updateData("offer", { promise: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="pricing_range">Gamme de prix</Label>
        <Input
          id="pricing_range"
          placeholder="Ex: €500-2000, Sur devis"
          value={data.pricing_range || ""}
          onChange={(e) => updateData("offer", { pricing_range: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label>Points de preuve</Label>
        <div className="flex gap-2">
          <Input
            placeholder="Ajouter un point de preuve..."
            value={proofInput}
            onChange={(e) => setProofInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault()
                addArrayItem("offer", "proof_points", proofInput)
                setProofInput("")
              }
            }}
          />
          <Button
            type="button"
            onClick={() => {
              addArrayItem("offer", "proof_points", proofInput)
              setProofInput("")
            }}
          >
            Ajouter
          </Button>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {(data.proof_points || []).map((proof: string, index: number) => (
            <Badge key={index} variant="secondary" className="cursor-pointer" onClick={() => removeArrayItem("offer", "proof_points", index)}>
              {proof} ×
            </Badge>
          ))}
        </div>
      </div>
    </div>
  )
}

function PositioningStep({ data, updateData, addArrayItem, removeArrayItem }: any) {
  const [diffInput, setDiffInput] = useState("")
  const [opinionInput, setOpinionInput] = useState("")
  const [avoidInput, setAvoidInput] = useState("")

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Points de différenciation</Label>
        <div className="flex gap-2">
          <Input
            placeholder="Ajouter un point de différenciation..."
            value={diffInput}
            onChange={(e) => setDiffInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault()
                addArrayItem("positioning", "differentiators", diffInput)
                setDiffInput("")
              }
            }}
          />
          <Button
            type="button"
            onClick={() => {
              addArrayItem("positioning", "differentiators", diffInput)
              setDiffInput("")
            }}
          >
            Ajouter
          </Button>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {(data.differentiators || []).map((diff: string, index: number) => (
            <Badge key={index} variant="secondary" className="cursor-pointer" onClick={() => removeArrayItem("positioning", "differentiators", index)}>
              {diff} ×
            </Badge>
          ))}
        </div>
      </div>
      <div className="space-y-2">
        <Label>Opinions fortes</Label>
        <div className="flex gap-2">
          <Input
            placeholder="Ajouter une opinion forte..."
            value={opinionInput}
            onChange={(e) => setOpinionInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault()
                addArrayItem("positioning", "strong_opinions", opinionInput)
                setOpinionInput("")
              }
            }}
          />
          <Button
            type="button"
            onClick={() => {
              addArrayItem("positioning", "strong_opinions", opinionInput)
              setOpinionInput("")
            }}
          >
            Ajouter
          </Button>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {(data.strong_opinions || []).map((opinion: string, index: number) => (
            <Badge key={index} variant="secondary" className="cursor-pointer" onClick={() => removeArrayItem("positioning", "strong_opinions", index)}>
              {opinion} ×
            </Badge>
          ))}
        </div>
      </div>
      <div className="space-y-2">
        <Label>Sujets à éviter</Label>
        <div className="flex gap-2">
          <Input
            placeholder="Ajouter un sujet à éviter..."
            value={avoidInput}
            onChange={(e) => setAvoidInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault()
                addArrayItem("positioning", "topics_to_avoid", avoidInput)
                setAvoidInput("")
              }
            }}
          />
          <Button
            type="button"
            onClick={() => {
              addArrayItem("positioning", "topics_to_avoid", avoidInput)
              setAvoidInput("")
            }}
          >
            Ajouter
          </Button>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {(data.topics_to_avoid || []).map((topic: string, index: number) => (
            <Badge key={index} variant="secondary" className="cursor-pointer" onClick={() => removeArrayItem("positioning", "topics_to_avoid", index)}>
              {topic} ×
            </Badge>
          ))}
        </div>
      </div>
    </div>
  )
}

function VoiceStep({ data, updateData, addArrayItem, removeArrayItem }: any) {
  const [hashtagInput, setHashtagInput] = useState("")
  const [wordUseInput, setWordUseInput] = useState("")
  const [wordAvoidInput, setWordAvoidInput] = useState("")

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="tone">Ton</Label>
        <div className="flex flex-wrap gap-2">
          {(["professionnel", "détendu", "punchy", "pédagogique", "inspirant", "mixte"] as const).map((option) => (
            <Button
              key={option}
              type="button"
              variant={data.tone === option ? "default" : "outline"}
              onClick={() => updateData("voice", { tone: option })}
              className="capitalize"
            >
              {option}
            </Button>
          ))}
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="length">Longueur des posts</Label>
        <Input
          id="length"
          placeholder="Ex: 200-300 mots, court, moyen"
          value={data.length || ""}
          onChange={(e) => updateData("voice", { length: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label>Utiliser des emojis ?</Label>
        <div className="flex gap-2">
          <Button
            type="button"
            variant={data.emojis === true ? "default" : "outline"}
            onClick={() => updateData("voice", { emojis: true })}
          >
            Oui
          </Button>
          <Button
            type="button"
            variant={data.emojis === false ? "default" : "outline"}
            onClick={() => updateData("voice", { emojis: false })}
          >
            Non
          </Button>
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="cta_style">Style de CTA</Label>
        <div className="flex gap-2">
          {(["soft", "direct", "question", "aucun"] as const).map((option) => (
            <Button
              key={option}
              type="button"
              variant={data.cta_style === option ? "default" : "outline"}
              onClick={() => updateData("voice", { cta_style: option })}
              className="capitalize"
            >
              {option}
            </Button>
          ))}
        </div>
      </div>
      <div className="space-y-2">
        <Label>Hashtags à utiliser</Label>
        <div className="flex gap-2">
          <Input
            placeholder="Ajouter un hashtag..."
            value={hashtagInput}
            onChange={(e) => setHashtagInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault()
                addArrayItem("voice", "hashtags", hashtagInput)
                setHashtagInput("")
              }
            }}
          />
          <Button
            type="button"
            onClick={() => {
              addArrayItem("voice", "hashtags", hashtagInput)
              setHashtagInput("")
            }}
          >
            Ajouter
          </Button>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {(data.hashtags || []).map((hashtag: string, index: number) => (
            <Badge key={index} variant="secondary" className="cursor-pointer" onClick={() => removeArrayItem("voice", "hashtags", index)}>
              #{hashtag} ×
            </Badge>
          ))}
        </div>
      </div>
      <div className="space-y-2">
        <Label>Mots à utiliser</Label>
        <div className="flex gap-2">
          <Input
            placeholder="Ajouter un mot..."
            value={wordUseInput}
            onChange={(e) => setWordUseInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault()
                addArrayItem("voice", "words_to_use", wordUseInput)
                setWordUseInput("")
              }
            }}
          />
          <Button
            type="button"
            onClick={() => {
              addArrayItem("voice", "words_to_use", wordUseInput)
              setWordUseInput("")
            }}
          >
            Ajouter
          </Button>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {(data.words_to_use || []).map((word: string, index: number) => (
            <Badge key={index} variant="secondary" className="cursor-pointer" onClick={() => removeArrayItem("voice", "words_to_use", index)}>
              {word} ×
            </Badge>
          ))}
        </div>
      </div>
      <div className="space-y-2">
        <Label>Mots à éviter</Label>
        <div className="flex gap-2">
          <Input
            placeholder="Ajouter un mot..."
            value={wordAvoidInput}
            onChange={(e) => setWordAvoidInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault()
                addArrayItem("voice", "words_to_avoid", wordAvoidInput)
                setWordAvoidInput("")
              }
            }}
          />
          <Button
            type="button"
            onClick={() => {
              addArrayItem("voice", "words_to_avoid", wordAvoidInput)
              setWordAvoidInput("")
            }}
          >
            Ajouter
          </Button>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {(data.words_to_avoid || []).map((word: string, index: number) => (
            <Badge key={index} variant="secondary" className="cursor-pointer" onClick={() => removeArrayItem("voice", "words_to_avoid", index)}>
              {word} ×
            </Badge>
          ))}
        </div>
      </div>
    </div>
  )
}

function AdvancedStep({ data, updateData, addArrayItem, removeArrayItem }: any) {
  const [pillarInput, setPillarInput] = useState("")
  const [keywordInput, setKeywordInput] = useState("")
  const [companyInput, setCompanyInput] = useState("")

  return (
    <div className="space-y-6">
      {/* Content Strategy */}
      <div className="space-y-4">
        <h3 className="font-semibold">Stratégie de contenu</h3>
        <div className="space-y-2">
          <Label>Piliers de contenu</Label>
          <div className="flex gap-2">
            <Input
              placeholder="Ex: Éducation, Inspiration, Vente"
              value={pillarInput}
              onChange={(e) => setPillarInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  addArrayItem("content_strategy", "pillars", pillarInput)
                  setPillarInput("")
                }
              }}
            />
            <Button
              type="button"
              onClick={() => {
                addArrayItem("content_strategy", "pillars", pillarInput)
                setPillarInput("")
              }}
            >
              Ajouter
            </Button>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {(data.content_strategy?.pillars || []).map((pillar: string, index: number) => (
              <Badge key={index} variant="secondary" className="cursor-pointer" onClick={() => removeArrayItem("content_strategy", "pillars", index)}>
                {pillar} ×
              </Badge>
            ))}
          </div>
        </div>
      </div>

      {/* Assets */}
      <div className="space-y-4">
        <h3 className="font-semibold">Ressources</h3>
        <div className="space-y-2">
          <Label htmlFor="lead_magnet_url">URL Lead Magnet</Label>
          <Input
            id="lead_magnet_url"
            placeholder="https://..."
            value={data.assets?.lead_magnet_url || ""}
            onChange={(e) => updateData("assets", { lead_magnet_url: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="booking_url">URL Prise de RDV</Label>
          <Input
            id="booking_url"
            placeholder="https://..."
            value={data.assets?.booking_url || ""}
            onChange={(e) => updateData("assets", { booking_url: e.target.value })}
          />
        </div>
      </div>

      {/* Signals */}
      <div className="space-y-4">
        <h3 className="font-semibold">Signaux</h3>
        <div className="space-y-2">
          <Label>Mots-clés à surveiller</Label>
          <div className="flex gap-2">
            <Input
              placeholder="Ajouter un mot-clé..."
              value={keywordInput}
              onChange={(e) => setKeywordInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  addArrayItem("signals", "keywords", keywordInput)
                  setKeywordInput("")
                }
              }}
            />
            <Button
              type="button"
              onClick={() => {
                addArrayItem("signals", "keywords", keywordInput)
                setKeywordInput("")
              }}
            >
              Ajouter
            </Button>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {(data.signals?.keywords || []).map((keyword: string, index: number) => (
              <Badge key={index} variant="secondary" className="cursor-pointer" onClick={() => removeArrayItem("signals", "keywords", index)}>
                {keyword} ×
              </Badge>
            ))}
          </div>
        </div>
        <div className="space-y-2">
          <Label>Entreprises à suivre</Label>
          <div className="flex gap-2">
            <Input
              placeholder="Ajouter une entreprise..."
              value={companyInput}
              onChange={(e) => setCompanyInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  addArrayItem("signals", "companies_to_follow", companyInput)
                  setCompanyInput("")
                }
              }}
            />
            <Button
              type="button"
              onClick={() => {
                addArrayItem("signals", "companies_to_follow", companyInput)
                setCompanyInput("")
              }}
            >
              Ajouter
            </Button>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {(data.signals?.companies_to_follow || []).map((company: string, index: number) => (
              <Badge key={index} variant="secondary" className="cursor-pointer" onClick={() => removeArrayItem("signals", "companies_to_follow", index)}>
                {company} ×
              </Badge>
            ))}
          </div>
        </div>
      </div>

      {/* Constraints */}
      <div className="space-y-4">
        <h3 className="font-semibold">Contraintes</h3>
        <div className="space-y-2">
          <Label htmlFor="legal_notes">Notes légales</Label>
          <Textarea
            id="legal_notes"
            placeholder="Contraintes légales, mentions obligatoires..."
            value={data.constraints?.legal_notes || ""}
            onChange={(e) => updateData("constraints", { legal_notes: e.target.value })}
            rows={3}
          />
        </div>
      </div>
    </div>
  )
}
