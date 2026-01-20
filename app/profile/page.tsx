import { requireAuthServer } from "@/lib/auth"
import { getProfileServer } from "@/lib/auth"
import ProfileWizard from "@/components/ProfileWizard"
import type { ProfileJson } from "@/lib/types/profile"
import { defaultProfileJson } from "@/lib/types/profile"

export default async function ProfilePage() {
  await requireAuthServer()
  const profile = await getProfileServer()

  // Récupérer profile_json ou utiliser les valeurs par défaut
  const initialData: ProfileJson = profile?.profile_json || defaultProfileJson

  return (
    <div className="max-w-7xl mx-auto py-8 md:py-12 px-4">
      <div className="mb-6 md:mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">Configuration du profil</h1>
        <p className="text-muted-foreground text-sm md:text-base">
          Configurez votre profil pour générer des posts LinkedIn personnalisés
        </p>
      </div>
      <ProfileWizard initialData={initialData} />
    </div>
  )
}
