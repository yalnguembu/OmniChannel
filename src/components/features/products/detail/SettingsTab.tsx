import { Pause, Play } from "lucide-react";
import type { ProductModel } from "@/models/product.model";
import { formatDate } from "@/lib/date";
import { statusLabel } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { DetailCard } from "./DetailCard";

interface SettingsTabProps {
  product: ProductModel;
  onEdit: () => void;
  onChangeStatus: (status: string) => void;
  isUpdatePending: boolean;
}

const STATUS_PILL: Record<string, string> = {
  active: "bg-[#DCFCE7] text-[#16A34A] border-[#86EFAC]",
  paused: "bg-[#FEF3C7] text-[#B45309] border-[#FCD34D]",
  draft: "bg-[#F0F2F4] text-[#4A7A94] border-[#E5E7EB]",
  inactive: "bg-[#F0F2F4] text-[#8BAFC0] border-[#E5E7EB]",
};

/** "Paramètres" tab: real product info + status actions (no fabricated data). */
export function SettingsTab({
  product,
  onEdit,
  onChangeStatus,
  isUpdatePending,
}: SettingsTabProps) {
  const isActive = product.status === "active";
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5">
      <DetailCard
        title="Informations générales"
        action={
          <span
            className="text-[12px] text-[#2E8FAD] cursor-pointer"
            onClick={onEdit}
          >
            Modifier
          </span>
        }
        bodyClassName="p-4.5 flex flex-col gap-0"
      >
        <div className="flex items-start justify-between py-3.5 border-b border-[#E5E7EB]">
          <div className="text-[13px] font-medium text-[#0D2137]">
            Nom du produit
          </div>
          <span className="text-[13px] text-[#4A7A94] ml-4 shrink-0 text-right">
            {product.name}
          </span>
        </div>
        <div className="flex items-start justify-between py-3.5 border-b border-[#E5E7EB]">
          <div className="text-[13px] font-medium text-[#0D2137]">
            Description
          </div>
          <span className="text-[12px] text-[#8BAFC0] leading-relaxed max-w-[260px] ml-4 text-right">
            {product.description || "—"}
          </span>
        </div>
        <div className="flex items-center justify-between py-3.5 border-b border-[#E5E7EB]">
          <div className="text-[13px] font-medium text-[#0D2137]">Statut</div>
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-[5px] text-[11px] font-medium border ${
              STATUS_PILL[product.status] ?? STATUS_PILL.draft
            }`}
          >
            {statusLabel(product.status)}
          </span>
        </div>
        <div className="flex items-start justify-between py-3.5 border-b border-[#E5E7EB]">
          <div className="text-[13px] font-medium text-[#0D2137]">
            UUID Produit
          </div>
          <span className="text-[13px] font-mono text-[#1B5E82] ml-4 shrink-0 text-right">
            {product.id}
          </span>
        </div>
        <div className="flex items-start justify-between py-3.5">
          <div className="text-[13px] font-medium text-[#0D2137]">
            Dernière mise à jour
          </div>
          <span className="text-[13px] text-[#4A7A94] ml-4 shrink-0 text-right">
            {formatDate(product.updatedAt || product.createdAt)}
          </span>
        </div>
      </DetailCard>

      <DetailCard
        title="Configuration avancée"
        bodyClassName="p-4.5 flex flex-col gap-0"
      >
        <div className="flex items-start justify-between py-3.5">
          <div>
            <div className="text-[13px] font-medium text-[#0D2137] mb-1">
              {isActive ? "Mettre en pause" : "Activer le produit"}
            </div>
            <div className="text-[12px] text-[#8BAFC0] leading-relaxed max-w-[360px]">
              {isActive
                ? "Suspend les envois liés à ce produit sans le supprimer."
                : "Réactive ce produit pour reprendre les envois."}
            </div>
          </div>
          <Button
            variant={isActive ? "danger" : "secondary"}
            size="sm"
            loading={isUpdatePending}
            onClick={() => onChangeStatus(isActive ? "paused" : "active")}
            className="ml-4 shrink-0"
          >
            {isActive ? <Pause size={13} /> : <Play size={13} />}
            {isActive ? "Mettre en pause" : "Activer"}
          </Button>
        </div>
      </DetailCard>
    </div>
  );
}
