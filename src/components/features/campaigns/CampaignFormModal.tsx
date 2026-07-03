import { Loader2, Send, Repeat, Save } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { CronEditor } from "./CronEditor";
import { useCampaignWizard } from "@/hooks/useCampaignWizard";
import { cn } from "@/lib/utils";

interface CampaignFormModalProps {
  open: boolean;
  onClose: () => void;
  /** When set, the modal edits this campaign instead of creating a new one. */
  campaignId?: string;
  /** Product the campaign belongs to (campaigns are always product-scoped). */
  productId?: string;
}

const TYPES = [
  { recurring: false, label: "Ponctuelle", icon: Send },
  { recurring: true, label: "Récurrente", icon: Repeat },
] as const;

/**
 * Create / edit a campaign in a single compact modal. Campaigns are always
 * created in a product context, so there is no product selector — targeting,
 * steps and runs are configured afterwards on the campaign detail page.
 */
export function CampaignFormModal({
  open,
  onClose,
  campaignId,
  productId,
}: CampaignFormModalProps) {
  const vm = useCampaignWizard({ productId, campaignId, open, onClose });
  const { draft, updateDraft } = vm;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={vm.isEditing ? "Modifier la campagne" : "Nouvelle campagne"}
      subtitle="Informations générales et planification"
      size="md"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={vm.isSaving}>
            Annuler
          </Button>
          <Button
            variant="primary"
            onClick={vm.handleSubmit}
            loading={vm.isSaving}
            disabled={vm.loadingInitial}
          >
            <Save size={14} /> Enregistrer
          </Button>
        </>
      }
    >
      {vm.loadingInitial ? (
        <div className="flex items-center justify-center py-14">
          <Loader2 className="animate-spin text-[#2E8FAD]" size={30} />
        </div>
      ) : (
        <div className="space-y-4">
          <Input
            label="Nom de la campagne *"
            placeholder="ex: Relance réabonnement"
            value={draft.name || ""}
            onChange={(e) => updateDraft({ name: e.target.value })}
          />

          <Textarea
            label="Description & objectifs"
            placeholder="Détaillez le but de cette campagne…"
            value={draft.description || ""}
            onChange={(e) => updateDraft({ description: e.target.value })}
            className="min-h-20"
          />

          {/* Type — compact segmented control */}
          <div>
            <p className="text-[12px] font-medium text-[#4A7A94] mb-1.5">
              Type de campagne
            </p>
            <div className="inline-flex rounded-[10px] border border-[#E5E7EB] bg-[#F3F4F6] p-0.5">
              {TYPES.map((t) => {
                const sel = !!draft.isRecurring === t.recurring;
                const Icon = t.icon;
                return (
                  <button
                    key={t.label}
                    type="button"
                    onClick={() => updateDraft({ isRecurring: t.recurring })}
                    className={cn(
                      "flex items-center gap-1.5 px-4 py-1.5 rounded-[8px] text-[12.5px] font-medium transition-all",
                      sel
                        ? "bg-white text-[#0D2137] shadow-[0_1px_2px_rgba(13,33,55,0.08)]"
                        : "text-[#8BAFC0] hover:text-[#4A7A94]",
                    )}
                  >
                    <Icon size={13} /> {t.label}
                  </button>
                );
              })}
            </div>
            <p className="text-[11px] text-[#8BAFC0] mt-1.5">
              {draft.isRecurring
                ? "Exécutée automatiquement selon l'expression cron ci-dessous."
                : "Exécution unique, à démarrer à la demande depuis la page de détail."}
            </p>
          </div>

          {draft.isRecurring && (
            <div className="bg-[#F9FAFB] p-3 rounded-[10px] border border-[#E5E7EB]">
              <CronEditor
                value={draft.cronExpression || "0 7 * * *"}
                onChange={(cron) => updateDraft({ cronExpression: cron })}
              />
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}
