import React from "react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Toggle } from "@/components/ui/Toggle";

export function CompanyPreferencesCard({ company, onEditClick }: { company?: any, onEditClick: () => void }) {
  return (
    <div className="bg-white border border-[#E5E7EB] rounded-[14px] overflow-hidden mb-4">
      <div className="px-5 py-3.5 border-b border-[#E5E7EB] bg-[#F7F8F9] flex items-center justify-between">
        <p className="text-[13px] font-medium text-[#0D2137]">
          Préférences régionales
        </p>
        <Button variant="ghost" size="sm" onClick={onEditClick}>
          Modifier
        </Button>
      </div>
      <div className="divide-y divide-[#E5E7EB]">
        {[
          {
            label: "Langue par défaut",
            desc: "Utilisée dans les interfaces et les templates",
            value: company?.defaultLanguage ?? "Français",
          },
          {
            label: "Fuseau horaire",
            desc: "Toutes les heures d'envoi sont calculées dans ce fuseau",
            value: company?.timezone ?? "Africa/Douala (UTC+1)",
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
              <p className="text-[12px] text-[#8BAFC0] mt-0.5 max-w-[380px]">
                {row.desc}
              </p>
            </div>
            <span className="text-[13px] font-medium text-[#0D2137] shrink-0">
              {row.value}
            </span>
          </div>
        ))}
        <div className="flex items-start justify-between px-5 py-4 gap-6">
          <div>
            <p className="text-[13px] font-medium text-[#0D2137]">
              Mode sandbox
            </p>
            <p className="text-[12px] text-[#8BAFC0] mt-0.5 max-w-[380px]">
              Les messages ne seront pas réellement envoyés en mode test
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {company?.isSandbox && <Badge variant="error">Activé</Badge>}
            <Toggle
              checked={company?.isSandbox ?? false}
              onChange={() => {}}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
