import { motion } from "framer-motion";
import { Building2, CheckCircle2, XCircle, Clock } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { formatRelative } from "@/lib/date";
import { statusLabel, cn } from "@/lib/utils";
import { cardItem } from "@/lib/animations";
import type { CompanyDto } from "@/shared/api/generated/types.gen";
import { STRIPES, STATUS_V } from "./companyStatus";

interface CompanyCardProps {
  c: CompanyDto;
  onClick: () => void;
}

export function CompanyCard({ c, onClick }: CompanyCardProps) {
  return (
    <motion.div
      variants={cardItem}
      onClick={onClick}
      className="bg-white border border-[#E5E7EB] rounded-[20px] overflow-hidden cursor-pointer flex flex-col transition-all duration-[220ms] hover:-translate-y-1 hover:shadow-[0_12px_36px_rgba(13,33,55,0.10)] hover:border-[#6AB8D4]/50"
    >
      <div
        className="h-1 shrink-0"
        style={{ background: STRIPES[c.status ?? ""] ?? STRIPES.inactive }}
      />
      <div className="p-5 flex-1 flex flex-col gap-3">
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 rounded-[12px] bg-[#E8F4F8] border border-black/5 flex items-center justify-center shrink-0">
            <Building2 size={20} className="text-[#2E8FAD]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-[14.5px] text-[#0D2137] tracking-tight truncate">
              {c.name}
            </p>
            <p className="text-[11.5px] text-[#8BAFC0] truncate mt-0.5">
              {c.legalName ?? c.email ?? "—"}
            </p>
          </div>
          <div className="flex flex-col gap-1 items-end shrink-0">
            <Badge variant={STATUS_V[c.status ?? ""] ?? "neutral"} dot>
              {statusLabel(c.status ?? "")}
            </Badge>
            {c.isSandbox && <Badge variant="neutral">Sandbox</Badge>}
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {c.country && (
            <span className="text-[11px] text-[#4A7A94] bg-[#F0F2F4] px-2 py-0.5 rounded-full">
              {c.country}
            </span>
          )}
          {c.defaultLanguage && (
            <span className="text-[11px] text-[#4A7A94] bg-[#F0F2F4] px-2 py-0.5 rounded-full">
              {c.defaultLanguage.toUpperCase()}
            </span>
          )}
          {c.billingMode && (
            <span className="text-[11px] text-[#4A7A94] bg-[#F0F2F4] px-2 py-0.5 rounded-full">
              {c.billingMode}
            </span>
          )}
        </div>
        <div className="grid grid-cols-3 bg-[#F7F8F9] border border-[#E5E7EB] rounded-[8px] overflow-hidden">
          {[
            { label: "Actif", ok: c.status === "active" },
            { label: "Email", ok: !!c.email },
            { label: "Sandbox", ok: !!c.isSandbox },
          ].map(({ label, ok }, i) => (
            <div
              key={label}
              className={cn(
                "py-2.5 flex flex-col items-center gap-1",
                i > 0 && "border-l border-[#E5E7EB]",
              )}
            >
              {ok ? (
                <CheckCircle2 size={13} className="text-[#16A34A]" />
              ) : (
                <XCircle size={13} className="text-[#B8CDD8]" />
              )}
              <p className="text-[10px] text-[#8BAFC0] uppercase tracking-[0.04em]">
                {label}
              </p>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between pt-2 border-t border-[#E5E7EB]">
          <p className="text-[12px] text-[#4A7A94] truncate flex-1">
            {c.email ?? "—"}
          </p>
          <span className="text-[11px] text-[#8BAFC0] ml-2 flex items-center gap-1 shrink-0">
            <Clock size={10} />
            {formatRelative(c.createdAt)}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
