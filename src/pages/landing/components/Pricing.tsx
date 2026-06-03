import { type Plan, PLANS } from "../_data";
import { useReveal } from "../_hooks";
import { SectionTag } from "./SectionTag";

function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
}

/* Each card manages its own reveal ref — avoids hook-in-loop violation */
function PricingCard({ plan, delay }: { plan: Plan; delay: string }) {
  const ref = useReveal<HTMLDivElement>();
  const featured = plan.featured;

  return (
    <div ref={ref} className={`animate-reveal ${delay}`}>
      <div
        className={`rounded-3xl p-8 sm:p-9 border relative transition-all duration-300 h-full flex flex-col ${
          featured
            ? "bg-[#0D2137] border-[#0D2137]"
            : "bg-[#F4F5F6] border-[#DDE4EA] hover:-translate-y-1 hover:shadow-[0_12px_32px_rgba(13,33,55,0.08)]"
        }`}
      >
        {featured && (
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent text-white text-[11px] font-medium font-body px-4 py-1 rounded-full whitespace-nowrap">
            Le plus populaire
          </div>
        )}

        <h3 className={`font-display text-lg font-semibold mb-2 ${featured ? "text-white" : "text-[#0D2137]"}`}>
          {plan.name}
        </h3>
        <p className={`font-body text-[0.875rem] leading-snug mb-5 ${featured ? "text-white/55" : "text-[#4A7A94]"}`}>
          {plan.desc}
        </p>

        <div
          className={`font-display font-bold leading-none tracking-[-0.03em] mb-1 ${featured ? "text-white" : "text-[#0D2137]"} ${plan.name === "Enterprise" ? "text-[2rem]" : "text-[2.4rem]"}`}
        >
          {plan.currency && (
            <sup className="text-base font-normal align-top mt-1.5 mr-0.5">{plan.currency} </sup>
          )}
          {plan.price}
        </div>
        <p className={`font-body text-[0.8rem] mb-5 ${featured ? "text-white/45" : "text-[#8BAFC0]"}`}>
          {plan.period}
        </p>

        <div className={`h-px mb-4 ${featured ? "bg-white/12" : "bg-[#DDE4EA]"}`} />

        <ul className="flex flex-col gap-2.5 mb-7 flex-1">
          {plan.features.map((f) => (
            <li
              key={f}
              className={`flex items-start gap-2.5 font-body text-[0.875rem] ${featured ? "text-white/75" : "text-[#4A7A94]"}`}
            >
              <span className={`shrink-0 mt-[1px] ${featured ? "text-[#F28A5F]" : "text-[#2E8FAD]"}`}>✓</span>
              {f}
            </li>
          ))}
        </ul>

        <button
          onClick={() => plan.name === "Enterprise" ? scrollTo("cta") : undefined}
          className={`w-full py-3 rounded-full font-body text-sm font-medium cursor-pointer transition-all duration-300 ${
            featured
              ? "bg-accent text-white border border-accent hover:bg-accent-hover hover:-translate-y-0.5 btn-accent-shadow"
              : "bg-transparent text-[#0D2137] border border-[#0D2137] hover:bg-[#0D2137] hover:text-white"
          }`}
        >
          {plan.name === "Enterprise" ? "Nous contacter →" : "Démarrer →"}
        </button>
      </div>
    </div>
  );
}

const DELAYS = ["delay-0", "delay-100", "delay-200"];

export function Pricing() {
  const headRef = useReveal<HTMLDivElement>();

  return (
    <section id="pricing" className="bg-white py-20 sm:py-24 lg:py-28">
      <div className="max-w-[1160px] mx-auto px-4 sm:px-6 lg:px-8">
        <div ref={headRef} className="animate-reveal text-center flex flex-col items-center mb-12 sm:mb-14">
          <SectionTag>Tarifs</SectionTag>
          <h2 className="font-display text-[clamp(1.75rem,3vw,2.5rem)] font-semibold text-[#0D2137] leading-[1.18] tracking-[-0.02em] mb-3.5">
            Simple,{" "}
            <em className="not-italic font-normal text-[#2E8FAD]">transparent</em>
          </h2>
          <p className="font-body text-base font-light text-[#4A7A94] leading-relaxed max-w-[520px] text-center">
            Choisissez le plan adapté à votre volume. Pas de frais cachés, pas de mauvaises surprises.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 items-start">
          {PLANS.map((plan, i) => (
            <PricingCard key={plan.name} plan={plan} delay={DELAYS[i]} />
          ))}
        </div>
      </div>
    </section>
  );
}
