import { UseFormRegister } from "react-hook-form";
import type { TemplateModel } from "@/models/template.model";

interface TemplateSubjectCardProps {
  register: UseFormRegister<TemplateModel>;
}

const SUBJECT_VARIABLES = ["{{order_id}}", "{{customer_name}}"];

export function TemplateSubjectCard({ register }: TemplateSubjectCardProps) {
  return (
    <div className="bg-white border border-[#E5E7EB] rounded-[14px]">
      <div className="px-4 py-3 border-b border-[#E5E7EB] bg-[#F7F8F9]">
        <span className="text-[12.5px] font-medium text-[#0D2137]">
          Objet du message{" "}
          <span className="text-[11px] text-[#8BAFC0] font-normal">
            (Email uniquement)
          </span>
        </span>
      </div>
      <div className="p-4">
        <input
          className="w-full px-3.5 py-2.5 border border-[#E5E7EB] rounded-[10px] text-[13px] text-[#0D2137] bg-white outline-none focus:border-[#2E8FAD] focus:ring-2 focus:ring-[#2E8FAD]/10 font-[inherit] transition-all"
          placeholder="Objet de l'email… ex: ✅ Votre commande {{order_id}} est confirmée !"
          {...register("subject")}
        />
        <p className="text-[11.5px] text-[#8BAFC0] mt-1.5">
          Variables disponibles :{" "}
          {SUBJECT_VARIABLES.map((v) => (
            <code key={v} className="text-[#E8541A] font-mono mr-1">
              {v}
            </code>
          ))}
        </p>
      </div>
    </div>
  );
}
