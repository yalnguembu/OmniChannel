import { Navbar }     from "./components/Navbar";
import { Hero }       from "./components/Hero";
import { Features }   from "./components/Features";
import { AISection }  from "./components/AISection";
import { HowItWorks } from "./components/HowItWorks";
import { Pricing }    from "./components/Pricing";
import { CTASection } from "./components/CTASection";
import { Footer }     from "./components/Footer";

export function LandingPage() {
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
