"use client"

import { useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { toast } from "sonner"

/**
 * Composant client pour afficher un message si le paiement a été annulé
 * Affiche un toast "Paiement annulé" si canceled=1 dans l'URL
 */
export default function LinkadayClientNotice() {
  const searchParams = useSearchParams()
  const router = useRouter()

  useEffect(() => {
    const canceled = searchParams.get("canceled") === "1"
    if (canceled) {
      toast.info("Paiement annulé", {
        description: "Vous pouvez réessayer quand vous le souhaitez.",
      })
      // Nettoyer l'URL pour éviter de réafficher le toast
      router.replace("/linkaday", { scroll: false })
    }
  }, [searchParams, router])

  return null
}
