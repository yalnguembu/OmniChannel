/**
 * Landing page static data & types.
 * All JSX lives here so section components stay logic-only.
 */

/* ─── Types ─── */
export interface Channel {
  label: string;
  color: string;
  pos: string;
}

export interface FeatureItem {
  title: string;
  desc: string;
  icon: React.ReactNode;
}

export interface AiCard {
  teal: boolean;
  title: string;
  desc: string;
  icon: React.ReactNode;
}

export interface Plan {
  name: string;
  desc: string;
  price: string;
  currency: string;
  period: string;
  featured: boolean;
  features: string[];
}

export interface HowStep {
  n: string;
  title: string;
  desc: string;
}

/* ─── Hero ─── */
export const CHANNELS: Channel[] = [
  { label: "WhatsApp",   color: "#25D366", pos: "pill-p1"  },
  { label: "Telegram",   color: "#0088CC", pos: "pill-p2"  },
  { label: "SMS",        color: "#E8541A", pos: "pill-p3"  },
  { label: "Email",      color: "#EA4335", pos: "pill-p4"  },
  { label: "Push",       color: "#FFCC00", pos: "pill-p5"  },
  { label: "API REST",   color: "#2E8FAD", pos: "pill-p6"  },
  { label: "Viber",      color: "#7B5EA7", pos: "pill-p7"  },
  { label: "RCS",        color: "#FF6900", pos: "pill-p8"  },
  { label: "Twitter DM", color: "#1DA1F2", pos: "pill-p9"  },
  { label: "LinkedIn",   color: "#0A66C2", pos: "pill-p10" },
];

export const KPI_STATS = [
  ["10+",  "Canaux supportés"],
  ["99.9%","Uptime garanti"],
  ["< 2s", "Temps de livraison"],
] as const;

/* ─── Features ─── */
export const FEATURES: FeatureItem[] = [
  {
    title: "Campagnes multi-canaux",
    desc: "Orchestrez vos communications sur SMS, Email et WhatsApp depuis un seul workflow. Étapes, délais et conditions configurables.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M3 6h14M3 10h10M3 14h6" stroke="#2E8FAD" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    title: "Segmentation avancée",
    desc: "Créez des segments dynamiques basés sur les comportements, attributs clients et préférences de canaux. Ciblez mieux, convertissez plus.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <circle cx="10" cy="7" r="3" stroke="#2E8FAD" strokeWidth="1.5" />
        <path d="M4 17c0-3.31 2.69-6 6-6s6 2.69 6 6" stroke="#2E8FAD" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    title: "Analytics en temps réel",
    desc: "Taux de livraison, d'ouverture, de clic — toutes vos métriques accessibles en temps réel. Prenez des décisions basées sur les données.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M2 14l4-4 3 3 5-6 4 3" stroke="#2E8FAD" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: "Templates intelligents",
    desc: "Créez vos templates une fois, déployez-les sur tous vos canaux. Variables dynamiques, multilingue et versioning intégré.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <rect x="3" y="5" width="14" height="10" rx="2" stroke="#2E8FAD" strokeWidth="1.5" />
        <path d="M7 9h6M7 12h4" stroke="#2E8FAD" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    title: "Connecteurs & API",
    desc: "Intégrez vos outils existants via notre API REST ou nos connecteurs natifs. Webhooks, API Keys et logs de synchronisation inclus.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M10 3v14M3 10h14" stroke="#2E8FAD" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="10" cy="10" r="7" stroke="#2E8FAD" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    title: "Multi-produits",
    desc: "Gérez plusieurs marques ou business units depuis un seul compte. Chaque produit dispose de ses propres canaux, contacts et campagnes.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M10 3L3 7v6l7 4 7-4V7l-7-4z" stroke="#2E8FAD" strokeWidth="1.5" strokeLinejoin="round" />
      </svg>
    ),
  },
];

/* ─── AI Section ─── */
export const AI_CARDS: AiCard[] = [
  {
    teal: false,
    title: "Segmentation prédictive",
    desc: "L'IA identifie vos clients à risque de churn, les plus susceptibles d'acheter, et ceux prêts à monter en gamme.",
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path d="M9 2a1 1 0 011 1v1.5a4.5 4.5 0 010 9V15a1 1 0 01-2 0v-1.5a4.5 4.5 0 010-9V3a1 1 0 011-1z" stroke="#F28A5F" strokeWidth="1.3" />
        <circle cx="9" cy="9" r="2" fill="#F28A5F" />
      </svg>
    ),
  },
  {
    teal: true,
    title: "Orchestration automatique",
    desc: "Décrivez votre objectif en langage naturel. L'IA construit le workflow multi-canal optimal — timing, canal, message.",
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path d="M3 9h3l2-5 3 10 2-5h3" stroke="#6AB8D4" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    teal: false,
    title: "Personnalisation à l'échelle",
    desc: "Chaque message est adapté individuellement — ton, contenu, heure d'envoi — pour des milliers de clients simultanément.",
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <rect x="2" y="5" width="14" height="9" rx="2" stroke="#F28A5F" strokeWidth="1.3" />
        <path d="M6 5V4a2 2 0 014 0v1" stroke="#F28A5F" strokeWidth="1.3" />
        <circle cx="9" cy="9.5" r="1.5" fill="#F28A5F" />
      </svg>
    ),
  },
  {
    teal: true,
    title: "Optimisation continue",
    desc: "L'IA apprend de chaque campagne et ajuste automatiquement vos futures stratégies pour maximiser le ROI.",
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path d="M9 3v2M9 13v2M3 9h2M13 9h2M4.93 4.93l1.41 1.41M11.66 11.66l1.41 1.41M4.93 13.07l1.41-1.41M11.66 6.34l1.41-1.41" stroke="#6AB8D4" strokeWidth="1.3" strokeLinecap="round" />
      </svg>
    ),
  },
];

export const AI_STEPS = [
  "Segment détecté : 2 847 clients inactifs identifiés",
  "Sous-segment <35 ans → WhatsApp (1 203 contacts)",
  "Sous-segment ≥35 ans → Email (1 644 contacts)",
  "Templates personnalisés générés × 2 canaux",
  "Meilleure fenêtre d'envoi : Mar–Jeu 10h–11h30",
  "Relance automatique J+3 si non ouvert",
];

/* ─── How it works ─── */
export const HOW_STEPS: HowStep[] = [
  {
    n: "1",
    title: "Créez votre compte",
    desc: "Inscrivez votre entreprise, configurez votre profil et vérifiez vos informations légales.",
  },
  {
    n: "2",
    title: "Connectez vos canaux",
    desc: "Activez SMS, Email, WhatsApp et configurez vos connecteurs en quelques clics.",
  },
  {
    n: "3",
    title: "Importez vos contacts",
    desc: "Importez votre base via CSV ou API. Segmentez automatiquement selon vos critères.",
  },
  {
    n: "4",
    title: "Lancez vos campagnes",
    desc: "Créez votre première campagne multi-canal et suivez vos résultats en temps réel.",
  },
];

/* ─── Pricing ─── */
export const PLANS: Plan[] = [
  {
    name: "Starter",
    desc: "Pour les petites équipes qui démarrent leur stratégie omnicanale.",
    price: "29 000",
    currency: "XAF",
    period: "par mois · facturation annuelle",
    featured: false,
    features: [
      "Jusqu'à 3 produits",
      "50 000 messages / mois",
      "3 canaux actifs",
      "5 utilisateurs",
      "Analytics basiques",
      "Support email",
    ],
  },
  {
    name: "Growth",
    desc: "Pour les équipes en croissance avec des besoins avancés en automatisation.",
    price: "79 000",
    currency: "XAF",
    period: "par mois · facturation annuelle",
    featured: true,
    features: [
      "Jusqu'à 10 produits",
      "200 000 messages / mois",
      "Tous les canaux",
      "20 utilisateurs",
      "Analytics avancés",
      "Webhooks & API",
      "Support prioritaire",
    ],
  },
  {
    name: "Enterprise",
    desc: "Pour les grandes organisations avec des volumes élevés et des besoins sur mesure.",
    price: "Sur devis",
    currency: "",
    period: "volume illimité · SLA personnalisé",
    featured: false,
    features: [
      "Produits illimités",
      "Volume sur mesure",
      "Tous les canaux + custom",
      "Utilisateurs illimités",
      "Onboarding dédié",
      "Account manager",
      "SLA 99.99%",
    ],
  },
];
