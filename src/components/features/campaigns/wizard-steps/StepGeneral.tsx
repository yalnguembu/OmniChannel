import React from "react";
import { Send, Sparkles, Zap, Repeat } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { cn } from "@/lib/utils";

export function StepGeneral({
  draft,
  updateDraft,
  dropdownProducts,
  productId,
}: {
  draft: any;
  updateDraft: (data: any) => void;
  dropdownProducts: any[];
  productId?: string;
}) {
  return (
    <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-400">
      <div className="bg-white p-8 rounded-lg border border-border space-y-6">
        <Input
          label="Nom de la campagne *"
          placeholder="ex: Promo Printemps - SMS"
          value={draft.name || ""}
          onChange={(e) => updateDraft({ name: e.target.value })}
          className="h-12 text-[15px]"
        />
        <Select
          label="Espace produit lié *"
          value={draft.productId || ""}
          onChange={(e: any) => updateDraft({ productId: e.target.value })}
          disabled={!!productId}
          options={[
            { value: "", label: "Sélectionner un espace..." },
            ...dropdownProducts.map((p: any) => ({
              value: p.id,
              label: p.name,
            })),
          ]}
        />
        <Textarea
          label="Description & Objectifs"
          placeholder="Détaillez le but de cette campagne..."
          value={draft.description || ""}
          onChange={(e) => updateDraft({ description: e.target.value })}
          className="min-h-[120px]"
        />
      </div>

      <div className="bg-white p-8 rounded-lg border border-border">
        <p className="text-[13.5px] font-bold text-[#0D2137] mb-5">
          Type de diffusion
        </p>
        <div className="grid grid-cols-2 gap-4">
          {[
            {
              id: "standard",
              label: "Standard",
              desc: "Envoi massif instantané",
              icon: Send,
            },
            {
              id: "ai",
              label: "IA · Auto",
              desc: "Optimisation par l'IA",
              icon: Sparkles,
            },
            {
              id: "trigger",
              label: "Déclenché",
              desc: "Basé sur un événement",
              icon: Zap,
            },
            {
              id: "recurring",
              label: "Récurrent",
              desc: "Série planifiée",
              icon: Repeat,
            },
          ].map((t) => {
            const sel = draft.type === t.id;
            const Icon = t.icon;
            return (
              <div
                key={t.id}
                onClick={() => updateDraft({ type: t.id as any })}
                className={cn(
                  "p-4.5 p-[18px] border-2 rounded-[20px] cursor-pointer transition-all hover:bg-[#FBFBFC] relative",
                  sel
                    ? "border-[#2E8FAD] bg-[#E8F4F8]"
                    : "border-[#F0F2F4] bg-white hover:border-[#B8CDD8]",
                )}
              >
                <div
                  className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center mb-3",
                    sel
                      ? "bg-[#2E8FAD] text-white shadow-lg shadow-[#2E8FAD]/20"
                      : "bg-[#F3F4F6] text-[#8BAFC0]",
                  )}
                >
                  <Icon size={18} />
                </div>
                <p
                  className={cn(
                    "text-[14.5px] font-bold",
                    sel ? "text-[#0D2137]" : "text-[#4A7A94]",
                  )}
                >
                  {t.label}
                </p>
                <p className="text-[11px] text-[#8BAFC0] mt-1 font-medium">
                  {t.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
