import { Send, Repeat } from "lucide-react";
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
      <div className="bg-white p-6 rounded-lg border border-[#E5E7EB] space-y-6">
        <Input
          label="Nom de la campagne *"
          placeholder="ex: Relance réabonnement"
          value={draft.name || ""}
          onChange={(e) => updateDraft({ name: e.target.value })}
          className="h-12 text-[15px]"
        />
        {!productId && (
          <Select
            label="Espace produit lié *"
            value={draft.productId || ""}
            onChange={(e: any) => updateDraft({ productId: e.target.value })}
            options={[
              { value: "", label: "Sélectionner un espace..." },
              ...dropdownProducts.map((p: any) => ({
                value: p.id,
                label: p.name,
              })),
            ]}
          />
        )}
        <Textarea
          label="Description & Objectifs"
          placeholder="Détaillez le but de cette campagne..."
          value={draft.description || ""}
          onChange={(e) => updateDraft({ description: e.target.value })}
          className="min-h-30"
        />
      </div>

      <div className="bg-white p-6 rounded-lg border border-[#E5E7EB]">
        <p className="text-[13px] font-medium text-[#0D2137] mb-5">
          Type de campagne
        </p>
        <div className="grid grid-cols-2 gap-4">
          {[
            {
              recurring: false,
              label: "Ponctuelle",
              desc: "Exécution unique (à la demande)",
              icon: Send,
            },
            {
              recurring: true,
              label: "Récurrente",
              desc: "Planifiée par expression cron",
              icon: Repeat,
            },
          ].map((t) => {
            const sel = !!draft.isRecurring === t.recurring;
            const Icon = t.icon;
            return (
              <div
                key={t.label}
                onClick={() => updateDraft({ isRecurring: t.recurring })}
                className={cn(
                  "p-4 border rounded-lg cursor-pointer transition-all hover:bg-[#F7F8F9] relative",
                  sel
                    ? "border-[#2E8FAD] bg-[#E8F4F8]"
                    : "border-[#F0F2F4] bg-white hover:border-[#B8CDD8]",
                )}
              >
                <div
                  className={cn(
                    "w-10 h-10 rounded-[9px] flex items-center justify-center mb-3",
                    sel ? "bg-[#2E8FAD] text-white" : "bg-[#F3F4F6] text-[#8BAFC0]",
                  )}
                >
                  <Icon size={18} />
                </div>
                <p
                  className={cn(
                    "text-[14px] font-medium",
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
