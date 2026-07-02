import { motion } from "framer-motion";
import { Plug, Settings, Edit, Trash2, CheckCircle2, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Can } from "@/security/components/Can";
import { ACTION } from "@/security/enums";
import { formatRelative } from "@/lib/date";
import { cardItem } from "@/lib/animations";
import type { SearchIntegrationResponse } from "@/shared/api/generated/types.gen";

interface IntegrationCardProps {
  integration: SearchIntegrationResponse;
  onConfigure: (integration: SearchIntegrationResponse) => void;
  onEdit: (integration: SearchIntegrationResponse) => void;
  onDelete: (integration: SearchIntegrationResponse) => void;
}

const syncDirectionLabel: Record<string, string> = {
  Pull: "Entrante",
  Push: "Sortante",
  Sync: "Synchrone",
};

export function IntegrationCard({
  integration,
  onConfigure,
  onEdit,
  onDelete,
}: IntegrationCardProps) {
  const active = integration.isActive ?? false;

  return (
    <motion.div
      variants={cardItem}
      className="bg-white border border-[#E5E7EB] rounded-[20px] overflow-hidden flex flex-col transition-all duration-[220ms] hover:-translate-y-1 hover:shadow-[0_12px_36px_rgba(13,33,55,0.10)] hover:border-[#6AB8D4]/50"
    >
      <div
        className="h-1 shrink-0"
        style={{ background: active ? "linear-gradient(90deg,#2E8FAD,#6AB8D4)" : "#DDE4EA" }}
      />
      <div className="p-5 flex-1 flex flex-col gap-3">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-[12px] border border-black/5 flex items-center justify-center shrink-0 bg-[#E8F4F8] text-[#2E8FAD]">
            <Plug size={20} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-[15px] text-[#0D2137] tracking-tight truncate">
              {integration.name}
            </p>
            <p className="font-mono text-[11px] text-[#8BAFC0] mt-0.5">
              {integration.type}
            </p>
          </div>
          <div className="flex flex-col gap-1 items-end shrink-0">
            <Badge variant={active ? "success" : "neutral"} dot>
              {active ? "Actif" : "Inactif"}
            </Badge>
            {integration.syncDirection && (
              <Badge variant="info">
                {syncDirectionLabel[integration.syncDirection] ?? integration.syncDirection}
              </Badge>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 mt-auto">
          {active ? (
            <div className="flex items-center gap-1.5 text-[12px] text-[#16A34A]">
              <CheckCircle2 size={13} />
              {integration.lastSyncAt
                ? `Sync ${formatRelative(integration.lastSyncAt)}`
                : "Disponible"}
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
            {formatRelative(integration.createdAt)}
          </span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onConfigure(integration)}
              className="flex items-center gap-1.5 text-[12px] text-[#4A7A94] px-3 py-1.5 rounded-full border border-[#E5E7EB] hover:border-[#C8E8F2] hover:bg-[#E8F4F8] hover:text-[#2E8FAD] transition-all cursor-pointer"
            >
              <Settings size={11} />
              Configurer
            </button>
            <Can perform={ACTION.INTEGRATION_WRITE}>
              <button
                onClick={() => onEdit(integration)}
                title="Modifier"
                className="w-8 h-8 rounded-full flex items-center justify-center text-[#8BAFC0] hover:bg-[#E8F4F8] hover:text-[#2E8FAD] transition-all cursor-pointer"
              >
                <Edit size={14} />
              </button>
              <button
                onClick={() => onDelete(integration)}
                title="Supprimer"
                className="w-8 h-8 rounded-full flex items-center justify-center text-[#8BAFC0] hover:bg-[#FEE2E2] hover:text-[#DC2626] transition-all cursor-pointer"
              >
                <Trash2 size={14} />
              </button>
            </Can>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
