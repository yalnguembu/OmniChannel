import React from "react";
import { Check } from "lucide-react";
import { formatDateTime } from "@/lib/date";

export function StepConfirmation({ draft }: { draft: any }) {
  return (
    <div className="bg-white p-10 rounded-[30px] border border-[#E5E7EB] text-center space-y-8 animate-in zoom-in-95 duration-400">
      <div className="w-20 h-20 bg-[#E8F4F8] rounded-[28px] flex items-center justify-center mx-auto shadow-inner text-[#2E8FAD]">
        <Check size={40} />
      </div>
      <div>
        <h2 className="text-[22px] font-bold text-[#0D2137]">Tout est prêt !</h2>
        <p className="text-[14px] text-[#8BAFC0] mt-2">
          Vérifiez les détails ci-dessous avant de lancer la diffusion.
        </p>
      </div>
      <div className="bg-[#F7F8F9] rounded-2xl p-6 text-left space-y-3">
        <div className="flex justify-between text-[13px] border-b border-[#E5E7EB] pb-2 mb-2">
          <span className="text-[#8BAFC0]">Nom de campagne</span>
          <span className="font-bold text-[#0D2137]">{draft.name}</span>
        </div>
        <div className="flex justify-between text-[13px]">
          <span className="text-[#8BAFC0]">Audience</span>
          <span className="font-bold text-[#0D2137]">
            {draft.segmentIds?.length || 0} segments sélectionnés
          </span>
        </div>
        <div className="flex justify-between text-[13px]">
          <span className="text-[#8BAFC0]">Canaux actifs</span>
          <span className="font-bold text-[#0D2137]">
            {draft.channelIds?.length || 0} canaux
          </span>
        </div>
        <div className="flex justify-between text-[13px] pt-2 border-t border-[#E5E7EB] mt-2">
          <span className="text-[#8BAFC0]">Planification</span>
          <span className="font-bold text-[#2E8FAD]">
            {draft.scheduledAt
              ? formatDateTime(draft.scheduledAt)
              : "Envoi immédiat"}
          </span>
        </div>
      </div>
    </div>
  );
}
