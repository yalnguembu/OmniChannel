import { useState } from "react";
import { OctoLogo } from "./OctoLogo";

const COLS = [
  {
    title: "Produit",
    links: ["Fonctionnalités", "Tarifs", "Comment ça marche", "Changelog"],
  },
  {
    title: "Ressources",
    links: ["Documentation API", "Guides", "Blog", "Support"],
  },
  {
    title: "Légal",
    links: ["Confidentialité", "CGU", "Cookies", "Contact"],
  },
] as const;

export function Footer() {
  const [lang, setLang] = useState<"FR" | "EN">("FR");

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
              <span className="font-body text-sm font-medium text-white/80">OmniChannel</span>
            </div>
            <p className="font-body text-[0.875rem] text-white/38 leading-relaxed max-w-[248px]">
              Unifiez vos communications clients. Connectez tous vos canaux depuis une seule plateforme intelligente.
            </p>
          </div>

          {/* Link columns */}
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
                className={`font-body text-[0.8rem] bg-transparent border-0 cursor-pointer px-1.5 py-0.5 rounded transition-colors duration-200 ${
                  lang === l ? "text-white/88" : "text-white/32 hover:text-white/88"
                }`}
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
