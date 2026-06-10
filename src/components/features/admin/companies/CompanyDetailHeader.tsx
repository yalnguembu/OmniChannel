import type { ReactNode } from "react";
import { Building2 } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { statusLabel } from "@/lib/utils";
import type { CompanyDto } from "@/shared/api/generated/types.gen";

interface CompanyDetailHeaderProps {
  company: CompanyDto;
  actions?: ReactNode;
}

export function CompanyDetailHeader({
  company,
  actions,
}: CompanyDetailHeaderProps) {
  return (
    <div className="bg-white border border-[#E5E7EB] rounded-[20px] p-6 mb-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-[12px] bg-[#E8F4F8] flex items-center justify-center">
            <Building2 size={22} className="text-[#2E8FAD]" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-[20px] font-semibold text-[#0D2137] tracking-tight">
                {company.name}
              </h1>
              <Badge
                variant={
                  company.status === "active"
                    ? "success"
                    : company.status === "suspended"
                      ? "error"
                      : "warning"
                }
                dot
              >
                {statusLabel(company.status ?? "")}
              </Badge>
              {company.isSandbox && <Badge variant="purple">Sandbox</Badge>}
            </div>
            <p className="text-[12px] text-[#8BAFC0] mt-1">
              {company.legalName ?? "—"} · {company.email ?? "—"} ·{" "}
              {company.country ?? "—"}
            </p>
          </div>
        </div>
        {actions && (
          <div className="flex items-center gap-2 shrink-0">{actions}</div>
        )}
      </div>
    </div>
  );
}
