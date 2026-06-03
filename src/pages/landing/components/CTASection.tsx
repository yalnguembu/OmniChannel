import { useReveal } from "../_hooks";
import { SectionTag } from "./SectionTag";

const TRUST_STATS = [
  ["24h",   "Temps de réponse garanti"],
  ["100%",  "Accompagnement local"],
  ["Free",  "Démo sans engagement"],
] as const;

export function CTASection() {
  const ref = useReveal<HTMLDivElement>();

  return (
    <section id="cta" className="bg-[#0D2137] py-20 sm:py-24 lg:py-28 relative overflow-hidden">
      <div className="cta-section-glow absolute inset-0 pointer-events-none" />

      <div className="max-w-[1160px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div ref={ref} className="animate-reveal text-center">
          <SectionTag light>Contact</SectionTag>
          <h2 className="font-display text-[clamp(2rem,4vw,3.125rem)] font-semibold text-white leading-[1.18] tracking-[-0.02em] mb-4">
            Prêt à brancher
            <br />
            <em className="not-italic font-normal text-[#F28A5F]">tous vos canaux ?</em>
          </h2>
          <p className="font-body text-base font-light text-white/58 leading-relaxed max-w-115 mx-auto mb-9">
            Parlons de vos besoins. Notre équipe vous répond sous 24h et vous guide vers la solution idéale.
          </p>

          <div className="flex flex-col md:flex-row md:max-w-xl mx-auto items-center justify-center gap-3 mb-14 sm:mb-16">
            <button className="font-body text-sm sm:text-[14px] font-medium px-7 sm:px-8 py-3.5 rounded-full bg-accent text-white border-0 cursor-pointer btn-accent-cta-shadow hover:bg-accent-hover hover:-translate-y-0.5 transition-all duration-300 flex items-center gap-2 w-full xs:w-auto justify-center">
              Demander un accès
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M3 7h8M7 3l4 4-4 4" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <button className="font-body text-sm sm:text-[14px] font-normal px-7 sm:px-7 py-3.5 rounded-full bg-transparent text-white/75 border border-white/25 cursor-pointer hover:border-white/60 hover:text-white transition-all duration-200 w-full xs:w-auto">
              Voir une démo
            </button>
          </div>

          <div className="grid grid-cols-3 gap-px bg-white/[0.08] rounded-2xl overflow-hidden max-w-[640px] mx-auto">
            {TRUST_STATS.map(([val, lbl]) => (
              <div
                key={val}
                className="py-5 sm:py-6 px-4 bg-white/[0.04] text-center hover:bg-white/[0.08] transition-colors duration-200"
              >
                <div className="font-display text-[1.5rem] sm:text-[1.75rem] font-semibold text-white tracking-[-0.02em]">
                  {val}
                </div>
                <div className="font-body text-[10px] sm:text-[11px] text-white/42 mt-1">{lbl}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
