import { UseFormRegister, Control, Controller } from "react-hook-form";
import type { TemplateModel } from "@/models/template.model";

const CATEGORIES = [
  { value: "", label: "— Aucune —" },
  { value: "Transactionnel", label: "Transactionnel" },
  { value: "Marketing", label: "Marketing" },
  { value: "Bienvenue", label: "Bienvenue" },
  { value: "Notification", label: "Notification" },
];

const LANGUAGES = [
  { value: "fr", label: "Français (FR)" },
  { value: "en", label: "English (EN)" },
];

const STATUSES = [
  { value: "active", label: "Actif" },
  { value: "draft", label: "Brouillon" },
  { value: "archived", label: "Archivé" },
];

interface TemplateInfoCardProps {
  register: UseFormRegister<TemplateModel>;
  control: Control<TemplateModel>;
}

const inputCls =
  "w-full px-3.5 py-2.5 border border-[#E5E7EB] rounded-[10px] text-[13px] text-[#0D2137] bg-white outline-none focus:border-[#2E8FAD] focus:ring-2 focus:ring-[#2E8FAD]/10 font-[inherit] transition-all";

const labelCls = "text-[11.5px] font-medium text-[#0D2137] mb-1.5 block";

export function TemplateInfoCard({ register, control }: TemplateInfoCardProps) {
  return (
    <div className="bg-white border border-[#E5E7EB] rounded-[14px]">
      <div className="px-4 py-3 border-b border-[#E5E7EB] bg-[#F7F8F9]">
        <span className="text-[12.5px] font-medium text-[#0D2137]">
          Informations
        </span>
      </div>
      <div className="p-4 grid grid-cols-2 gap-3">
        {/* Name */}
        <div>
          <label className={labelCls}>Nom du template</label>
          <input
            className={inputCls}
            placeholder="Nom du template…"
            {...register("name")}
          />
        </div>

        {/* Category */}
        <div>
          <label className={labelCls}>Catégorie</label>
          <select className={inputCls} {...register("category")}>
            {CATEGORIES.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        {/* Language */}
        <div>
          <label className={labelCls}>Langue</label>
          <select className={inputCls} {...register("language")}>
            {LANGUAGES.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        {/* Status */}
        <div>
          <label className={labelCls}>Statut</label>
          <select className={inputCls} {...register("status")}>
            {STATUSES.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
