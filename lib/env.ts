import { z } from "zod"

// Schéma pour les variables obligatoires (toujours requises)
const requiredEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
})

// Schéma pour les variables optionnelles
const optionalEnvSchema = z.object({
  STRIPE_SECRET_KEY: z.string().min(1).optional(),
  STRIPE_WEBHOOK_SECRET: z.string().min(1).optional(),
  STRIPE_PRICE_ID: z.string().min(1).optional(),
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),
  NEXT_PUBLIC_TELEGRAM_BOT_USERNAME: z.string().min(1).optional(),
})

type RequiredEnv = z.infer<typeof requiredEnvSchema>
type OptionalEnv = z.infer<typeof optionalEnvSchema>

/**
 * Variables d'environnement publiques (accessibles côté client)
 * Ne contient que les variables NEXT_PUBLIC_*
 */
export function getPublicEnv() {
  const env = {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_TELEGRAM_BOT_USERNAME: process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME,
  }

  const isBuild = process.env.NEXT_PHASE === "phase-production-build"

  // En dev/build, validation basique pour éviter les crashes
  if (process.env.NODE_ENV === "development" || process.env.NODE_ENV === "test" || isBuild) {
    // Au build, on peut retourner des valeurs même si manquantes (seront validées à l'usage)
    if (isBuild) {
      return {
        NEXT_PUBLIC_SUPABASE_URL: env.NEXT_PUBLIC_SUPABASE_URL || "",
        NEXT_PUBLIC_SUPABASE_ANON_KEY: env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
        NEXT_PUBLIC_APP_URL: env.NEXT_PUBLIC_APP_URL,
        NEXT_PUBLIC_TELEGRAM_BOT_USERNAME: env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME,
      }
    }
    // En dev, valider les variables obligatoires
    if (!env.NEXT_PUBLIC_SUPABASE_URL || !env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      throw new Error("NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are required")
    }
    return {
      NEXT_PUBLIC_SUPABASE_URL: env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      NEXT_PUBLIC_APP_URL: env.NEXT_PUBLIC_APP_URL,
      NEXT_PUBLIC_TELEGRAM_BOT_USERNAME: env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME,
    }
  }

  // En production runtime, valider les variables obligatoires
  if (!env.NEXT_PUBLIC_SUPABASE_URL || !env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are required")
  }

  return {
    NEXT_PUBLIC_SUPABASE_URL: env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_APP_URL: env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_TELEGRAM_BOT_USERNAME: env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME,
  }
}

/**
 * Variables d'environnement serveur (accessibles uniquement côté serveur)
 * Contient toutes les variables, y compris les secrets
 */
export function getServerEnv() {
  const env = {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
    STRIPE_PRICE_ID: process.env.STRIPE_PRICE_ID,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_TELEGRAM_BOT_USERNAME: process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME,
  }

  // Détecter si on est en build (Next.js définit cette variable)
  const isBuild = process.env.NEXT_PHASE === "phase-production-build"

  // En dev/build, validation basique sans Zod pour éviter les crashes
  if (process.env.NODE_ENV === "development" || process.env.NODE_ENV === "test" || isBuild) {
    // Vérification basique des variables obligatoires
    if (!env.NEXT_PUBLIC_SUPABASE_URL || !env.NEXT_PUBLIC_SUPABASE_ANON_KEY || !env.SUPABASE_SERVICE_ROLE_KEY) {
      // Au build, on peut retourner des valeurs vides (seront validées à l'usage en runtime)
      if (isBuild) {
        return {
          NEXT_PUBLIC_SUPABASE_URL: env.NEXT_PUBLIC_SUPABASE_URL || "",
          NEXT_PUBLIC_SUPABASE_ANON_KEY: env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
          SUPABASE_SERVICE_ROLE_KEY: env.SUPABASE_SERVICE_ROLE_KEY || "",
          STRIPE_SECRET_KEY: env.STRIPE_SECRET_KEY,
          STRIPE_WEBHOOK_SECRET: env.STRIPE_WEBHOOK_SECRET,
          STRIPE_PRICE_ID: env.STRIPE_PRICE_ID,
          NEXT_PUBLIC_APP_URL: env.NEXT_PUBLIC_APP_URL,
          NEXT_PUBLIC_TELEGRAM_BOT_USERNAME: env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME,
        }
      }
      // En dev, on lance une erreur pour informer le développeur
      throw new Error("NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, and SUPABASE_SERVICE_ROLE_KEY are required")
    }
    return {
      NEXT_PUBLIC_SUPABASE_URL: env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      SUPABASE_SERVICE_ROLE_KEY: env.SUPABASE_SERVICE_ROLE_KEY,
      STRIPE_SECRET_KEY: env.STRIPE_SECRET_KEY,
      STRIPE_WEBHOOK_SECRET: env.STRIPE_WEBHOOK_SECRET,
      STRIPE_PRICE_ID: env.STRIPE_PRICE_ID,
      NEXT_PUBLIC_APP_URL: env.NEXT_PUBLIC_APP_URL,
      NEXT_PUBLIC_TELEGRAM_BOT_USERNAME: env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME,
    }
  }

  // En production runtime, valider strictement les variables obligatoires
  const required = requiredEnvSchema.parse({
    NEXT_PUBLIC_SUPABASE_URL: env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: env.SUPABASE_SERVICE_ROLE_KEY,
  })

  return {
    ...required,
    STRIPE_SECRET_KEY: env.STRIPE_SECRET_KEY,
    STRIPE_WEBHOOK_SECRET: env.STRIPE_WEBHOOK_SECRET,
    STRIPE_PRICE_ID: env.STRIPE_PRICE_ID,
    NEXT_PUBLIC_APP_URL: env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_TELEGRAM_BOT_USERNAME: env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME,
  }
}

/**
 * Vérifie que les variables Stripe sont présentes
 * À utiliser dans les routes /api/stripe/*
 */
export function requireStripeEnv() {
  const env = getServerEnv()
  const missing: string[] = []

  if (!env.STRIPE_SECRET_KEY) missing.push("STRIPE_SECRET_KEY")
  if (!env.STRIPE_WEBHOOK_SECRET) missing.push("STRIPE_WEBHOOK_SECRET")
  if (!env.STRIPE_PRICE_ID) missing.push("STRIPE_PRICE_ID")
  if (!env.NEXT_PUBLIC_APP_URL) missing.push("NEXT_PUBLIC_APP_URL")

  if (missing.length > 0) {
    throw new Error(`Stripe env missing: ${missing.join(", ")}`)
  }

  return {
    STRIPE_SECRET_KEY: env.STRIPE_SECRET_KEY!,
    STRIPE_WEBHOOK_SECRET: env.STRIPE_WEBHOOK_SECRET!,
    STRIPE_PRICE_ID: env.STRIPE_PRICE_ID!,
    NEXT_PUBLIC_APP_URL: env.NEXT_PUBLIC_APP_URL!,
  }
}

/**
 * Vérifie que la variable Telegram est présente
 * À utiliser sur /connect-telegram
 */
export function requireTelegramEnv() {
  const env = getPublicEnv()
  if (!env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME) {
    return null
  }
  return env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME
}
