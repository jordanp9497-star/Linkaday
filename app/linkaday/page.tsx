import Link from "next/link"
import { Suspense } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { CheckCircle2, Sparkles, Target, Zap } from "lucide-react"
import SubscribeButton from "@/components/SubscribeButton"
import LinkadayClientNotice from "@/components/LinkadayClientNotice"

export default function LinkadayPage() {
  return (
    <div className="max-w-6xl mx-auto py-8 md:py-16 px-4">
      <Suspense fallback={null}>
        <LinkadayClientNotice />
      </Suspense>
      {/* Hero */}
      <div className="text-center space-y-4 mb-12 md:mb-16">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold">Linkaday</h1>
        <p className="text-xl md:text-2xl text-muted-foreground">
          Ton agent qui publie pour toi.
        </p>
      </div>

      {/* Comment ça marche */}
      <Card className="mb-8 md:mb-12">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-6 w-6" />
            Comment ça marche
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-base md:text-lg leading-relaxed">
            Linkaday, c&apos;est un agent qui vous génère 2 posts par jour sur des thèmes différents chaque semaine. 
            Les thèmes sont choisis en fonction des tendances et de votre profil : vous n&apos;aurez plus qu&apos;à regarder vos abonnés grimper !
          </p>
        </CardContent>
      </Card>

      {/* Choisis ton secteur */}
      <Card className="mb-8 md:mb-12">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-6 w-6" />
            Choisis ton secteur
          </CardTitle>
          <CardDescription>
            Sélectionnez le secteur qui correspond à votre activité
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3 mb-4">
            <Badge variant="default" className="text-base px-4 py-2">
              Tech
            </Badge>
            <Badge variant="default" className="text-base px-4 py-2">
              Finance
            </Badge>
            <Badge variant="default" className="text-base px-4 py-2">
              RH
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            D&apos;autres secteurs arrivent bientôt.
          </p>
        </CardContent>
      </Card>

      {/* Personnalisation */}
      <Card className="mb-8 md:mb-12">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-6 w-6" />
            Personnalisation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-base md:text-lg leading-relaxed">
            Vous choisissez d&apos;abord votre secteur : Tech, Finance, ou RH (d&apos;autres sont à venir). 
            Et Linkaday s&apos;adapte à vous pour vous proposer les posts les plus pertinents possible.
          </p>
        </CardContent>
      </Card>

      <Separator className="my-8 md:my-12" />

      {/* Pricing */}
      <div className="text-center space-y-6 mb-8 md:mb-12">
        <div>
          <div className="text-5xl md:text-6xl font-bold mb-2">19,99€</div>
          <div className="text-xl md:text-2xl text-muted-foreground mb-4">/ mois</div>
          <p className="text-base md:text-lg text-muted-foreground">
            Seulement 33 centimes par post !
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <SubscribeButton className="text-lg px-8 py-6" />
          <Button size="lg" variant="outline" className="text-lg px-8 py-6" asChild>
            <Link href="/profile">Voir mon profil</Link>
          </Button>
        </div>
      </div>

      {/* Bénéfices */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center space-y-3">
              <CheckCircle2 className="h-10 w-10 text-primary" />
              <h3 className="font-semibold text-lg">2 posts par jour</h3>
              <p className="text-sm text-muted-foreground">
                Du contenu frais et varié chaque jour de la semaine
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center space-y-3">
              <CheckCircle2 className="h-10 w-10 text-primary" />
              <h3 className="font-semibold text-lg">Thèmes adaptés</h3>
              <p className="text-sm text-muted-foreground">
                Basés sur les tendances et votre profil personnalisé
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center space-y-3">
              <CheckCircle2 className="h-10 w-10 text-primary" />
              <h3 className="font-semibold text-lg">Gain de temps</h3>
              <p className="text-sm text-muted-foreground">
                Plus besoin de réfléchir, Linkaday s&apos;en charge
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
