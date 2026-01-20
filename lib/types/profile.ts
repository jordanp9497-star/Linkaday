/**
 * Schéma TypeScript pour profile_json
 * Structure complète des données de personnalisation LinkedIn
 */

export type PronounStyle = "tu" | "vous" | "mixte"

export type AudienceMaturity = "débutant" | "intermédiaire" | "avancé" | "expert"

export type Tone = "professionnel" | "détendu" | "punchy" | "pédagogique" | "inspirant" | "mixte"

export type PreferredFormat = "carousel" | "article" | "vidéo" | "texte" | "poll" | "document"

export type CTAStyle = "soft" | "direct" | "question" | "aucun"

export interface ProfileJson {
  // ============================================
  // IDENTITY - Identité professionnelle
  // ============================================
  identity: {
    headline?: string // Ex: "CEO @ Startup | Expert en Growth"
    industry?: string // Ex: "Tech", "Finance", "Marketing"
    level?: string // Ex: "C-Level", "Manager", "Indépendant"
    language?: string // Ex: "fr", "en"
    location?: string // Ex: "Paris, France"
    pronoun_style?: PronounStyle // "tu" | "vous" | "mixte"
  }

  // ============================================
  // AUDIENCE - Audience cible
  // ============================================
  audience: {
    icp?: string // Ideal Customer Profile (description texte)
    pains?: string[] // Problèmes/douleurs de l'audience
    objections?: string[] // Objections fréquentes
    maturity?: AudienceMaturity // Niveau de maturité de l'audience
  }

  // ============================================
  // OFFER - Offre et preuves
  // ============================================
  offer: {
    primary_offer?: string // Offre principale (description)
    promise?: string // Promesse principale
    pricing_range?: string // Ex: "€500-2000", "Sur devis"
    proof_points?: string[] // Points de preuve (résultats, chiffres)
    case_studies?: Array<{
      title?: string
      description?: string
      result?: string
      url?: string
    }>
  }

  // ============================================
  // POSITIONING - Positionnement
  // ============================================
  positioning: {
    differentiators?: string[] // Points de différenciation
    strong_opinions?: string[] // Opinions fortes/controversées
    topics_to_avoid?: string[] // Sujets à éviter
  }

  // ============================================
  // VOICE - Voix et style
  // ============================================
  voice: {
    tone?: Tone // Ton général
    length?: string // Ex: "200-300 mots", "court", "moyen"
    emojis?: boolean // Utiliser des emojis ?
    preferred_formats?: PreferredFormat[] // Formats préférés
    cta_style?: CTAStyle // Style de CTA
    hashtags?: string[] // Hashtags à utiliser régulièrement
    words_to_use?: string[] // Mots à privilégier
    words_to_avoid?: string[] // Mots à éviter
  }

  // ============================================
  // CONTENT_STRATEGY - Stratégie de contenu
  // ============================================
  content_strategy: {
    pillars?: string[] // Piliers de contenu (ex: "Éducation", "Inspiration", "Vente")
    do_more_of?: string[] // À faire plus souvent
    do_less_of?: string[] // À faire moins souvent
  }

  // ============================================
  // ASSETS - Ressources et liens
  // ============================================
  assets: {
    links?: Array<{
      label?: string
      url?: string
      type?: "website" | "blog" | "portfolio" | "other"
    }>
    lead_magnet_url?: string // URL du lead magnet
    booking_url?: string // URL de prise de rendez-vous
  }

  // ============================================
  // CONSTRAINTS - Contraintes et limites
  // ============================================
  constraints: {
    legal_notes?: string // Notes légales/contraintes
    forbidden_claims?: string[] // Allégations interdites
  }

  // ============================================
  // SIGNALS - Signaux et monitoring
  // ============================================
  signals: {
    keywords?: string[] // Mots-clés à surveiller
    companies_to_follow?: string[] // Entreprises à suivre
    tickers?: string[] // Tickers boursiers (si applicable)
  }

  // ============================================
  // EXAMPLES - Exemples de contenu
  // ============================================
  examples: {
    liked_posts?: Array<{
      url?: string
      description?: string
      why?: string // Pourquoi ce post est apprécié
    }>
    disliked_posts?: Array<{
      url?: string
      description?: string
      why?: string // Pourquoi ce post n'est pas apprécié
    }>
  }

  // ============================================
  // CALENDAR - Calendrier de publication
  // ============================================
  calendar: {
    preferred_days?: number[] // Jours de la semaine (0=dimanche, 6=samedi)
    preferred_hours?: string[] // Heures préférées (ex: "09:00", "12:00", "18:00")
  }
}

/**
 * Valeur par défaut pour ProfileJson
 */
export const defaultProfileJson: ProfileJson = {
  identity: {},
  audience: {},
  offer: {},
  positioning: {},
  voice: {},
  content_strategy: {},
  assets: {},
  constraints: {},
  signals: {},
  examples: {},
  calendar: {},
}
