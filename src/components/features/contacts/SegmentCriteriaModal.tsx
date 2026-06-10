import { Save, RefreshCw, PlayCircle } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { PageLoader } from "@/components/feedback/PageLoader";
import { fmt } from "@/lib/utils";
import type { ClientSegmentDto } from "@/shared/api/generated/types.gen";
import { useSegmentCriteria } from "@/hooks/useSegmentCriteria";
import { ConditionNodeEditor } from "./ConditionNodeEditor";

/**
 * Segment editor: name / description / dynamic flag + the recursive AND/OR
 * criteria tree, with a live "Tester" (preview) and save (criteria → JSON
 * string). Used as a drill-in from SegmentManagerModal.
 */
export function SegmentCriteriaModal({
  open,
  onClose,
  productId,
  segment,
}: {
  open: boolean;
  onClose: () => void;
  productId: string;
  segment?: ClientSegmentDto | null;
}) {
  const vm = useSegmentCriteria(productId, segment, { enabled: open });

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={vm.isEditing ? "Modifier le segment" : "Nouveau segment"}
      subtitle="Ciblage par arbre de conditions ET / OU"
      size="xl"
      footer={
        <div className="flex w-full items-center justify-between gap-3">
          <div>
            {vm.isEditing && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => vm.handleRecalculate()}
                loading={vm.isRecalculating}
              >
                <RefreshCw size={13} /> Recalculer
              </Button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={onClose}>
              Annuler
            </Button>
            <Button
              variant="primary"
              onClick={() => vm.handleSave(onClose)}
              loading={vm.isSaving}
              disabled={!vm.name.trim()}
            >
              <Save size={14} /> Enregistrer
            </Button>
          </div>
        </div>
      }
    >
      {vm.isLoading ? (
        <div className="py-10">
          <PageLoader />
        </div>
      ) : (
        <div className="space-y-5">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <Input
              label="Nom du segment *"
              placeholder="Ex: Expiration 30 mai"
              value={vm.name}
              onChange={(e) => vm.setName(e.target.value)}
            />
            <Input
              label="Description"
              placeholder="Optionnel"
              value={vm.description}
              onChange={(e) => vm.setDescription(e.target.value)}
            />
          </div>

          <label className="flex w-fit cursor-pointer items-center gap-2 text-[12.5px] text-[#4A7A94]">
            <input
              type="checkbox"
              checked={vm.isDynamic}
              onChange={(e) => vm.setIsDynamic(e.target.checked)}
              className="rounded"
            />
            Segment dynamique (ré-évalué à chaque consultation)
          </label>

          <div>
            <div className="mb-2 flex items-baseline justify-between gap-3">
              <p className="text-[13px] font-medium text-[#0D2137]">
                Critères de ciblage
              </p>
              <p className="text-[11.5px] text-[#8BAFC0]">
                Les « ET » sont évalués avant les « OU »
              </p>
            </div>
            <ConditionNodeEditor node={vm.criteria} path={[]} vm={vm} />
          </div>

          <div className="flex flex-wrap items-center gap-3 border-t border-[#E5E7EB] pt-4">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => vm.handlePreview()}
              loading={vm.isPreviewing}
            >
              <PlayCircle size={14} /> Tester
            </Button>
            {vm.preview && (
              <p className="text-[13px] text-[#0D2137]">
                <strong className="text-[#2E8FAD]">
                  {fmt(vm.preview.matchedCount ?? 0)}
                </strong>{" "}
                client(s) correspondant(s)
                {vm.preview.sampleClientIds &&
                  vm.preview.sampleClientIds.length > 0 && (
                    <span className="text-[#8BAFC0]">
                      {" "}
                      · ex.{" "}
                      {vm.preview.sampleClientIds
                        .slice(0, 3)
                        .map((id) => id.slice(0, 8))
                        .join(", ")}
                      …
                    </span>
                  )}
              </p>
            )}
          </div>
        </div>
      )}
    </Modal>
  );
}
