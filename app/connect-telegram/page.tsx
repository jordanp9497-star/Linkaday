import { requireAuthServer } from "@/lib/auth"
import { getProfileServer } from "@/lib/auth"
import ConnectTelegramClient from "@/components/ConnectTelegramClient"

export default async function ConnectTelegramPage() {
  await requireAuthServer()
  const profile = await getProfileServer()

  return (
    <div className="max-w-4xl mx-auto py-12">
      <ConnectTelegramClient
        isActive={profile?.is_active ?? false}
        plan={profile?.plan ?? "free"}
        telegramChatId={profile?.telegram_chat_id ?? null}
      />
    </div>
  )
}
