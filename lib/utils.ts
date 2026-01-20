import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Parse JSON de manière sécurisée
 * @param json - Chaîne JSON à parser
 * @returns Objet parsé ou null en cas d'erreur
 */
export function safeJsonParse<T = unknown>(json: string): T | null {
  try {
    return JSON.parse(json) as T
  } catch {
    return null
  }
}

/**
 * Récupère l'URL du site (origin) de manière sécurisée
 * Utilise NEXT_PUBLIC_APP_URL en production, window.location.origin en dev
 * @returns URL absolue du site (ex: https://example.com)
 */
export function getSiteUrl(): string {
  // En production, utiliser NEXT_PUBLIC_APP_URL si défini
  if (typeof window === "undefined") {
    // Côté serveur
    return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  }
  // Côté client
  return window.location.origin
}

/**
 * Alias pour getSiteUrl() - récupère l'origin de manière sécurisée
 * @returns URL absolue du site (ex: https://example.com)
 */
export function getOrigin(): string {
  return getSiteUrl()
}
