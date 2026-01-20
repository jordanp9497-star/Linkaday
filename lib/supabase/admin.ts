import { createClient } from "@supabase/supabase-js"
import { getServerEnv } from "@/lib/env"

/**
 * Client Supabase avec service role key
 * ⚠️ À utiliser UNIQUEMENT côté serveur (API routes, server actions, etc.)
 * ⚠️ NE JAMAIS exposer ce client côté client
 * 
 * Ce client bypass RLS et peut modifier toutes les colonnes de toutes les tables.
 * Utilisez-le pour:
 * - Webhooks Stripe (mise à jour du plan)
 * - Intégrations n8n
 * - Opérations admin
 */
export function createAdminClient() {
  const env = getServerEnv()
  return createClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}
