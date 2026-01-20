import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle2 } from "lucide-react"

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] py-8 md:py-12 px-4">
      <div className="max-w-4xl mx-auto text-center space-y-6 md:space-y-8">
        {/* Titre principal */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
          Génère automatiquement tes posts LinkedIn personnalisés, sans plus te soucier !
        </h1>

        {/* Sous-titre */}
        <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto px-4">
          Choisis un thème, reçois 2 posts prêts à publier, valide ou régénère en 1 clic.
        </p>

        {/* Bénéfices */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 mt-8 md:mt-12 px-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center space-y-3">
                <CheckCircle2 className="h-10 w-10 text-primary" />
                <h3 className="font-semibold text-lg">Gain de temps</h3>
                <p className="text-sm text-muted-foreground">
                  Plus besoin de réfléchir à tes posts. Génère-les en quelques secondes.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center space-y-3">
                <CheckCircle2 className="h-10 w-10 text-primary" />
                <h3 className="font-semibold text-lg">Contenu personnalisé</h3>
                <p className="text-sm text-muted-foreground">
                  Des posts adaptés à ton style et à ton secteur d&apos;activité.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center space-y-3">
                <CheckCircle2 className="h-10 w-10 text-primary" />
                <h3 className="font-semibold text-lg">Régénération facile</h3>
                <p className="text-sm text-muted-foreground">
                  Pas satisfait ? Régénère en un clic jusqu&apos;à obtenir le post parfait.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* CTA */}
        <div className="mt-12">
          <Button size="lg" className="text-lg px-8 py-6" asChild>
            <Link href="/onboarding">Commencer</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
