import { Sparkles } from "lucide-react";
import { useState } from "react";

const AI_CHIPS = [
  "Réécrire en ton plus chaleureux",
  "Ajouter une offre de réduction",
  "Raccourcir le message SMS",
  "Traduire en anglais",
  "Variante pour WhatsApp",
];

export function AIPromptBox() {
  const [prompt, setPrompt] = useState("");

  return (
    <div
      className="rounded-[14px] border border-[#C4B5FD]"
      style={{ background: "linear-gradient(135deg,#FAFAFE,#F3F0FF)" }}
    >
      {/* Header */}
      <div className="px-4 py-3.5 flex items-center gap-3 border-b border-[#C4B5FD]/30">
        <div
          className="w-8 h-8 rounded-[9px] flex items-center justify-center shrink-0 shadow-sm"
          style={{ background: "linear-gradient(135deg,#7C3AED,#9333EA)" }}
        >
          <Sparkles size={14} color="#fff" />
        </div>
        <div>
          <p className="text-[13px] font-semibold text-[#7C3AED]">
            Génération IA
          </p>
          <p className="text-[11.5px] text-[#7C3AED]/60 mt-0.5">
            Décrivez ce que vous voulez — l'IA rédige, vous ajustez
          </p>
        </div>
        <div className="ml-auto">
          <span
            className="inline-flex items-center gap-1 px-2 py-1 rounded-[5px] text-[11px] font-semibold text-[#7C3AED] border border-[#C4B5FD]"
            style={{ background: "linear-gradient(135deg,#EDE9FE,#F5F3FF)" }}
          >
            <Sparkles size={9} /> Propulsé par IA
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="p-4">
        <div className="flex gap-2 mb-2.5">
          <input
            className="flex-1 px-3.5 py-2.5 border border-[#C4B5FD]/50 rounded-md text-[13px] text-[#0D2137] bg-white outline-none focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/10 placeholder-[#8BAFC0]"
            placeholder="ex : Réécris ce message en ton plus chaleureux avec une offre de réduction 10%…"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
          <button
            className="px-4 py-2.5 rounded-md text-[13px] font-medium text-white flex items-center gap-1.5 border-none cursor-pointer shrink-0 shadow-sm hover:opacity-90 transition-all disabled:opacity-50"
            style={{ background: "linear-gradient(135deg,#7C3AED,#9333EA)" }}
            disabled={!prompt.trim()}
          >
            <Sparkles size={13} /> Générer
          </button>
        </div>

        {/* Quick chips */}
        <div className="flex flex-wrap gap-1.5">
          {AI_CHIPS.map((s) => (
            <span
              key={s}
              onClick={() => setPrompt(s)}
              className="text-[11.5px] px-2.5 py-1 rounded-full cursor-pointer transition-all text-[#7C3AED] border border-[#C4B5FD]/40 hover:border-[#C4B5FD] select-none"
              style={{ background: "rgba(196,181,253,0.2)" }}
            >
              {s}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
