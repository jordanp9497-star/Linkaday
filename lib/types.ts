import type { ProfileJson } from "./types/profile"

export type Profile = {
  id: string // uuid
  email: string
  directive_json: Record<string, any> | null // jsonb
  onboarding_json: Record<string, any> | null // jsonb
  profile_json: ProfileJson | null // jsonb - Données de personnalisation complètes
  onboarding_completed: boolean
  plan: "free" | "pro"
  is_active: boolean
  telegram_chat_id: string | null
  created_at?: string
  updated_at?: string
}
