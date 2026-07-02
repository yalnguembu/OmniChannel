import { Send, Repeat } from "lucide-react";
import { CronEditor } from "../CronEditor";

export function StepScheduling({
  draft,
  updateDraft,
}: {
  draft: any;
  updateDraft: (data: any) => void;
}) {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-400 max-w-2xl">
      <div>
        <h2 className="text-[17px] font-bold text-[#0D2137]">Planification</h2>
        <p className="text-[12px] text-[#8BAFC0] mt-1">
          {draft.isRecurring
            ? "Définissez la fréquence d'exécution (cron)."
            : "Cette campagne s'exécute à la demande depuis sa page de détail."}
        </p>
      </div>

      {draft.isRecurring ? (
        <div className="bg-white p-6 rounded-[14px] border border-[#E5E7EB] space-y-4">
          <div className="flex items-center gap-2 text-[13px] font-medium text-[#0D2137]">
            <Repeat size={15} className="text-[#2E8FAD]" />
            Campagne récurrente
          </div>
          <CronEditor
            value={draft.cronExpression || "0 7 * * *"}
            onChange={(cron) => updateDraft({ cronExpression: cron })}
          />
        </div>
      ) : (
        <div className="bg-white p-6 rounded-[14px] border border-[#E5E7EB] flex items-start gap-4">
          <div className="w-12 h-12 rounded-md flex items-center justify-center bg-[#E8F4F8] text-[#2E8FAD] shrink-0">
            <Send size={22} />
          </div>
          <div>
            <p className="text-[15px] font-semibold text-[#0D2137]">
              Exécution à la demande
            </p>
            <p className="text-[13px] text-[#8BAFC0] mt-1">
              Après création, ajoutez les étapes puis démarrez une exécution
              depuis la page de détail de la campagne.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
