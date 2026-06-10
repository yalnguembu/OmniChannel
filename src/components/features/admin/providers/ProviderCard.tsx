import { motion } from "framer-motion";
import { ExternalLink, Edit, CheckCircle2, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Can } from "@/security/components/Can";
import { ACTION } from "@/security/enums";
import { formatRelative } from "@/lib/date";
import { cardItem } from "@/lib/animations";
import type { SearchProviderResponse } from "@/shared/api/generated/types.gen";
import { getProviderTheme } from "./providerTheme";

interface ProviderCardProps {
  provider: SearchProviderResponse;
  onEdit: (provider: SearchProviderResponse) => void;
}

export function ProviderCard({ provider, onEdit }: ProviderCardProps) {
  const theme = getProviderTheme(provider.code);
  return (
    <motion.div
      variants={cardItem}
      className="bg-white border border-[#E5E7EB] rounded-[20px] overflow-hidden flex flex-col transition-all duration-[220ms] hover:-translate-y-1 hover:shadow-[0_12px_36px_rgba(13,33,55,0.10)] hover:border-[#6AB8D4]/50"
    >
      <div className="h-1 shrink-0" style={{ background: theme.stripe }} />
      <div className="p-5 flex-1 flex flex-col gap-3">
        <div className="flex items-start gap-3">
          <div
            className="w-12 h-12 rounded-[12px] border border-black/5 flex items-center justify-center font-bold text-[14px] shrink-0"
            style={{ background: theme.bg, color: theme.color }}
          >
            {provider.code?.slice(0, 2)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-[15px] text-[#0D2137] tracking-tight">
              {provider.name}
            </p>
            <p className="font-mono text-[11px] text-[#8BAFC0] mt-0.5">
              {provider.code}
            </p>
          </div>
          <div className="flex flex-col gap-1 items-end">
            <Badge variant={provider.isActive ? "success" : "neutral"} dot>
              {provider.isActive ? "Actif" : "Inactif"}
            </Badge>
            {provider.isGlobal && <Badge variant="info">Global</Badge>}
          </div>
        </div>
        {provider.baseUrl && (
          <a
            href={provider.baseUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-1.5 text-[12px] text-[#2E8FAD] hover:text-[#1B5E82] transition-colors truncate"
          >
            <ExternalLink size={11} />
            {provider.baseUrl.replace(/^https?:\/\//, "")}
          </a>
        )}
        <div className="flex items-center gap-2 mt-auto">
          {provider.isActive ? (
            <div className="flex items-center gap-1.5 text-[12px] text-[#16A34A]">
              <CheckCircle2 size={13} />
              Disponible
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-[12px] text-[#8BAFC0]">
              <XCircle size={13} />
              Inactif
            </div>
          )}
        </div>
        <div className="flex items-center justify-between pt-3 border-t border-[#E5E7EB]">
          <span className="text-[11px] text-[#8BAFC0]">
            {formatRelative(provider.createdAt)}
          </span>
          <Can perform={ACTION.PROVIDER_EDIT}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(provider);
              }}
              className="flex items-center gap-1.5 text-[12px] text-[#4A7A94] px-3 py-1.5 rounded-full border border-[#E5E7EB] hover:border-[#C8E8F2] hover:bg-[#E8F4F8] hover:text-[#2E8FAD] transition-all cursor-pointer"
            >
              <Edit size={11} />
              Modifier
            </button>
          </Can>
        </div>
      </div>
    </motion.div>
  );
}
