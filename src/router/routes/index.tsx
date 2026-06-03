import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import "./landing.css";

export const Route = createFileRoute("/")({
  component: LandingPage,
});

/* ─── Types ─── */
interface Channel {
  label: string;
  color: string;
  pos: string;
}

/* ─── Data ─── */
const CHANNELS: Channel[] = [
  { label: "WhatsApp", color: "#25D366", pos: "pill-p1" },
  { label: "Telegram", color: "#0088CC", pos: "pill-p2" },
  { label: "SMS", color: "#E8541A", pos: "pill-p3" },
  { label: "Email", color: "#EA4335", pos: "pill-p4" },
  { label: "Push", color: "#FFCC00", pos: "pill-p5" },
  { label: "API REST", color: "#2E8FAD", pos: "pill-p6" },
  { label: "Viber", color: "#7B5EA7", pos: "pill-p7" },
  { label: "RCS", color: "#FF6900", pos: "pill-p8" },
  { label: "Twitter DM", color: "#1DA1F2", pos: "pill-p9" },
  { label: "LinkedIn", color: "#0A66C2", pos: "pill-p10" },
];

const FEATURES = [
  {
    title: "Campagnes multi-canaux",
    desc: "Orchestrez vos communications sur SMS, Email et WhatsApp depuis un seul workflow. Étapes, délais et conditions configurables.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path
          d="M3 6h14M3 10h10M3 14h6"
          stroke="#2E8FAD"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    title: "Segmentation avancée",
    desc: "Créez des segments dynamiques basés sur les comportements, attributs clients et préférences de canaux. Ciblez mieux, convertissez plus.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <circle cx="10" cy="7" r="3" stroke="#2E8FAD" strokeWidth="1.5" />
        <path
          d="M4 17c0-3.31 2.69-6 6-6s6 2.69 6 6"
          stroke="#2E8FAD"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    title: "Analytics en temps réel",
    desc: "Taux de livraison, d'ouverture, de clic — toutes vos métriques accessibles en temps réel. Prenez des décisions basées sur les données.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path
          d="M2 14l4-4 3 3 5-6 4 3"
          stroke="#2E8FAD"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    title: "Templates intelligents",
    desc: "Créez vos templates une fois, déployez-les sur tous vos canaux. Variables dynamiques, multilingue et versioning intégré.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <rect
          x="3"
          y="5"
          width="14"
          height="10"
          rx="2"
          stroke="#2E8FAD"
          strokeWidth="1.5"
        />
        <path
          d="M7 9h6M7 12h4"
          stroke="#2E8FAD"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    title: "Connecteurs & API",
    desc: "Intégrez vos outils existants via notre API REST ou nos connecteurs natifs. Webhooks, API Keys et logs de synchronisation inclus.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path
          d="M10 3v14M3 10h14"
          stroke="#2E8FAD"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <circle cx="10" cy="10" r="7" stroke="#2E8FAD" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    title: "Multi-produits",
    desc: "Gérez plusieurs marques ou business units depuis un seul compte. Chaque produit dispose de ses propres canaux, contacts et campagnes.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path
          d="M10 3L3 7v6l7 4 7-4V7l-7-4z"
          stroke="#2E8FAD"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
];

const AI_CARDS = [
  {
    teal: false,
    title: "Segmentation prédictive",
    desc: "L'IA identifie vos clients à risque de churn, les plus susceptibles d'acheter, et ceux prêts à monter en gamme.",
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path
          d="M9 2a1 1 0 011 1v1.5a4.5 4.5 0 010 9V15a1 1 0 01-2 0v-1.5a4.5 4.5 0 010-9V3a1 1 0 011-1z"
          stroke="#F28A5F"
          strokeWidth="1.3"
        />
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
        <path
          d="M3 9h3l2-5 3 10 2-5h3"
          stroke="#6AB8D4"
          strokeWidth="1.3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    teal: false,
    title: "Personnalisation à l'échelle",
    desc: "Chaque message est adapté individuellement — ton, contenu, heure d'envoi — pour des milliers de clients simultanément.",
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <rect
          x="2"
          y="5"
          width="14"
          height="9"
          rx="2"
          stroke="#F28A5F"
          strokeWidth="1.3"
        />
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
        <path
          d="M9 3v2M9 13v2M3 9h2M13 9h2M4.93 4.93l1.41 1.41M11.66 11.66l1.41 1.41M4.93 13.07l1.41-1.41M11.66 6.34l1.41-1.41"
          stroke="#6AB8D4"
          strokeWidth="1.3"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
];

const AI_STEPS = [
  "Segment détecté : 2 847 clients inactifs identifiés",
  "Sous-segment <35 ans → WhatsApp (1 203 contacts)",
  "Sous-segment ≥35 ans → Email (1 644 contacts)",
  "Templates personnalisés générés × 2 canaux",
  "Meilleure fenêtre d'envoi : Mar–Jeu 10h–11h30",
  "Relance automatique J+3 si non ouvert",
];

const PLANS = [
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

const HOW_STEPS = [
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

const KPI_STATS = [
  ["10+", "Canaux supportés"],
  ["99.9%", "Uptime garanti"],
  ["< 2s", "Temps de livraison"],
] as const;

/* ─── Reveal hook ─── */
function useReveal<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          obs.unobserve(entry.target);
        }
      },
      { threshold: 0.08, rootMargin: "0px 0px -32px 0px" },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return ref;
}

/* ─── Logo ─── */
function OctoLogo({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="10" r="3.5" stroke="#6AB8D4" strokeWidth="1.4" />
      <path
        d="M10 2v2.5M10 15.5V18M2 10h2.5M15.5 10H18M4.4 4.4l1.8 1.8M13.8 13.8l1.8 1.8M4.4 15.6l1.8-1.8M13.8 6.2l1.8-1.8"
        stroke="#E8541A"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

/* ─── Section tag ─── */
function SectionTag({
  children,
  light = false,
}: {
  children: string;
  light?: boolean;
}) {
  return (
    <p
      className={`font-body text-[11px] font-medium tracking-[0.1em] uppercase mb-3.5 ${light ? "text-white/45" : "text-[#2E8FAD]"}`}
    >
      — {children} —
    </p>
  );
}

/* ─── Navbar ─── */
function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    handler();
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMenuOpen(false);
  };

  const NAV_LINKS = [
    ["features", "Fonctionnalités"],
    ["ai", "Intelligence IA"],
    ["how", "Comment ça marche"],
    ["pricing", "Tarifs"],
  ] as const;

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 h-[68px] flex items-center border-b border-transparent transition-all duration-300 ${scrolled ? "navbar-scrolled" : "bg-transparent"}`}
    >
      <div className="w-full max-w-[1160px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
        {/* Logo */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="w-9 h-9 rounded-[10px] bg-[#0D2137] flex items-center justify-center shrink-0">
            <OctoLogo size={20} />
          </div>
          <span className="font-body text-[15px] font-medium text-[#0D2137] tracking-[-0.01em] whitespace-nowrap">
            OmniChannel
          </span>
        </div>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-7">
          {NAV_LINKS.map(([id, label]) => (
            <button
              key={id}
              onClick={() => scrollTo(id)}
              className="font-body text-[13.5px] text-[#4A7A94] hover:text-[#0D2137] transition-colors duration-200 whitespace-nowrap bg-transparent border-0 cursor-pointer"
            >
              {label}
            </button>
          ))}
        </nav>

        {/* Desktop right */}
        <div className="hidden sm:flex items-center gap-2.5 shrink-0">
          <Link
            to="/login"
            className="font-body text-[12px] font-medium text-[#8BAFC0] px-2.5 py-[5px] border border-[#DDE4EA] rounded-[6px] bg-white hover:border-[#2E8FAD] hover:text-[#2E8FAD] transition-all duration-200 no-underline"
          >
            Se connecter
          </Link>
          <button
            onClick={() => scrollTo("cta")}
            className="font-body text-[13px] font-medium px-5 py-2.5 rounded-full bg-accent text-white border-0 cursor-pointer btn-accent-shadow hover:bg-accent-hover hover:-translate-y-0.5 transition-all duration-300 whitespace-nowrap"
          >
            Nous contacter →
          </button>
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMenuOpen((v) => !v)}
          className="lg:hidden flex flex-col gap-[5px] p-2 bg-transparent border-0 cursor-pointer shrink-0"
          aria-label="Menu"
        >
          <span
            className={`block h-[1.5px] w-5 bg-[#0D2137] rounded transition-all duration-200 ${menuOpen ? "rotate-45 translate-y-[6.5px]" : ""}`}
          />
          <span
            className={`block h-[1.5px] w-5 bg-[#0D2137] rounded transition-all duration-200 ${menuOpen ? "opacity-0" : ""}`}
          />
          <span
            className={`block h-[1.5px] w-5 bg-[#0D2137] rounded transition-all duration-200 ${menuOpen ? "-rotate-45 -translate-y-[6.5px]" : ""}`}
          />
        </button>
      </div>

      {/* Mobile drawer */}
      {menuOpen && (
        <div className="lg:hidden absolute top-[68px] left-0 right-0 bg-white/95 backdrop-blur-md border-b border-[#DDE4EA] py-4 px-4 flex flex-col gap-1 shadow-lg">
          {NAV_LINKS.map(([id, label]) => (
            <button
              key={id}
              onClick={() => scrollTo(id)}
              className="font-body text-[14px] text-[#4A7A94] hover:text-[#0D2137] py-2.5 px-3 rounded-lg hover:bg-[#F4F5F6] text-left transition-colors duration-150 bg-transparent border-0 cursor-pointer w-full"
            >
              {label}
            </button>
          ))}
          <div className="mt-2 pt-3 border-t border-[#DDE4EA] flex flex-col gap-2">
            <Link
              to="/login"
              className="font-body text-[13px] text-center text-[#4A7A94] py-2.5 px-4 border border-[#DDE4EA] rounded-full no-underline hover:bg-[#F4F5F6] transition-colors duration-150"
            >
              Se connecter
            </Link>
            <button
              onClick={() => scrollTo("cta")}
              className="font-body text-[13px] font-medium py-2.5 px-4 rounded-full bg-accent text-white border-0 cursor-pointer btn-accent-shadow"
            >
              Nous contacter →
            </button>
          </div>
        </div>
      )}
    </header>
  );
}

/* ─── Hero ─── */
function Hero() {
  const scrollTo = (id: string) =>
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  return (
    <section className="hero-bg min-h-screen flex items-center pt-[68px] relative overflow-hidden">
      <div className="hero-glow absolute inset-0 pointer-events-none" />

      <div className="w-full max-w-[1160px] mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-6 grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-12 items-center">
        {/* Left text */}
        <div className="order-2 lg:order-1">
          {/* Badge */}
          <div className="hero-d0 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#6AB8D4] bg-[#E8F4F8] text-[11px] sm:text-xs font-medium text-[#1B5E82] mb-5 sm:mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-accent shrink-0 animate-bdot" />
            Plateforme omnicanale · Made in Africa
          </div>

          {/* H1 */}
          <h1 className="hero-d1 font-display text-[clamp(2.2rem,6vw,4rem)] font-semibold text-[#0D2137] leading-[1.1] tracking-[-0.025em] mb-5">
            Connectez vos clients
            <em className="not-italic font-normal text-accent block">
              à toute la pieuvre.
            </em>
          </h1>

          {/* Sub */}
          <p className="hero-d2 font-body text-base sm:text-[1.0625rem] font-light text-[#4A7A94] leading-relaxed max-w-[460px] mb-8 sm:mb-9">
            SMS, Email, WhatsApp et bien plus — orchestrés depuis une seule
            plateforme intelligente. Moins d'outils, plus d'impact.
          </p>

          {/* Buttons */}
          <div className="hero-d3 flex flex-col md:flex-row items-stretch xs:items-center gap-3 mb-10 sm:mb-12">
            <button
              onClick={() => scrollTo("cta")}
              className="font-body text-sm sm:text-[14px] font-medium px-6 sm:px-7 py-3 sm:py-3.5 rounded-full bg-accent text-white border-0 cursor-pointer btn-accent-shadow hover:bg-accent-hover hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-2"
            >
              Demander un accès
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path
                  d="M3 7h8M7 3l4 4-4 4"
                  stroke="#fff"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <button
              onClick={() => scrollTo("features")}
              className="font-body text-sm sm:text-[14px] font-normal px-6 sm:px-6 py-3 sm:py-3.5 rounded-full bg-transparent text-[#0D2137] border border-[#0D2137] cursor-pointer hover:bg-[#0D2137]/5 transition-all duration-200 text-center"
            >
              Découvrir les fonctionnalités
            </button>
          </div>

          {/* KPIs */}
          <div className="hero-d4 flex items-center gap-5 sm:gap-7">
            {KPI_STATS.map(([val, lbl], i) => (
              <div key={val} className="flex items-center gap-5 sm:gap-7">
                {i > 0 && <div className="w-px h-8 bg-[#DDE4EA]" />}
                <div>
                  <div className="font-display text-lg sm:text-[1.35rem] font-bold text-[#0D2137] tracking-[-0.02em]">
                    {val}
                  </div>
                  <div className="font-body text-[10px] sm:text-[11px] text-text-300 mt-0.5">
                    {lbl}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right visual — hidden on small, visible from lg */}
        <div className="order-1 lg:order-2 hero-visual flex justify-center items-center">
          <div className="animate-float relative w-70 h-70 sm:w-90 sm:h-90 md:w-105 md:h-105 lg:w-120 lg:h-120">
            {/* Channel pills — hidden on xs/sm, shown md+ */}
            <div className="hidden md:block">
              {CHANNELS.map((ch) => (
                <div
                  key={ch.label}
                  className={`absolute ${ch.pos} inline-flex items-center gap-[7px] px-3 py-2 rounded-full bg-white border border-[#DDE4EA] text-[11px] lg:text-xs font-medium text-[#0D2137] shadow-sm whitespace-nowrap`}
                >
                  <span
                    className="w-[7px] h-[7px] rounded-full shrink-0"
                    style={{ background: ch.color }}
                  />
                  {ch.label}
                </div>
              ))}
            </div>

            {/* SVG Octopus — scales with container */}
            <svg className="w-full h-full" viewBox="0 0 480 480" fill="none">
              <defs>
                <radialGradient id="hg" cx="50%" cy="40%" r="55%">
                  <stop offset="0%" stopColor="#2E8FAD" />
                  <stop offset="100%" stopColor="#0D2137" />
                </radialGradient>
                <linearGradient id="tg1" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#2E8FAD" stopOpacity=".9" />
                  <stop offset="100%" stopColor="#0D2137" stopOpacity=".25" />
                </linearGradient>
                <linearGradient id="tg2" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#E8541A" stopOpacity=".75" />
                  <stop offset="100%" stopColor="#1B5E82" stopOpacity=".2" />
                </linearGradient>
              </defs>
              <path
                d="M212 238 C182 208 118 176 78 118 C73 110 76 98 88 96 C100 94 106 103 104 113 C113 106 126 108 130 120 C134 132 126 142 116 143 C133 150 163 166 193 198"
                stroke="url(#tg1)"
                strokeWidth="15"
                strokeLinecap="round"
                fill="none"
                opacity=".88"
              />
              <path
                d="M268 238 C298 208 362 176 402 118 C407 110 404 98 392 96 C380 94 374 103 376 113 C367 106 354 108 350 120 C346 132 354 142 364 143 C347 150 317 166 287 198"
                stroke="url(#tg1)"
                strokeWidth="15"
                strokeLinecap="round"
                fill="none"
                opacity=".88"
              />
              <path
                d="M278 268 C320 258 378 246 418 206 C426 198 425 186 415 182 C405 178 397 186 400 196 C390 190 378 194 376 206 C374 218 384 226 394 224 C376 237 346 248 306 256"
                stroke="url(#tg2)"
                strokeWidth="13"
                strokeLinecap="round"
                fill="none"
                opacity=".82"
              />
              <path
                d="M202 268 C160 258 102 246 62 206 C54 198 55 186 65 182 C75 178 83 186 80 196 C90 190 102 194 104 206 C106 218 96 226 86 224 C104 237 134 248 174 256"
                stroke="url(#tg1)"
                strokeWidth="13"
                strokeLinecap="round"
                fill="none"
                opacity=".82"
              />
              <path
                d="M268 288 C298 320 338 368 358 398 C364 408 360 420 348 422 C336 424 328 414 332 404 C320 412 308 408 306 396 C304 384 314 376 324 378 C308 368 283 346 263 316"
                stroke="url(#tg1)"
                strokeWidth="12"
                strokeLinecap="round"
                fill="none"
                opacity=".78"
              />
              <path
                d="M212 288 C182 320 142 368 122 398 C116 408 120 420 132 422 C144 424 152 414 148 404 C160 412 172 408 174 396 C176 384 166 376 156 378 C172 368 197 346 217 316"
                stroke="url(#tg2)"
                strokeWidth="12"
                strokeLinecap="round"
                fill="none"
                opacity=".78"
              />
              <path
                d="M230 294 C222 338 212 378 192 413 C188 422 178 426 170 420 C162 414 164 404 172 400 C162 404 152 398 154 386 C156 374 168 370 176 374 C164 358 170 328 180 300"
                stroke="url(#tg2)"
                strokeWidth="11"
                strokeLinecap="round"
                fill="none"
                opacity=".72"
              />
              <path
                d="M250 294 C258 338 268 378 288 413 C292 422 302 426 310 420 C318 414 316 404 308 400 C318 404 328 398 326 386 C324 374 312 370 304 374 C316 358 310 328 300 300"
                stroke="url(#tg1)"
                strokeWidth="11"
                strokeLinecap="round"
                fill="none"
                opacity=".72"
              />
              <circle cx="114" cy="142" r="5.5" fill="#E8541A" opacity=".9" />
              <circle cx="366" cy="142" r="5.5" fill="#E8541A" opacity=".9" />
              <circle cx="394" cy="224" r="5" fill="#6AB8D4" opacity=".9" />
              <circle cx="86" cy="224" r="5" fill="#6AB8D4" opacity=".9" />
              <circle cx="324" cy="378" r="4.5" fill="#E8541A" opacity=".82" />
              <circle cx="156" cy="378" r="4.5" fill="#E8541A" opacity=".82" />
              <ellipse cx="240" cy="208" rx="90" ry="74" fill="url(#hg)" />
              <ellipse
                cx="224"
                cy="186"
                rx="32"
                ry="22"
                fill="rgba(255,255,255,.06)"
              />
              <circle cx="210" cy="204" r="17" fill="#0D2137" />
              <circle cx="270" cy="204" r="17" fill="#0D2137" />
              <circle cx="210" cy="204" r="10" fill="#E8F4F8" />
              <circle cx="270" cy="204" r="10" fill="#E8F4F8" />
              <circle cx="213" cy="201" r="6" fill="#2E8FAD" />
              <circle cx="273" cy="201" r="6" fill="#2E8FAD" />
              <circle cx="212" cy="203" r="3.5" fill="#0D2137" />
              <circle cx="272" cy="203" r="3.5" fill="#0D2137" />
              <circle cx="215" cy="200" r="2" fill="#fff" />
              <circle cx="275" cy="200" r="2" fill="#fff" />
              <path
                d="M222 222 Q240 235 258 222"
                stroke="rgba(255,255,255,.35)"
                strokeWidth="2"
                strokeLinecap="round"
                fill="none"
              />
              <circle cx="150" cy="166" r="3.5" fill="rgba(255,255,255,.18)" />
              <circle cx="170" cy="183" r="3" fill="rgba(255,255,255,.13)" />
              <circle cx="330" cy="166" r="3.5" fill="rgba(255,255,255,.18)" />
              <circle cx="310" cy="183" r="3" fill="rgba(255,255,255,.13)" />
              <circle cx="382" cy="242" r="3.5" fill="rgba(255,255,255,.18)" />
              <circle cx="98" cy="242" r="3.5" fill="rgba(255,255,255,.18)" />
              <circle cx="292" cy="312" r="3" fill="rgba(255,255,255,.13)" />
              <circle cx="188" cy="312" r="3" fill="rgba(255,255,255,.13)" />
              <circle
                cx="240"
                cy="208"
                r="108"
                stroke="#2E8FAD"
                strokeWidth=".5"
                strokeDasharray="4 7"
                opacity=".22"
              />
              <circle
                cx="240"
                cy="208"
                r="134"
                stroke="#1B5E82"
                strokeWidth=".5"
                strokeDasharray="2 9"
                opacity=".12"
              />
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Features ─── */
function Features() {
  const ref = useReveal<HTMLDivElement>();
  return (
    <section id="features" className="bg-white py-20 sm:py-24 lg:py-28">
      <div className="max-w-[1160px] mx-auto px-4 sm:px-6 lg:px-8">
        <div ref={ref} className="animate-reveal mb-12 sm:mb-14">
          <SectionTag>Fonctionnalités</SectionTag>
          <h2 className="font-display text-[clamp(1.75rem,3vw,2.5rem)] font-semibold text-[#0D2137] leading-[1.18] tracking-[-0.02em] mb-3.5">
            Tout ce dont vous avez{" "}
            <em className="not-italic font-normal text-[#2E8FAD]">besoin</em>
          </h2>
          <p className="font-body text-base font-light text-[#4A7A94] leading-relaxed max-w-[520px]">
            Une plateforme conçue pour les équipes qui veulent communiquer
            mieux, automatiser plus et mesurer chaque interaction.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {FEATURES.map((f, i) => {
            const r = useReveal<HTMLDivElement>();
            return (
              <div
                key={f.title}
                ref={r}
                className={`animate-reveal delay-${(i % 3) * 100}`}
              >
                <div className="group p-7 sm:p-8 rounded-[20px] border border-[#DDE4EA] bg-white relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_32px_rgba(13,33,55,0.08)] hover:border-[#6AB8D4] h-full">
                  <div className="accent-bar h-0.5 w-8 rounded-full mb-3" />
                  <div className="w-11 h-11 rounded-xl bg-[#E8F4F8] border border-[#6AB8D4] flex items-center justify-center mb-4 sm:mb-[18px]">
                    {f.icon}
                  </div>
                  <h3 className="font-display text-[1.05rem] sm:text-[1.1rem] font-semibold text-[#0D2137] mb-2.5">
                    {f.title}
                  </h3>
                  <p className="font-body text-sm sm:text-[0.9rem] text-[#4A7A94] leading-relaxed">
                    {f.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ─── AI Section ─── */
function AISection() {
  const headRef = useReveal<HTMLDivElement>();
  const cardsRef = useReveal<HTMLDivElement>();
  const vizRef = useReveal<HTMLDivElement>();

  return (
    <section
      id="ai"
      className="bg-[#0D2137] py-20 sm:py-24 lg:py-28 relative overflow-hidden"
    >
      <div className="ai-section-glow absolute inset-0 pointer-events-none" />

      <div className="max-w-[1160px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start lg:items-center">
          {/* Left */}
          <div>
            <div ref={headRef} className="animate-reveal mb-10 sm:mb-12">
              <SectionTag light>Intelligence artificielle</SectionTag>
              <h2 className="font-display text-[clamp(1.75rem,3vw,2.5rem)] font-semibold text-white leading-[1.18] tracking-[-0.02em] mb-3.5">
                Des stratégies complexes
                <br />
                <em className="not-italic font-normal text-[#F28A5F]">
                  en un seul clic.
                </em>
              </h2>
              <p className="font-body text-base font-light text-white/55 leading-relaxed max-w-[520px]">
                Notre moteur IA analyse vos données clients, anticipe les
                comportements et génère automatiquement des workflows de
                communication ultra-ciblés — sans une ligne de code.
              </p>
            </div>

            <div
              ref={cardsRef}
              className="animate-reveal delay-100 flex flex-col gap-3 sm:gap-3.5"
            >
              {AI_CARDS.map((card) => (
                <div
                  key={card.title}
                  className="group flex items-start gap-4 bg-white/6 border border-white/10 rounded-lg p-5 sm:px-6 transition-all duration-300 hover:bg-white/10 hover:border-white/20 hover:translate-x-1"
                >
                  <div
                    className={`w-10 h-10 rounded-md flex items-center justify-center shrink-0 ${card.teal ? "bg-[#2E8FAD]/20 border border-[#2E8FAD]/30" : "bg-accent/20 border border-accent/30"}`}
                  >
                    {card.icon}
                  </div>
                  <div>
                    <h4 className="font-display text-[1rem] font-semibold text-white mb-1.5">
                      {card.title}
                    </h4>
                    <p className="font-body text-sm text-white/55 leading-relaxed">
                      {card.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right visual */}
          <div
            ref={vizRef}
            className="animate-reveal delay-100 flex flex-col gap-3"
          >
            <div className="bg-white/[0.07] border border-white/12 rounded-lg p-5 sm:p-6">
              <p className="font-body text-[10px] font-medium tracking-[0.08em] uppercase text-white/35 mb-2.5">
                Instruction manager →
              </p>
              <p className="font-body text-[0.9375rem] text-white/88 leading-relaxed italic">
                "Je veux{" "}
                <strong className="not-italic font-medium text-accent-soft">
                  réactiver mes clients inactifs depuis 30 jours
                </strong>{" "}
                avec une offre spéciale, en privilégiant WhatsApp pour les moins
                de 35 ans et Email pour les autres."
              </p>
            </div>

            <div className="flex justify-center py-1">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 5v14M6 13l6 6 6-6"
                  stroke="rgba(106,184,212,0.5)"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            <div className="bg-[#2E8FAD]/12 border border-[#2E8FAD]/25 rounded-lg p-5 sm:p-6">
              <div className="flex items-center gap-1.5 mb-3">
                <span className="w-1.25 h-1.25 rounded-full bg-[#6AB8D4] shrink-0 animate-bdot" />
                <p className="font-body text-[10px] font-medium tracking-[0.08em] uppercase text-[#6AB8D4]/70">
                  Stratégie générée par l'IA
                </p>
              </div>
              <div className="flex flex-col gap-2 mb-3.5">
                {AI_STEPS.map((step, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-2.5 text-[0.8125rem] text-white/72 font-body"
                  >
                    <span className="w-5 h-5 rounded-full bg-[#2E8FAD]/30 flex items-center justify-center text-[10px] font-semibold text-[#6AB8D4] shrink-0 mt-[1px]">
                      {i + 1}
                    </span>
                    <span>{step}</span>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                {[
                  "✦ ROI estimé +34%",
                  "⚡ Prêt en 1 clic",
                  "🎯 Précision 94%",
                ].map((b) => (
                  <span
                    key={b}
                    className="font-body text-[11px] font-medium px-2.5 py-1 rounded-full bg-white/[0.08] border border-white/[0.15] text-white/70"
                  >
                    {b}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── How it works ─── */
function HowItWorks() {
  const headRef = useReveal<HTMLDivElement>();

  return (
    <section id="how" className="bg-[#F4F5F6] py-20 sm:py-24 lg:py-28">
      <div className="max-w-[1160px] mx-auto px-4 sm:px-6 lg:px-8">
        <div
          ref={headRef}
          className="animate-reveal text-center flex flex-col items-center mb-12 sm:mb-14"
        >
          <SectionTag>Comment ça marche</SectionTag>
          <h2 className="font-display text-[clamp(1.75rem,3vw,2.5rem)] font-semibold text-[#0D2137] leading-[1.18] tracking-[-0.02em] mb-3.5">
            Opérationnel en{" "}
            <em className="not-italic font-normal text-[#2E8FAD]">
              quatre étapes
            </em>
          </h2>
          <p className="font-body text-base font-light text-[#4A7A94] leading-relaxed max-w-[520px] text-center">
            De la création de compte à votre première campagne — en moins d'une
            heure.
          </p>
        </div>

        {/* Steps grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 relative">
          {/* Connector line — desktop only */}
          <div className="hidden lg:block absolute top-[27px] left-[12.5%] right-[12.5%] h-px gradient-line" />

          {HOW_STEPS.map((step, i) => {
            const r = useReveal<HTMLDivElement>();
            return (
              <div
                key={step.n}
                ref={r}
                className={`animate-reveal delay-${i * 100}`}
              >
                <div className="step-wrap text-center px-2 sm:px-4 relative z-10">
                  <div className="step-num w-[54px] h-[54px] rounded-full bg-white border border-[#DDE4EA] flex items-center justify-center font-display text-xl font-semibold text-[#0D2137] mx-auto mb-4 shadow-sm">
                    {step.n}
                  </div>
                  <h3 className="font-display text-[0.95rem] sm:text-base font-semibold text-[#0D2137] mb-2">
                    {step.title}
                  </h3>
                  <p className="font-body text-xs sm:text-[0.875rem] text-[#4A7A94] leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ─── Pricing ─── */
function Pricing() {
  const headRef = useReveal<HTMLDivElement>();
  const scrollTo = (id: string) =>
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  return (
    <section id="pricing" className="bg-white py-20 sm:py-24 lg:py-28">
      <div className="max-w-[1160px] mx-auto px-4 sm:px-6 lg:px-8">
        <div
          ref={headRef}
          className="animate-reveal text-center flex flex-col items-center mb-12 sm:mb-14"
        >
          <SectionTag>Tarifs</SectionTag>
          <h2 className="font-display text-[clamp(1.75rem,3vw,2.5rem)] font-semibold text-[#0D2137] leading-[1.18] tracking-[-0.02em] mb-3.5">
            Simple,{" "}
            <em className="not-italic font-normal text-[#2E8FAD]">
              transparent
            </em>
          </h2>
          <p className="font-body text-base font-light text-[#4A7A94] leading-relaxed max-w-[520px] text-center">
            Choisissez le plan adapté à votre volume. Pas de frais cachés, pas
            de mauvaises surprises.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 items-start">
          {PLANS.map((plan, i) => {
            const r = useReveal<HTMLDivElement>();
            return (
              <div
                key={plan.name}
                ref={r}
                className={`animate-reveal delay-${i * 100}`}
              >
                <div
                  className={`rounded-3xl p-8 sm:p-9 border relative transition-all duration-300 h-full flex flex-col ${plan.featured ? "bg-[#0D2137] border-[#0D2137]" : "bg-[#F4F5F6] border-[#DDE4EA] hover:-translate-y-1 hover:shadow-[0_12px_32px_rgba(13,33,55,0.08)]"}`}
                >
                  {plan.featured && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent text-white text-[11px] font-medium font-body px-4 py-1 rounded-full whitespace-nowrap">
                      Le plus populaire
                    </div>
                  )}

                  <h3
                    className={`font-display text-lg font-semibold mb-2 ${plan.featured ? "text-white" : "text-[#0D2137]"}`}
                  >
                    {plan.name}
                  </h3>
                  <p
                    className={`font-body text-[0.875rem] leading-snug mb-5 ${plan.featured ? "text-white/55" : "text-[#4A7A94]"}`}
                  >
                    {plan.desc}
                  </p>

                  <div
                    className={`font-display font-bold leading-none tracking-[-0.03em] mb-1 ${plan.featured ? "text-white" : "text-[#0D2137]"} ${plan.name === "Enterprise" ? "text-[2rem]" : "text-[2.4rem]"}`}
                  >
                    {plan.currency && (
                      <sup className="text-base font-normal align-top mt-1.5 mr-0.5">
                        {plan.currency}{" "}
                      </sup>
                    )}
                    {plan.price}
                  </div>
                  <p
                    className={`font-body text-[0.8rem] mb-5 ${plan.featured ? "text-white/45" : "text-[#8BAFC0]"}`}
                  >
                    {plan.period}
                  </p>

                  <div
                    className={`h-px mb-4 ${plan.featured ? "bg-white/12" : "bg-[#DDE4EA]"}`}
                  />

                  <ul className="flex flex-col gap-2.5 mb-7 flex-1">
                    {plan.features.map((f) => (
                      <li
                        key={f}
                        className={`flex items-start gap-2.5 font-body text-[0.875rem] ${plan.featured ? "text-white/75" : "text-[#4A7A94]"}`}
                      >
                        <span
                          className={`shrink-0 mt-[1px] ${plan.featured ? "text-[#F28A5F]" : "text-[#2E8FAD]"}`}
                        >
                          ✓
                        </span>
                        {f}
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() =>
                      plan.name === "Enterprise" ? scrollTo("cta") : undefined
                    }
                    className={`w-full py-3 rounded-full font-body text-sm font-medium cursor-pointer transition-all duration-300 ${plan.featured ? "bg-accent text-white border border-accent hover:bg-accent-hover hover:-translate-y-0.5 btn-accent-shadow" : "bg-transparent text-[#0D2137] border border-[#0D2137] hover:bg-[#0D2137] hover:text-white"}`}
                  >
                    {plan.name === "Enterprise"
                      ? "Nous contacter →"
                      : "Démarrer →"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ─── CTA ─── */
function CTASection() {
  const ref = useReveal<HTMLDivElement>();
  return (
    <section
      id="cta"
      className="bg-[#0D2137] py-20 sm:py-24 lg:py-28 relative overflow-hidden"
    >
      <div className="cta-section-glow absolute inset-0 pointer-events-none" />

      <div className="max-w-[1160px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div ref={ref} className="animate-reveal text-center">
          <SectionTag light>Contact</SectionTag>
          <h2 className="font-display text-[clamp(2rem,4vw,3.125rem)] font-semibold text-white leading-[1.18] tracking-[-0.02em] mb-4">
            Prêt à brancher
            <br />
            <em className="not-italic font-normal text-[#F28A5F]">
              tous vos canaux ?
            </em>
          </h2>
          <p className="font-body text-base font-light text-white/58 leading-relaxed max-w-115 mx-auto mb-9">
            Parlons de vos besoins. Notre équipe vous répond sous 24h et vous
            guide vers la solution idéale.
          </p>

          <div className="flex flex-col md:flex-row md:max-w-xl mx-auto items-center justify-center gap-3 mb-14 sm:mb-16">
            <button className="font-body text-sm sm:text-[14px] font-medium px-7 sm:px-8 py-3.5 rounded-full bg-accent text-white border-0 cursor-pointer btn-accent-cta-shadow hover:bg-accent-hover hover:-translate-y-0.5 transition-all duration-300 flex items-center gap-2 w-full xs:w-auto justify-center">
              Demander un accès
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path
                  d="M3 7h8M7 3l4 4-4 4"
                  stroke="#fff"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <button className="font-body text-sm sm:text-[14px] font-normal px-7 sm:px-7 py-3.5 rounded-full bg-transparent text-white/75 border border-white/25 cursor-pointer hover:border-white/60 hover:text-white transition-all duration-200 w-full xs:w-auto">
              Voir une démo
            </button>
          </div>

          <div className="grid grid-cols-3 gap-px bg-white/[0.08] rounded-2xl overflow-hidden max-w-[640px] mx-auto">
            {[
              ["24h", "Temps de réponse garanti"],
              ["100%", "Accompagnement local"],
              ["Free", "Démo sans engagement"],
            ].map(([val, lbl]) => (
              <div
                key={val}
                className="py-5 sm:py-6 px-4 bg-white/[0.04] text-center hover:bg-white/[0.08] transition-colors duration-200"
              >
                <div className="font-display text-[1.5rem] sm:text-[1.75rem] font-semibold text-white tracking-[-0.02em]">
                  {val}
                </div>
                <div className="font-body text-[10px] sm:text-[11px] text-white/42 mt-1">
                  {lbl}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Footer ─── */
function Footer() {
  const [lang, setLang] = useState<"FR" | "EN">("FR");

  const COLS = [
    {
      title: "Produit",
      links: ["Fonctionnalités", "Tarifs", "Comment ça marche", "Changelog"],
    },
    {
      title: "Ressources",
      links: ["Documentation API", "Guides", "Blog", "Support"],
    },
    { title: "Légal", links: ["Confidentialité", "CGU", "Cookies", "Contact"] },
  ];

  return (
    <footer className="bg-[#080F18] pt-14 sm:pt-16 pb-7">
      <div className="max-w-[1160px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10 pb-11 border-b border-white/[0.07]">
          {/* Brand */}
          <div className="col-span-2 sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-8 h-8 rounded-[9px] bg-[#0D2137] border border-white/[0.08] flex items-center justify-center shrink-0">
                <OctoLogo size={17} />
              </div>
              <span className="font-body text-sm font-medium text-white/80">
                OmniChannel
              </span>
            </div>
            <p className="font-body text-[0.875rem] text-white/38 leading-relaxed max-w-[248px]">
              Unifiez vos communications clients. Connectez tous vos canaux
              depuis une seule plateforme intelligente.
            </p>
          </div>

          {/* Link cols */}
          {COLS.map((col) => (
            <div key={col.title}>
              <p className="font-body text-[10px] font-medium text-white/28 uppercase tracking-[0.1em] mb-3.5">
                {col.title}
              </p>
              <ul className="flex flex-col gap-2.5">
                {col.links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="font-body text-[0.875rem] text-white/48 hover:text-white/88 transition-colors duration-200 no-underline"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="font-body text-[0.8rem] text-white/22">
            © 2026 OmniChannel. Tous droits réservés.
          </p>
          <div className="flex gap-3">
            {(["FR", "EN"] as const).map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                className={`font-body text-[0.8rem] bg-transparent border-0 cursor-pointer px-1.5 py-0.5 rounded transition-colors duration-200 ${lang === l ? "text-white/88" : "text-white/32 hover:text-white/88"}`}
              >
                {l}
              </button>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ─── Page ─── */
function LandingPage() {
  return (
    <div className="font-body bg-[#F4F5F6] text-[#0D2137] overflow-x-hidden">
      <Navbar />
      <Hero />
      <Features />
      <AISection />
      <HowItWorks />
      <Pricing />
      <CTASection />
      <Footer />
    </div>
  );
}
