import { requireAuthServer } from "@/lib/auth"
import { getProfileServer } from "@/lib/auth"
import { redirect } from "next/navigation"
import BillingClient from "@/components/BillingClient"

export default async function BillingPage() {
  const user = await requireAuthServer()
  const profile = await getProfileServer()

  // Validation: onboarding_completed doit être true
  if (!profile?.onboarding_completed) {
    redirect("/onboarding")
  }

  const isSubscribed = profile?.plan === "pro" && profile?.is_active === true

  return (
    <div className="max-w-4xl mx-auto py-8 md:py-12 px-4">
      <div className="text-center mb-6 md:mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">Facturation</h1>
        <p className="text-muted-foreground text-sm md:text-base">
          {isSubscribed
            ? "Vous êtes abonné au Plan Pro"
            : "Choisissez votre plan pour débloquer toutes les fonctionnalités"}
        </p>
      </div>
      <BillingClient isSubscribed={isSubscribed} />
    </div>
  )
}
