import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] py-8 md:py-12 px-4">
      <div className="max-w-2xl mx-auto text-center space-y-6 md:space-y-8">
        {/* Titre principal */}
        <div className="space-y-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground leading-tight">
            Automatiser vos publications Linkedin.
          </h1>

          {/* Sous-titre */}
          <p className="text-base sm:text-lg text-muted-foreground max-w-xl mx-auto">
            Générez des posts personnalisés et publiez-les automatiquement sur LinkedIn.
          </p>
        </div>

        {/* Boutons CTA */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Button size="lg" className="w-full sm:w-auto" asChild>
            <Link href="/onboarding">Commencer</Link>
          </Button>
          <Button size="lg" variant="outline" className="w-full sm:w-auto" asChild>
            <Link href="/dashboard">Voir le dashboard</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
