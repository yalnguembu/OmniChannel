import React from "react";
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
    <Card className="rounded-md border-[#E5E7EB]">
      <CardHeader
        title="Mes Produits"
        className="px-8 py-6 border-b border-[#F3F4F6]"
        action={
          <button
            onClick={onNavigateAll}
            className="text-[12px] font-bold text-[#1B5E82] hover:underline flex items-center gap-1 cursor-pointer px-3 py-1.5 rounded-lg hover:bg-[#F3F4F6] transition-all"
          >
            Gérer <ArrowRight size={14} />
          </button>
        }
      />
      <CardBody className="p-0">
        <div className="divide-y divide-[#F3F4F6]">
          {products.map((p) => (
            <div
              key={p.id}
              onClick={() => onNavigateDetail(p.id)}
              className="flex items-center justify-between px-8 py-5 hover:bg-[#FBFBFC] cursor-pointer transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#F7F8F9] flex items-center justify-center text-[#8BAFC0] group-hover:bg-[#E8F4F8] group-hover:text-[#1B5E82] transition-all shadow-sm">
                  <Package size={18} />
                </div>
                <div>
                  <p className="text-[14px] font-bold text-[#0D2137] group-hover:text-[#1B5E82] transition-colors">
                    {p.name}
                  </p>
                  <p className="text-[11px] text-[#8BAFC0] font-semibold uppercase tracking-wider mt-1">
                    {p.connectors?.length || 0} connecteurs actifs
                  </p>
                </div>
              </div>
              <Badge
                variant={p.status === "active" ? "success" : "neutral"}
                dot
              >
                {statusLabel(p.status)}
              </Badge>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}
