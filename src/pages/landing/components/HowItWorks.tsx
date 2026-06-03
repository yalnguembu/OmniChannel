import { type HowStep as HowStepData, HOW_STEPS } from "../_data";
import { useReveal } from "../_hooks";
import { SectionTag } from "./SectionTag";

/* Each step manages its own reveal ref — avoids hook-in-loop violation */
function HowStepCard({ step, delay }: { step: HowStepData; delay: string }) {
  const ref = useReveal<HTMLDivElement>();
  return (
    <div ref={ref} className={`animate-reveal ${delay}`}>
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
}

const DELAYS = ["delay-0", "delay-100", "delay-200", "delay-300"];

export function HowItWorks() {
  const headRef = useReveal<HTMLDivElement>();

  return (
    <section id="how" className="bg-[#F4F5F6] py-20 sm:py-24 lg:py-28">
      <div className="max-w-[1160px] mx-auto px-4 sm:px-6 lg:px-8">
        <div ref={headRef} className="animate-reveal text-center flex flex-col items-center mb-12 sm:mb-14">
          <SectionTag>Comment ça marche</SectionTag>
          <h2 className="font-display text-[clamp(1.75rem,3vw,2.5rem)] font-semibold text-[#0D2137] leading-[1.18] tracking-[-0.02em] mb-3.5">
            Opérationnel en{" "}
            <em className="not-italic font-normal text-[#2E8FAD]">quatre étapes</em>
          </h2>
          <p className="font-body text-base font-light text-[#4A7A94] leading-relaxed max-w-[520px] text-center">
            De la création de compte à votre première campagne — en moins d'une heure.
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 relative">
          {/* Connector line — desktop only */}
          <div className="hidden lg:block absolute top-[27px] left-[12.5%] right-[12.5%] h-px gradient-line" />

          {HOW_STEPS.map((step, i) => (
            <HowStepCard key={step.n} step={step} delay={DELAYS[i]} />
          ))}
        </div>
      </div>
    </section>
  );
}
