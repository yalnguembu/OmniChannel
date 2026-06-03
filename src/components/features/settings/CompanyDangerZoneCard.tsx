import React from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function CompanyDangerZoneCard({ onSuspend, onDeleteData, onCloseAccount }: { onSuspend: () => void, onDeleteData: () => void, onCloseAccount: () => void }) {
  return (
    <div className="border border-[#FCA5A5] rounded-[14px] overflow-hidden">
      <div className="px-5 py-3.5 border-b border-[#FCA5A5] bg-[#FEE2E2] flex items-center gap-2">
        <AlertTriangle size={14} className="text-[#DC2626]" />
        <p className="text-[13px] font-medium text-[#DC2626]">
          Zone de danger
        </p>
      </div>
      <div className="bg-white divide-y divide-[#E5E7EB]">
        {[
          {
            label: "Suspendre la company",
            desc: "Toutes vos campagnes et messages seront mis en pause. Vos données sont conservées.",
            action: onSuspend
          },
          {
            label: "Supprimer toutes les données",
            desc: "Tous vos contacts, messages et campagnes seront définitivement supprimés.",
            action: onDeleteData
          },
          {
            label: "Fermer le compte",
            desc: "Votre compte et toutes vos données seront supprimés sous 30 jours.",
            action: onCloseAccount
          },
        ].map((row) => (
          <div
            key={row.label}
            className="flex items-start justify-between px-5 py-4 gap-6"
          >
            <div>
              <p className="text-[13px] font-medium text-[#0D2137]">
                {row.label}
              </p>
              <p className="text-[12px] text-[#8BAFC0] mt-0.5 max-w-[400px]">
                {row.desc}
              </p>
            </div>
            <Button variant="danger" size="sm" className="shrink-0" onClick={row.action}>
              {row.label.split(" ").slice(0, 2).join(" ")}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
