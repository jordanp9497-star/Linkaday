"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, X, ArrowRight, Circle } from "lucide-react"

interface DashboardClientProps {
  onboardingCompleted: boolean
  plan: "free" | "pro"
  isActive: boolean
  telegramChatId: string | null
}

type StepStatus = "completed" | "pending" | "current"

interface Step {
  id: number
  name: string
  description: string
  href: string
  status: StepStatus
}

export default function DashboardClient({
  onboardingCompleted,
  plan,
  isActive,
  telegramChatId,
}: DashboardClientProps) {
  const router = useRouter()

  // Déterminer le statut de chaque étape
  const steps: Step[] = [
    {
      id: 1,
      name: "Onboarding",
      description: "Configure tes préférences de rédaction",
      href: "/onboarding",
      status: onboardingCompleted ? "completed" : "current",
    },
    {
      id: 2,
      name: "Abonnement",
      description: "Active le Plan Pro pour débloquer toutes les fonctionnalités",
      href: "/billing",
      status: onboardingCompleted
        ? isActive && plan === "pro"
          ? "completed"
          : "current"
        : "pending",
    },
    {
      id: 3,
      name: "Telegram",
      description: "Connecte ton compte Telegram pour recevoir tes posts",
      href: "/connect-telegram",
      status: onboardingCompleted && isActive && plan === "pro"
        ? telegramChatId
          ? "completed"
          : "current"
        : "pending",
    },
  ]

  // Trouver la prochaine étape à compléter
  const nextStep = steps.find((step) => step.status === "current") || steps.find((step) => step.status === "pending")

  const handleNextStep = () => {
    if (nextStep) {
      router.push(nextStep.href)
    }
  }

  const getStepIcon = (status: StepStatus) => {
    switch (status) {
      case "completed":
        return <Check className="h-5 w-5 text-primary" />
      case "current":
        return <Circle className="h-5 w-5 text-primary fill-primary" />
      case "pending":
        return <Circle className="h-5 w-5 text-muted-foreground" />
    }
  }

  const getStepBadge = (status: StepStatus) => {
    switch (status) {
      case "completed":
        return <Badge variant="default">Terminé</Badge>
      case "current":
        return <Badge variant="secondary">En cours</Badge>
      case "pending":
        return <Badge variant="outline">En attente</Badge>
    }
  }

  return (
    <div className="space-y-6 md:space-y-8 px-4">
      {/* En-tête */}
      <div className="text-center">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">Dashboard</h1>
        <p className="text-muted-foreground text-base md:text-lg">
          Suis ta progression et complète les étapes pour commencer
        </p>
      </div>

      {/* Résumé de l'état */}
      <Card>
        <CardHeader>
          <CardTitle>Résumé de l'état</CardTitle>
          <CardDescription>Vue d'ensemble de ta configuration</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Onboarding</div>
              <div className="flex items-center gap-2">
                {onboardingCompleted ? (
                  <>
                    <Check className="h-4 w-4 text-primary" />
                    <span className="font-semibold">Complété</span>
                  </>
                ) : (
                  <>
                    <X className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Non complété</span>
                  </>
                )}
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Plan</div>
              <Badge variant={plan === "pro" ? "default" : "secondary"} className="capitalize">
                {plan}
              </Badge>
            </div>
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Statut</div>
              <Badge variant={isActive ? "default" : "secondary"}>
                {isActive ? "Actif" : "Inactif"}
              </Badge>
            </div>
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Telegram</div>
              <div className="flex items-center gap-2">
                {telegramChatId ? (
                  <>
                    <Check className="h-4 w-4 text-primary" />
                    <span className="font-semibold">Connecté</span>
                  </>
                ) : (
                  <>
                    <X className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Non connecté</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Checklist */}
      <Card>
        <CardHeader>
          <CardTitle>Checklist</CardTitle>
          <CardDescription>Suis ces étapes pour configurer ton compte</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className={`flex items-start gap-4 p-4 rounded-lg border ${
                step.status === "current" ? "border-primary bg-primary/5" : "border-border"
              }`}
            >
              <div className="flex-shrink-0 mt-0.5">{getStepIcon(step.status)}</div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">{step.name}</h3>
                  {getStepBadge(step.status)}
                </div>
                <p className="text-sm text-muted-foreground">{step.description}</p>
                {step.status !== "completed" && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-2"
                    onClick={() => router.push(step.href)}
                  >
                    Aller à cette étape
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* CTA principal */}
      {nextStep && (
        <Card className="border-primary">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div>
                <h3 className="text-xl font-semibold mb-2">Prochaine étape</h3>
                <p className="text-muted-foreground">
                  {nextStep.description}
                </p>
              </div>
              <Button size="lg" onClick={handleNextStep} className="w-full sm:w-auto">
                {nextStep.status === "current" ? "Continuer" : "Commencer"} {nextStep.name}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Message de complétion */}
      {steps.every((step) => step.status === "completed") && (
        <Card className="border-primary bg-primary/5">
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <Check className="h-12 w-12 text-primary mx-auto" />
              <h3 className="text-xl font-semibold">Tout est configuré !</h3>
              <p className="text-muted-foreground">
                Tu recevras tes thèmes de posts LinkedIn automatiquement chaque jour.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
