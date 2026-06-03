import { type FeatureItem, FEATURES } from "../_data";
import { useReveal } from "../_hooks";
import { SectionTag } from "./SectionTag";

/* Each card manages its own reveal ref — avoids hook-in-loop violation */
function FeatureCard({ feature, delay }: { feature: FeatureItem; delay: string }) {
  const ref = useReveal<HTMLDivElement>();
  return (
    <div ref={ref} className={`animate-reveal ${delay}`}>
      <div className="group p-7 sm:p-8 rounded-[20px] border border-[#DDE4EA] bg-white relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_32px_rgba(13,33,55,0.08)] hover:border-[#6AB8D4] h-full">
        <div className="accent-bar h-0.5 w-8 rounded-full mb-3" />
        <div className="w-11 h-11 rounded-xl bg-[#E8F4F8] border border-[#6AB8D4] flex items-center justify-center mb-4 sm:mb-[18px]">
          {feature.icon}
        </div>
        <h3 className="font-display text-[1.05rem] sm:text-[1.1rem] font-semibold text-[#0D2137] mb-2.5">
          {feature.title}
        </h3>
        <p className="font-body text-sm sm:text-[0.9rem] text-[#4A7A94] leading-relaxed">
          {feature.desc}
        </p>
      </div>
    </div>
  );
}

const DELAYS = ["delay-0", "delay-100", "delay-200"];

export function Features() {
  const headRef = useReveal<HTMLDivElement>();

  return (
    <section id="features" className="bg-white py-20 sm:py-24 lg:py-28">
      <div className="max-w-[1160px] mx-auto px-4 sm:px-6 lg:px-8">
        <div ref={headRef} className="animate-reveal mb-12 sm:mb-14">
          <SectionTag>Fonctionnalités</SectionTag>
          <h2 className="font-display text-[clamp(1.75rem,3vw,2.5rem)] font-semibold text-[#0D2137] leading-[1.18] tracking-[-0.02em] mb-3.5">
            Tout ce dont vous avez{" "}
            <em className="not-italic font-normal text-[#2E8FAD]">besoin</em>
          </h2>
          <p className="font-body text-base font-light text-[#4A7A94] leading-relaxed max-w-[520px]">
            Une plateforme conçue pour les équipes qui veulent communiquer mieux,
            automatiser plus et mesurer chaque interaction.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {FEATURES.map((f, i) => (
            <FeatureCard key={f.title} feature={f} delay={DELAYS[i % 3]} />
          ))}
        </div>
      </div>
    </section>
  );
}
