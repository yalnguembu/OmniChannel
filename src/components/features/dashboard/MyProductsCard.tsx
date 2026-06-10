import { Package, ArrowRight } from "lucide-react";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { statusLabel } from "@/lib/utils";

export function MyProductsCard({
  products,
  onNavigateAll,
  onNavigateDetail,
}: {
  products: any[];
  onNavigateAll: () => void;
  onNavigateDetail: (id: string) => void;
}) {
  return (
    <Card>
      <CardHeader
        title="Mes produits"
        action={
          <button
            onClick={onNavigateAll}
            className="flex items-center gap-1 text-[12px] text-[#2E8FAD] hover:text-[#1B5E82] transition-colors cursor-pointer"
          >
            Gérer <ArrowRight size={11} />
          </button>
        }
      />
      <CardBody className="p-0">
        {products.length === 0 ? (
          <div className="flex items-center justify-center py-12 text-[13px] text-[#8BAFC0]">
            <Package size={20} className="mr-2.5 opacity-30" />
            Aucun produit
          </div>
        ) : (
          products.map((p) => (
            <div
              key={p.id}
              onClick={() => onNavigateDetail(p.id)}
              className="flex items-center justify-between px-5 py-3 border-b border-[#E5E7EB] last:border-b-0 hover:bg-[#F7F8F9] cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="w-7 h-7 rounded-[7px] bg-[#E8F4F8] flex items-center justify-center shrink-0 text-[#1B5E82]">
                  <Package size={13} />
                </div>
                <div className="min-w-0">
                  <p className="text-[13px] font-medium text-[#0D2137] truncate">
                    {p.name}
                  </p>
                  <p className="text-[11.5px] text-[#8BAFC0]">
                    {p.connectors?.length || 0} connecteurs actifs
                  </p>
                </div>
              </div>
              <Badge variant={p.status === "active" ? "success" : "neutral"} dot>
                {statusLabel(p.status)}
              </Badge>
            </div>
          ))
        )}
      </CardBody>
    </Card>
  );
}
