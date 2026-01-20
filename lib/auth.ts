import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Profile } from "@/lib/types"

/**
 * Récupère l'utilisateur actuel côté serveur
 */
export async function getUserServer() {
  const supabase = await createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    return null
  }

  return user
}

/**
 * Récupère le profil de l'utilisateur actuel côté serveur
 */
export async function getProfileServer(): Promise<Profile | null> {
  const user = await getUserServer()
  if (!user) {
    return null
  }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  if (error || !data) {
    return null
  }

  return data as Profile
}

/**
 * Vérifie que l'utilisateur est authentifié, sinon redirige vers /login
 */
export async function requireAuthServer() {
  const user = await getUserServer()
  if (!user) {
    redirect("/login")
  }
  return user
}
