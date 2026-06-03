import { useNavigate } from "@tanstack/react-router";
import { Building2, ArrowRight } from "lucide-react";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatRelative } from "@/lib/date";
import { statusLabel } from "@/lib/utils";
import type { CompanyDto } from "@/shared/api/generated/types.gen";

interface RecentCompaniesCardProps {
  companies: CompanyDto[];
}

export function RecentCompaniesCard({ companies }: RecentCompaniesCardProps) {
  const navigate = useNavigate();

  return (
    <Card>
      <CardHeader
        title="Companies récentes"
        action={
          <button
            onClick={() => navigate({ to: "/admin/companies" })}
            className="flex items-center gap-1 text-[12px] text-[#2E8FAD] hover:text-[#1B5E82] transition-colors cursor-pointer"
          >
            Toutes <ArrowRight size={11} />
          </button>
        }
      />
      <CardBody className="p-0">
        {companies.slice(0, 8).map((c) => (
          <div
            key={c.id}
            onClick={() =>
              navigate({
                to: "/admin/companies/$companyId",
                params: { companyId: c.id ?? "" },
              })
            }
            className="flex items-center justify-between px-5 py-3 border-b border-[#E5E7EB] last:border-b-0 hover:bg-[#F7F8F9] cursor-pointer transition-colors"
          >
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="w-7 h-7 rounded-[7px] bg-[#E8F4F8] flex items-center justify-center shrink-0">
                <Building2 size={13} className="text-[#2E8FAD]" />
              </div>
              <div className="min-w-0">
                <p className="text-[13px] font-medium text-[#0D2137] truncate">
                  {c.name}
                </p>
                <p className="text-[11.5px] text-[#8BAFC0]">
                  {c.country ?? "—"} · {formatRelative(c.createdAt)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {c.isSandbox && <Badge variant="neutral">Sandbox</Badge>}
              <Badge
                variant={
                  c.status === "active"
                    ? "success"
                    : c.status === "suspended"
                      ? "error"
                      : "warning"
                }
                dot
              >
                {statusLabel(c.status ?? "")}
              </Badge>
            </div>
          </div>
        ))}
      </CardBody>
    </Card>
  );
}
