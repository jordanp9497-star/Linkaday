"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { LoadingButton } from "@/components/ui/loading-button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { toast } from "sonner"
import { ArrowRight, ArrowLeft, Save, Check, X } from "lucide-react"
import type { Profile } from "@/lib/types"

interface ProfileClientProps {
  profile: Profile | null
}

type WizardStep = 1 | 2 | 3 | 4

interface ProfileData {
  // Étape 1: Informations de base
  contact_email: string
  job_title: string
  industry: string
  seniority: string
  tone: string

  // Étape 2: Focus et contexte
  focus: string[]
  stack_context: string[]
  audience_target: string[]

  // Étape 3: Directives LinkedIn
  directive_json: {
    tone?: string
    emojis?: boolean
    length?: string
    hashtags?: string[]
    words_to_avoid?: string[]
    words_to_use?: string[]
    cta_style?: string
    formats?: string[]
  }

  // Étape 4: Informations personnelles
  personal_json: {
    contact_email?: string
    links?: string[]
    proof_points?: string[]
    strong_opinions?: string[]
  }

  // Onboarding (stocke toutes les réponses)
  onboarding_json: Record<string, any>
}

export default function ProfileClient({ profile }: ProfileClientProps) {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState<WizardStep>(1)
  const [saving, setSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)

  // Initialiser les données depuis le profil
  const [data, setData] = useState<ProfileData>(() => {
    const directiveJson = profile?.directive_json as ProfileData["directive_json"] | null
    const personalJson = profile?.personal_json as ProfileData["personal_json"] | null
    const onboardingJson = profile?.onboarding_json || {}

    return {
      contact_email: profile?.contact_email || profile?.email || "",
      job_title: (profile as any)?.job_title || "",
      industry: (profile as any)?.industry || "",
      seniority: (profile as any)?.seniority || "",
      tone: (profile as any)?.tone || "",
      focus: (profile as any)?.focus || [],
      stack_context: (profile as any)?.stack_context || [],
      audience_target: (profile as any)?.audience_target || [],
      directive_json: directiveJson || {
        tone: "",
        emojis: true,
        length: "",
        hashtags: [],
        words_to_avoid: [],
        words_to_use: [],
        cta_style: "",
        formats: [],
      },
      personal_json: personalJson || {
        contact_email: profile?.contact_email || "",
        links: [],
        proof_points: [],
        strong_opinions: [],
      },
      onboarding_json: onboardingJson,
    }
  })

  // Autosave après 3 secondes d'inactivité
  useEffect(() => {
    const timer = setTimeout(() => {
      handleAutoSave()
    }, 3000)

    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data])

  const handleAutoSave = useCallback(async () => {
    // Ne pas autosave si contact_email est vide (obligatoire)
    if (!data.contact_email.trim()) return

    try {
      const response = await fetch("/api/profile/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contact_email: data.contact_email,
          focus: data.focus,
          stack_context: data.stack_context,
          audience_target: data.audience_target,
          directive_json: data.directive_json,
          personal_json: data.personal_json,
          onboarding_json: data.onboarding_json,
        }),
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
    // Validation: contact_email obligatoire
    if (!data.contact_email.trim()) {
      toast.error("L&apos;email de contact est obligatoire")
      return
    }

    setSaving(true)
    try {
      const response = await fetch("/api/profile/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contact_email: data.contact_email,
          job_title: data.job_title,
          industry: data.industry,
          seniority: data.seniority,
          tone: data.tone,
          focus: data.focus,
          stack_context: data.stack_context,
          audience_target: data.audience_target,
          directive_json: data.directive_json,
          personal_json: {
            ...data.personal_json,
            contact_email: data.contact_email, // Synchroniser avec contact_email
          },
          onboarding_json: data.onboarding_json,
          onboarding_completed: true,
        }),
      })

      const result = await response.json()

      if (!response.ok || !result.ok) {
        throw new Error(result.error || "Erreur lors de la sauvegarde")
      }

      toast.success("Profil enregistré avec succès")
      router.push("/dashboard")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Une erreur est survenue")
      setSaving(false)
    }
  }

  const updateData = (updates: Partial<ProfileData>) => {
    setData((prev) => ({ ...prev, ...updates }))
  }

  const addArrayItem = (field: keyof ProfileData, value: string, subField?: string) => {
    if (!value.trim()) return

    if (subField) {
      // Pour les champs imbriqués (directive_json, personal_json)
      setData((prev) => {
        const nested = prev[field] as any
        const current = nested[subField] || []
        return {
          ...prev,
          [field]: {
            ...nested,
            [subField]: [...current, value.trim()],
          },
        }
      })
    } else {
      // Pour les arrays directs
      setData((prev) => ({
        ...prev,
        [field]: [...(prev[field] as string[]), value.trim()],
      }))
    }
  }

  const removeArrayItem = (field: keyof ProfileData, index: number, subField?: string) => {
    if (subField) {
      setData((prev) => {
        const nested = prev[field] as any
        const current = nested[subField] || []
        return {
          ...prev,
          [field]: {
            ...nested,
            [subField]: current.filter((_: any, i: number) => i !== index),
          },
        }
      })
    } else {
      setData((prev) => ({
        ...prev,
        [field]: (prev[field] as string[]).filter((_, i) => i !== index),
      }))
    }
  }

  const progress = ((currentStep - 1) / 3) * 100

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Colonne principale - Wizard */}
      <div className="lg:col-span-2 space-y-6">
        {/* Progress bar */}
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Étape {currentStep} sur 4</span>
                <span className="font-semibold">{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          </CardContent>
        </Card>

        {/* Étape 1: Informations de base */}
        {currentStep === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Étape 1 : Informations de base</CardTitle>
              <CardDescription>Vos informations professionnelles essentielles</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="contact_email">
                  Email de contact <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="contact_email"
                  type="email"
                  placeholder="contact@exemple.com"
                  value={data.contact_email}
                  onChange={(e) => updateData({ contact_email: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="job_title">Titre du poste</Label>
                <Input
                  id="job_title"
                  placeholder="Ex: CEO, CTO, Product Manager..."
                  value={data.job_title}
                  onChange={(e) => updateData({ job_title: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="industry">Industrie</Label>
                <Input
                  id="industry"
                  placeholder="Ex: Tech, Finance, Marketing..."
                  value={data.industry}
                  onChange={(e) => updateData({ industry: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="seniority">Niveau d&apos;expérience</Label>
                <Input
                  id="seniority"
                  placeholder="Ex: Junior, Senior, C-Level..."
                  value={data.seniority}
                  onChange={(e) => updateData({ seniority: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tone">Ton de communication</Label>
                <div className="flex flex-wrap gap-2">
                  {(["professionnel", "détendu", "punchy", "pédagogique", "inspirant"] as const).map((option) => (
                    <Button
                      key={option}
                      type="button"
                      variant={data.tone === option ? "default" : "outline"}
                      onClick={() => updateData({ tone: option })}
                      className="capitalize"
                    >
                      {data.tone === option && <Check className="mr-2 h-4 w-4" />}
                      {option}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Étape 2: Focus et contexte */}
        {currentStep === 2 && (
          <Card>
            <CardHeader>
              <CardTitle>Étape 2 : Focus et contexte</CardTitle>
              <CardDescription>Définissez vos domaines d&apos;expertise et votre audience</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <TagsInput
                label="Focus"
                value={data.focus}
                onAdd={(value) => addArrayItem("focus", value)}
                onRemove={(index) => removeArrayItem("focus", index)}
                placeholder="Ex: Growth, Product, Engineering..."
              />
              <TagsInput
                label="Stack / Contexte technique"
                value={data.stack_context}
                onAdd={(value) => addArrayItem("stack_context", value)}
                onRemove={(index) => removeArrayItem("stack_context", index)}
                placeholder="Ex: React, Python, AWS..."
              />
              <TagsInput
                label="Audience cible"
                value={data.audience_target}
                onAdd={(value) => addArrayItem("audience_target", value)}
                onRemove={(index) => removeArrayItem("audience_target", index)}
                placeholder="Ex: CTOs, Product Managers, Entrepreneurs..."
              />
            </CardContent>
          </Card>
        )}

        {/* Étape 3: Directives LinkedIn */}
        {currentStep === 3 && (
          <Card>
            <CardHeader>
              <CardTitle>Étape 3 : Directives LinkedIn</CardTitle>
              <CardDescription>Personnalisez le style de vos posts LinkedIn</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="directive_tone">Ton</Label>
                <div className="flex flex-wrap gap-2">
                  {(["professionnel", "détendu", "punchy", "pédagogique", "inspirant"] as const).map((option) => (
                    <Button
                      key={option}
                      type="button"
                      variant={data.directive_json.tone === option ? "default" : "outline"}
                      onClick={() => updateData({ directive_json: { ...data.directive_json, tone: option } })}
                      className="capitalize"
                    >
                      {data.directive_json.tone === option && <Check className="mr-2 h-4 w-4" />}
                      {option}
                    </Button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="directive_length">Longueur des posts</Label>
                <Input
                  id="directive_length"
                  placeholder="Ex: 200-300 mots, court, moyen..."
                  value={data.directive_json.length || ""}
                  onChange={(e) => updateData({ directive_json: { ...data.directive_json, length: e.target.value } })}
                />
              </div>
              <div className="space-y-2">
                <Label>Utiliser des emojis ?</Label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={data.directive_json.emojis === true ? "default" : "outline"}
                    onClick={() => updateData({ directive_json: { ...data.directive_json, emojis: true } })}
                  >
                    Oui
                  </Button>
                  <Button
                    type="button"
                    variant={data.directive_json.emojis === false ? "default" : "outline"}
                    onClick={() => updateData({ directive_json: { ...data.directive_json, emojis: false } })}
                  >
                    Non
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="directive_cta_style">Style de CTA</Label>
                <div className="flex gap-2">
                  {(["soft", "direct", "question", "aucun"] as const).map((option) => (
                    <Button
                      key={option}
                      type="button"
                      variant={data.directive_json.cta_style === option ? "default" : "outline"}
                      onClick={() => updateData({ directive_json: { ...data.directive_json, cta_style: option } })}
                      className="capitalize"
                    >
                      {option}
                    </Button>
                  ))}
                </div>
              </div>
              <TagsInput
                label="Hashtags à utiliser"
                value={data.directive_json.hashtags || []}
                onAdd={(value) => addArrayItem("directive_json", value, "hashtags")}
                onRemove={(index) => removeArrayItem("directive_json", index, "hashtags")}
                placeholder="Ex: #Tech, #Startup..."
              />
              <TagsInput
                label="Mots à utiliser"
                value={data.directive_json.words_to_use || []}
                onAdd={(value) => addArrayItem("directive_json", value, "words_to_use")}
                onRemove={(index) => removeArrayItem("directive_json", index, "words_to_use")}
                placeholder="Ex: innovation, impact..."
              />
              <TagsInput
                label="Mots à éviter"
                value={data.directive_json.words_to_avoid || []}
                onAdd={(value) => addArrayItem("directive_json", value, "words_to_avoid")}
                onRemove={(index) => removeArrayItem("directive_json", index, "words_to_avoid")}
                placeholder="Ex: révolutionnaire, disruptif..."
              />
              <div className="space-y-2">
                <Label htmlFor="directive_formats">Formats préférés (séparés par des virgules)</Label>
                <Input
                  id="directive_formats"
                  placeholder="Ex: carousel, article, vidéo, texte..."
                  value={(data.directive_json.formats || []).join(", ")}
                  onChange={(e) =>
                    updateData({
                      directive_json: {
                        ...data.directive_json,
                        formats: e.target.value.split(",").map((f) => f.trim()).filter(Boolean),
                      },
                    })
                  }
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Étape 4: Informations personnelles */}
        {currentStep === 4 && (
          <Card>
            <CardHeader>
              <CardTitle>Étape 4 : Informations personnelles</CardTitle>
              <CardDescription>Liens, preuves et opinions fortes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <TagsInput
                label="Liens (URLs)"
                value={data.personal_json.links || []}
                onAdd={(value) => addArrayItem("personal_json", value, "links")}
                onRemove={(index) => removeArrayItem("personal_json", index, "links")}
                placeholder="Ex: https://mon-site.com..."
              />
              <TagsInput
                label="Points de preuve"
                value={data.personal_json.proof_points || []}
                onAdd={(value) => addArrayItem("personal_json", value, "proof_points")}
                onRemove={(index) => removeArrayItem("personal_json", index, "proof_points")}
                placeholder="Ex: +200% de croissance en 6 mois..."
              />
              <TagsInput
                label="Opinions fortes"
                value={data.personal_json.strong_opinions || []}
                onAdd={(value) => addArrayItem("personal_json", value, "strong_opinions")}
                onRemove={(index) => removeArrayItem("personal_json", index, "strong_opinions")}
                placeholder="Ex: Le remote work est l&apos;avenir..."
              />
            </CardContent>
          </Card>
        )}

        {/* Navigation */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => setCurrentStep((prev) => Math.max(1, (prev - 1) as WizardStep) as WizardStep)}
                disabled={currentStep === 1}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Précédent
              </Button>
              {currentStep < 4 ? (
                <Button onClick={() => setCurrentStep((prev) => (prev + 1) as WizardStep)}>
                  Suivant
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <LoadingButton onClick={handleSave} loading={saving} loadingText="Enregistrement...">
                  <Save className="mr-2 h-4 w-4" />
                  Enregistrer
                </LoadingButton>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Colonne droite - Preview */}
      <div className="lg:col-span-1">
        <Card className="sticky top-4">
          <CardHeader>
            <CardTitle className="text-lg">Résumé du profil</CardTitle>
            <CardDescription>
              {lastSaved && (
                <span className="text-xs text-muted-foreground">
                  Dernière sauvegarde: {lastSaved.toLocaleTimeString()}
                </span>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-muted p-4 rounded-lg">
              <pre className="text-xs overflow-auto max-h-[400px]">
                {JSON.stringify(data, null, 2)}
              </pre>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// Composant TagsInput réutilisable
interface TagsInputProps {
  label: string
  value: string[]
  onAdd: (value: string) => void
  onRemove: (index: number) => void
  placeholder?: string
}

function TagsInput({ label, value, onAdd, onRemove, placeholder }: TagsInputProps) {
  const [inputValue, setInputValue] = useState("")

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault()
      if (inputValue.trim()) {
        onAdd(inputValue)
        setInputValue("")
      }
    }
  }

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex gap-2">
        <Input
          placeholder={placeholder}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <Button type="button" onClick={() => { if (inputValue.trim()) { onAdd(inputValue); setInputValue("") } }}>
          Ajouter
        </Button>
      </div>
      <div className="flex flex-wrap gap-2 mt-2">
        {value.map((item, index) => (
          <Badge key={index} variant="secondary" className="cursor-pointer" onClick={() => onRemove(index)}>
            {item} <X className="ml-1 h-3 w-3 inline" />
          </Badge>
        ))}
      </div>
    </div>
  )
}
