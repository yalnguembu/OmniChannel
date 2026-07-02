import { Check } from "lucide-react";

export function StepConfirmation({ draft }: { draft: any }) {
  return (
    <div className="bg-white p-8 rounded-[14px] border border-[#E5E7EB] text-center space-y-6 animate-in zoom-in-95 duration-400 max-w-xl mx-auto">
      <div className="w-16 h-16 bg-[#E8F4F8] rounded-[14px] flex items-center justify-center mx-auto text-[#2E8FAD]">
        <Check size={32} />
      </div>
      <div>
        <h2 className="text-[18px] font-semibold text-[#0D2137]">Tout est prêt !</h2>
        <p className="text-[14px] text-[#8BAFC0] mt-2">
          Vérifiez les détails avant d'enregistrer. Vous configurerez ensuite les
          étapes et lancerez l'exécution depuis la page de détail.
        </p>
      </div>
      <div className="bg-[#F7F8F9] rounded-[12px] p-5 text-left space-y-3">
        <div className="flex justify-between text-[13px] border-b border-[#E5E7EB] pb-2 mb-2">
          <span className="text-[#8BAFC0]">Nom de campagne</span>
          <span className="font-semibold text-[#0D2137]">{draft.name}</span>
        </div>
        <div className="flex justify-between text-[13px]">
          <span className="text-[#8BAFC0]">Type</span>
          <span className="font-semibold text-[#0D2137]">
            {draft.isRecurring ? "Récurrente" : "Ponctuelle"}
          </span>
        </div>
        {draft.isRecurring && (
          <div className="flex justify-between text-[13px] pt-2 border-t border-[#E5E7EB] mt-2">
            <span className="text-[#8BAFC0]">Planification (cron)</span>
            <span className="font-semibold text-[#2E8FAD] font-mono">
              {draft.cronExpression || "—"}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
