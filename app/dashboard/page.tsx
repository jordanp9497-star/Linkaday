import { requireAuthServer } from "@/lib/auth"
import { getProfileServer } from "@/lib/auth"
import DashboardClient from "@/components/DashboardClient"

export default async function DashboardPage() {
  await requireAuthServer()
  const profile = await getProfileServer()

  return (
    <div className="max-w-4xl mx-auto py-8 md:py-12 px-4">
      <DashboardClient
        onboardingCompleted={profile?.onboarding_completed ?? false}
        plan={profile?.plan ?? "free"}
        isActive={profile?.is_active ?? false}
        telegramChatId={profile?.telegram_chat_id ?? null}
      />
    </div>
  )
}
