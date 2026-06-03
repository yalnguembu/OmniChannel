import { AI_CARDS, AI_STEPS } from "../_data";
import { useReveal } from "../_hooks";
import { SectionTag } from "./SectionTag";

const RESULT_BADGES = ["✦ ROI estimé +34%", "⚡ Prêt en 1 clic", "🎯 Précision 94%"];

export function AISection() {
  const headRef  = useReveal<HTMLDivElement>();
  const cardsRef = useReveal<HTMLDivElement>();
  const vizRef   = useReveal<HTMLDivElement>();

  return (
    <section id="ai" className="bg-[#0D2137] py-20 sm:py-24 lg:py-28 relative overflow-hidden">
      <div className="ai-section-glow absolute inset-0 pointer-events-none" />

      <div className="max-w-[1160px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start lg:items-center">

          {/* Left — heading + feature cards */}
          <div>
            <div ref={headRef} className="animate-reveal mb-10 sm:mb-12">
              <SectionTag light>Intelligence artificielle</SectionTag>
              <h2 className="font-display text-[clamp(1.75rem,3vw,2.5rem)] font-semibold text-white leading-[1.18] tracking-[-0.02em] mb-3.5">
                Des stratégies complexes
                <br />
                <em className="not-italic font-normal text-[#F28A5F]">en un seul clic.</em>
              </h2>
              <p className="font-body text-base font-light text-white/55 leading-relaxed max-w-[520px]">
                Notre moteur IA analyse vos données clients, anticipe les comportements
                et génère automatiquement des workflows de communication ultra-ciblés —
                sans une ligne de code.
              </p>
            </div>

            <div ref={cardsRef} className="animate-reveal delay-100 flex flex-col gap-3 sm:gap-3.5">
              {AI_CARDS.map((card) => (
                <div
                  key={card.title}
                  className="group flex items-start gap-4 bg-white/6 border border-white/10 rounded-lg p-5 sm:px-6 transition-all duration-300 hover:bg-white/10 hover:border-white/20 hover:translate-x-1"
                >
                  <div
                    className={`w-10 h-10 rounded-md flex items-center justify-center shrink-0 ${
                      card.teal
                        ? "bg-[#2E8FAD]/20 border border-[#2E8FAD]/30"
                        : "bg-accent/20 border border-accent/30"
                    }`}
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

          {/* Right — AI viz */}
          <div ref={vizRef} className="animate-reveal delay-100 flex flex-col gap-3">
            {/* Prompt */}
            <div className="bg-white/[0.07] border border-white/12 rounded-lg p-5 sm:p-6">
              <p className="font-body text-[10px] font-medium tracking-[0.08em] uppercase text-white/35 mb-2.5">
                Instruction manager →
              </p>
              <p className="font-body text-[0.9375rem] text-white/88 leading-relaxed italic">
                "Je veux{" "}
                <strong className="not-italic font-medium text-accent-soft">
                  réactiver mes clients inactifs depuis 30 jours
                </strong>{" "}
                avec une offre spéciale, en privilégiant WhatsApp pour les moins de 35 ans
                et Email pour les autres."
              </p>
            </div>

            {/* Arrow */}
            <div className="flex justify-center py-1">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M12 5v14M6 13l6 6 6-6" stroke="rgba(106,184,212,0.5)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>

            {/* Result */}
            <div className="bg-[#2E8FAD]/12 border border-[#2E8FAD]/25 rounded-lg p-5 sm:p-6">
              <div className="flex items-center gap-1.5 mb-3">
                <span className="w-1.25 h-1.25 rounded-full bg-[#6AB8D4] shrink-0 animate-bdot" />
                <p className="font-body text-[10px] font-medium tracking-[0.08em] uppercase text-[#6AB8D4]/70">
                  Stratégie générée par l'IA
                </p>
              </div>
              <div className="flex flex-col gap-2 mb-3.5">
                {AI_STEPS.map((step, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-[0.8125rem] text-white/72 font-body">
                    <span className="w-5 h-5 rounded-full bg-[#2E8FAD]/30 flex items-center justify-center text-[10px] font-semibold text-[#6AB8D4] shrink-0 mt-[1px]">
                      {i + 1}
                    </span>
                    <span>{step}</span>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                {RESULT_BADGES.map((b) => (
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
