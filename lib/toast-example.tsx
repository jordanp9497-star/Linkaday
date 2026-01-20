/**
 * Exemple d'utilisation des toasts avec sonner
 * 
 * Dans un composant client, utilisez:
 * 
 * import { toast } from "sonner"
 * 
 * // Toast simple
 * toast("Message de succès")
 * 
 * // Toast avec type
 * toast.success("Opération réussie!")
 * toast.error("Une erreur est survenue")
 * toast.warning("Attention!")
 * toast.info("Information")
 * 
 * // Toast avec description
 * toast.success("Post généré!", {
 *   description: "2 nouveaux posts sont prêts à être publiés."
 * })
 * 
 * // Toast avec action
 * toast("Post sauvegardé", {
 *   action: {
 *     label: "Annuler",
 *     onClick: () => console.log("Annulé")
 *   }
 * })
 */

export {}
