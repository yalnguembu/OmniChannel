import type { ProductModel } from "@/models/product.model";
import { formatDate } from "@/lib/date";
import { DetailCard } from "./DetailCard";

interface SettingsTabProps {
  product: ProductModel;
}

/** "Paramètres" tab: general info + advanced configuration. */
export function SettingsTab({ product }: SettingsTabProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5">
      <DetailCard
        title="Informations générales"
        action={
          <span className="text-[12px] text-[#2E8FAD] cursor-pointer">
            Modifier
          </span>
        }
        bodyClassName="p-4.5 flex flex-col gap-0"
      >
        <div className="flex items-start justify-between py-3.5 border-b border-[#E5E7EB]">
          <div>
            <div className="text-[13px] font-medium text-[#0D2137] mb-1">
              Nom du produit
            </div>
          </div>
          <span className="text-[13px] text-[#4A7A94] ml-4 shrink-0 text-right">
            {product.name}
          </span>
        </div>
        <div className="flex items-start justify-between py-3.5 border-b border-[#E5E7EB]">
          <div>
            <div className="text-[13px] font-medium text-[#0D2137] mb-1">
              Description
            </div>
            <div className="text-[12px] text-[#8BAFC0] leading-relaxed max-w-[360px]">
              {product.description || "—"}
            </div>
          </div>
        </div>
        <div className="flex items-start justify-between py-3.5 border-b border-[#E5E7EB]">
          <div>
            <div className="text-[13px] font-medium text-[#0D2137] mb-1">
              UUID Produit
            </div>
          </div>
          <span className="text-[13px] font-mono text-[#1B5E82] ml-4 shrink-0 text-right">
            {product.id}
          </span>
        </div>
        <div className="flex items-start justify-between py-3.5">
          <div>
            <div className="text-[13px] font-medium text-[#0D2137] mb-1">
              Dernière Mise à Jour
            </div>
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
        <div className="flex items-start justify-between py-3.5 border-b border-[#E5E7EB]">
          <div>
            <div className="text-[13px] font-medium text-[#0D2137] mb-1">
              Clé API (Environnement)
            </div>
            <div className="text-[12px] text-[#8BAFC0] leading-relaxed max-w-[360px]">
              Clé secrète d'accès à l'API. Gardez-la en sécurité.
            </div>
          </div>
          <span className="text-[13px] font-mono text-[#1B5E82] ml-4 shrink-0 text-right bg-[#E8F4F8] border border-[#6AB8D4]/30 px-2 py-1 rounded">
            {`sk_prod_${product.id.slice(0, 8)}...`}
          </span>
        </div>
        <div className="flex items-start justify-between py-3.5">
          <div>
            <div className="text-[13px] font-medium text-[#0D2137] mb-1">
              Zone danger
            </div>
            <div className="text-[12px] text-[#8BAFC0] leading-relaxed max-w-[360px]">
              Mettre en pause ou archiver ce produit
            </div>
          </div>
          <button className="text-[11.5px] font-normal px-2.5 py-1 rounded-full bg-transparent text-[#DC2626] border border-[#FCA5A5] hover:bg-[#FEE2E2] transition-all ml-4 shrink-0 flex items-center gap-1.5">
            Mettre en pause
          </button>
        </div>
      </DetailCard>
    </div>
  );
}
