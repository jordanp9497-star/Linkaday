import { requireAuthServer } from "@/lib/auth"
import OnboardingClient from "@/components/OnboardingClient"

export default async function OnboardingPage() {
  await requireAuthServer()

  return (
    <div className="max-w-4xl mx-auto py-6 md:py-8 px-4">
      <div className="text-center mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">
          Configuration de votre compte
        </h1>
        <p className="text-muted-foreground text-sm md:text-base mt-2">
          Configurez vos préférences pour générer des posts LinkedIn personnalisés
        </p>
      </div>
      <OnboardingClient />
    </div>
  )
}
