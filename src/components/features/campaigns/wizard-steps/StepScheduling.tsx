import React from "react";
import { Send, Calendar, Clock } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils";

export function StepScheduling({
  draft,
  updateDraft,
}: {
  draft: any;
  updateDraft: (data: any) => void;
}) {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-400">
      <div>
        <h2 className="text-[17px] font-bold text-[#0D2137]">
          Planification des envois
        </h2>
        <p className="text-[12px] text-[#8BAFC0] mt-1">
          Choisissez quand vos messages doivent être diffusés
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div
          onClick={() => updateDraft({ scheduledAt: undefined })}
          className={cn(
            "p-6 rounded-[14px] border-2 cursor-pointer transition-all space-y-4",
            !draft.scheduledAt
              ? "border-[#2E8FAD] bg-[#E8F4F8]"
              : "border-[#E5E7EB] bg-white hover:border-[#B8CDD8]",
          )}
        >
          <div
            className={cn(
              "w-12 h-12 rounded-md flex items-center justify-center",
              !draft.scheduledAt
                ? "bg-[#2E8FAD] text-white"
                : "bg-[#F3F4F6] text-[#8BAFC0]",
            )}
          >
            <Send size={24} />
          </div>
          <div>
            <p className="text-[15px] font-semibold text-[#0D2137]">Immédiat</p>
            <p className="text-[13px] text-[#8BAFC0] mt-1">
              Lancer la diffusion dès la validation finale.
            </p>
          </div>
        </div>

        <div
          onClick={() =>
            !draft.scheduledAt &&
            updateDraft({
              scheduledAt: new Date(Date.now() + 86400000).toISOString(),
            })
          }
          className={cn(
            "p-6 rounded-[14px] border-2 cursor-pointer transition-all space-y-4",
            draft.scheduledAt
              ? "border-[#2E8FAD] bg-[#E8F4F8]"
              : "border-[#E5E7EB] bg-white hover:border-[#B8CDD8]",
          )}
        >
          <div
            className={cn(
              "w-12 h-12 rounded-md flex items-center justify-center",
              draft.scheduledAt
                ? "bg-[#2E8FAD] text-white"
                : "bg-[#F3F4F6] text-[#8BAFC0]",
            )}
          >
            <Calendar size={24} />
          </div>
          <div>
            <p className="text-[15px] font-semibold text-[#0D2137]">Planifier</p>
            <p className="text-[13px] text-[#8BAFC0] mt-1">
              Choisir une date et une heure précises.
            </p>
          </div>
        </div>
      </div>

      {draft.scheduledAt && (
        <div className="bg-white p-6 rounded-[14px] border border-[#E5E7EB] space-y-4 animate-in slide-in-from-top-2 duration-300">
          <Input
            label="Date & Heure de diffusion"
            type="datetime-local"
            value={draft.scheduledAt ? draft.scheduledAt.slice(0, 16) : ""}
            onChange={(e) =>
              updateDraft({
                scheduledAt: new Date(e.target.value).toISOString(),
              })
            }
          />
          <p className="text-[11px] text-[#8BAFC0] flex items-center gap-2">
            <Clock size={12} />
            Fuseau horaire : Europe/Paris (UTC+01:00)
          </p>
        </div>
      )}
    </div>
  );
}
