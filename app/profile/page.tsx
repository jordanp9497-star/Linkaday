import { requireAuthServer } from "@/lib/auth"
import { getProfileServer } from "@/lib/auth"
import ProfileClient from "@/components/ProfileClient"

export default async function ProfilePage() {
  await requireAuthServer()
  const profile = await getProfileServer()

  return (
    <div className="max-w-7xl mx-auto py-8 md:py-12 px-4">
      <div className="mb-6 md:mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">Configuration du profil</h1>
        <p className="text-muted-foreground text-sm md:text-base">
          Configurez votre profil pour générer des posts LinkedIn personnalisés
        </p>
      </div>
      <ProfileClient profile={profile} />
    </div>
  )
}
