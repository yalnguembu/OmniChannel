import { useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { OctoLogo } from "./OctoLogo";

const NAV_LINKS = [
  ["features", "Fonctionnalités"],
  ["ai", "Intelligence IA"],
  ["how", "Comment ça marche"],
  ["pricing", "Tarifs"],
] as const;

function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
}

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    handler();
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const handleNav = (id: string) => {
    scrollTo(id);
    setMenuOpen(false);
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 h-[68px] flex items-center border-b border-transparent transition-all duration-300 ${
        scrolled ? "navbar-scrolled" : "bg-transparent"
      }`}
    >
      <div className="w-full max-w-[1160px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
        {/* Logo */}
        <div className="flex items-center gap-2.5 shrink-0">
          <OctoLogo size={55} />
          <span className="font-body text-[15px] font-medium text-[#0D2137] tracking-[-0.01em] whitespace-nowrap">
            OmniChannel
          </span>
        </div>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-7">
          {NAV_LINKS.map(([id, label]) => (
            <button
              key={id}
              onClick={() => handleNav(id)}
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
            className="font-body text-sm sm:text-[14px] font-normal px-6 sm:px-6 py-2 sm:py-2.5 rounded-full bg-transparent text-[#0D2137] border border-[#0D2137] cursor-pointer hover:bg-[#0D2137]/5 transition-all duration-200 text-center"
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
              onClick={() => handleNav(id)}
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
