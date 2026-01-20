import { requireAuthServer } from "@/lib/auth"
import OnboardingClient from "@/components/OnboardingClient"

export default async function OnboardingPage() {
  await requireAuthServer()

  return (
    <div className="max-w-4xl mx-auto py-6 md:py-8 px-4">
      <div className="text-center mb-6 md:mb-8">
        <h1 className="text-2xl md:text-4xl font-bold mb-2">
          Génère automatiquement tes posts LinkedIn personnalisés, sans plus te soucier !
        </h1>
      </div>
      <OnboardingClient />
    </div>
  )
}
