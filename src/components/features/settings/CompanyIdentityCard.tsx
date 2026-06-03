import React from "react";
import { Edit } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { getInitials, statusLabel } from "@/lib/utils";

export function CompanyIdentityCard({ company, onEditClick }: { company?: any, onEditClick: () => void }) {
  return (
    <div className="bg-white border border-[#E5E7EB] rounded-[14px] overflow-hidden mb-4">
      <div className="px-5 py-3.5 border-b border-[#E5E7EB] bg-[#F7F8F9] flex items-center justify-between">
        <p className="text-[13px] font-medium text-[#0D2137]">Identité</p>
        <Button variant="ghost" size="sm" onClick={onEditClick}>
          <Edit size={11} />
          Modifier
        </Button>
      </div>
      <div className="p-5">
        <div className="flex items-center gap-5 mb-5 pb-5 border-b border-[#E5E7EB]">
          <div
            className="w-[72px] h-[72px] rounded-[16px] flex items-center justify-center text-[22px] font-bold border border-[#2E8FAD]/20 shrink-0 cursor-pointer"
            style={{
              background: "linear-gradient(135deg,#E8F4F8,#C5E5F5)",
              color: "#1B5E82",
            }}
          >
            {company && company.name
              ? getInitials(
                  company.name.split(" ")[0] || "",
                  company.name.split(" ")[1] || "",
                )
              : "—"}
          </div>
          <div>
            <p className="text-[18px] font-semibold text-[#0D2137] tracking-tight">
              {company?.name ?? "—"}
            </p>
            <p className="text-[12.5px] text-[#8BAFC0] mt-0.5">
              {company?.legalName ?? "—"}
            </p>
            <div className="flex gap-2 mt-2">
              <Badge
                variant={
                  company?.status === "active" ? "success" : "warning"
                }
                dot
              >
                {company ? statusLabel(company.status) : "—"}
              </Badge>
              <Badge variant="info">Plan Growth</Badge>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {[
            { label: "Numéro fiscal", value: company?.taxNumber ?? "—" },
            { label: "Email professionnel", value: company?.email ?? "—" },
            { label: "Téléphone", value: company?.phone ?? "—" },
            { label: "Site web", value: company?.website ?? "—" },
            { label: "Adresse", value: company?.address ?? "—" },
            { label: "Pays", value: company?.country ?? "—" },
          ].map((row) => (
            <div key={row.label}>
              <p className="text-[11.5px] text-[#8BAFC0] mb-0.5">
                {row.label}
              </p>
              <p className="text-[13px] text-[#0D2137]">{row.value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
