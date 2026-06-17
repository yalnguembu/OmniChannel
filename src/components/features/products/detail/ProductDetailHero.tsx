import { Edit, Package, Megaphone } from "lucide-react";
import type { ProductModel } from "@/models/product.model";
import { formatDate } from "@/lib/date";
import { statusLabel } from "@/lib/utils";

interface ProductDetailHeroProps {
  product: ProductModel;
  onBack: () => void;
  onEdit: () => void;
  onNewCampaign: () => void;
}

/** Top hero bar: back button, product identity and primary actions. */
export function ProductDetailHero({
  product,
  onBack,
  onEdit,
  onNewCampaign,
}: ProductDetailHeroProps) {
  return (
    <div className="flex items-center justify-between py-5">
      <div className="flex items-center gap-4">
        <div className="w-[52px] h-[52px] rounded-[14px] bg-[#E8F4F8] border border-[#2E8FAD]/20 flex items-center justify-center shrink-0">
          <Package size={26} className="text-[#2E8FAD]" strokeWidth={1.5} />
        </div>
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-[20px] font-semibold text-[#0D2137] tracking-tight leading-tight">
              {product.name}
            </h1>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[5px] text-[11.5px] font-medium bg-[#DCFCE7] text-[#16A34A] border border-[#86EFAC]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A]"></span>
              {statusLabel(product.status)}
            </div>
          </div>
          <div className="text-[12px] text-[#8BAFC0] mt-1">
            ID: {product.id.slice(0, 8)} · Créée le{" "}
            {product.createdAt ? formatDate(product.createdAt) : "—"}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-transparent text-[#4A7A94] border border-[#E5E7EB] text-[13px] hover:bg-[#F0F2F4] transition-colors"
          onClick={onEdit}
        >
          <Edit size={13} />
          Modifier
        </button>
        <button
          className="flex items-center gap-1.5 px-4.5 py-2 rounded-full bg-[#E8541A] text-white border-none text-[13px] font-medium hover:bg-[#D44814] hover:-translate-y-px transition-all shadow-[0_2px_10px_rgba(232,84,26,0.25)] hover:shadow-[0_4px_16px_rgba(232,84,26,0.35)]"
          onClick={onNewCampaign}
        >
          <Megaphone size={13} strokeWidth={2.5} />
          Nouvelle campagne
        </button>
      </div>
    </div>
  );
}
