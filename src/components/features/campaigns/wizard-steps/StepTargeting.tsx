import React from "react";
import { Plus, Users, Check } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export function StepTargeting({
  draft,
  updateDraft,
  segments,
  setShowSegmentModal,
}: {
  draft: any;
  updateDraft: (data: any) => void;
  segments: any[];
  setShowSegmentModal: (show: boolean) => void;
}) {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-400">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[16px] font-semibold text-[#0D2137]">
            Ciblage de l'audience
          </h2>
          <p className="text-[12px] text-[#8BAFC0] mt-1">
            Sélectionnez les segments qui recevront cette campagne
          </p>
        </div>
        <Button
          variant="secondary"
          size="sm"
          className="gap-1.5 px-4 font-medium bg-white border-[#E5E7EB]"
          onClick={() => setShowSegmentModal(true)}
        >
          <Plus size={14} /> Nouveau segment
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {segments.map((seg: any) => {
          const isSelected = draft.segmentIds?.includes(seg.id);
          return (
            <div
              key={seg.id}
              onClick={() => {
                const newIds = isSelected
                  ? draft.segmentIds?.filter((id: string) => id !== seg.id) || []
                  : [...(draft.segmentIds || []), seg.id];
                updateDraft({ segmentIds: newIds });
              }}
              className={cn(
                "p-5 rounded-[14px] border-2 cursor-pointer transition-all flex items-center justify-between",
                isSelected
                  ? "border-[#2E8FAD] bg-[#E8F4F8]"
                  : "border-[#E5E7EB] bg-white hover:border-[#B8CDD8]",
              )}
            >
              <div className="flex items-center gap-4">
                <div
                  className={cn(
                    "w-10 h-10 rounded-[9px] flex items-center justify-center",
                    isSelected
                      ? "bg-[#2E8FAD] text-white"
                      : "bg-[#F3F4F6] text-[#8BAFC0]",
                  )}
                >
                  <Users size={18} />
                </div>
                <div>
                  <p
                    className={cn(
                      "text-[14px] font-medium",
                      isSelected ? "text-[#0D2137]" : "text-[#4A7A94]",
                    )}
                  >
                    {seg.name}
                  </p>
                </div>
              </div>
              <div
                className={cn(
                  "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
                  isSelected
                    ? "border-[#2E8FAD] bg-[#2E8FAD] text-white"
                    : "border-[#D1D5DB]",
                )}
              >
                {isSelected && <Check size={14} />}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
