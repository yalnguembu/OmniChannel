import React from "react";
import { Megaphone, ArrowRight, Activity } from "lucide-react";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/feedback/EmptyState";
import { fmt, statusLabel } from "@/lib/utils";

export function RecentCampaignsCard({
  campaigns,
  onNavigateAll,
  onNavigateDetail,
}: {
  campaigns: any[];
  onNavigateAll: () => void;
  onNavigateDetail: (id: string) => void;
}) {
  return (
    <Card className="rounded-md border-[#E5E7EB]">
      <CardHeader
        title="Campagnes Recentes"
        className="px-8 py-6 border-b border-[#F3F4F6]"
        action={
          <button
            onClick={onNavigateAll}
            className="text-[12px] font-bold text-[#2E8FAD] hover:underline flex items-center gap-1 cursor-pointer px-3 py-1.5 rounded-lg hover:bg-[#E8F4F8] transition-all"
          >
            Tout voir <ArrowRight size={14} />
          </button>
        }
      />
      <CardBody className="p-0">
        {campaigns.length === 0 ? (
          <EmptyState
            title="Aucune campagne"
            description="Commencez par créer une diffusion"
            icon={<Megaphone size={32} />}
            className="py-20"
          />
        ) : (
          <div className="divide-y divide-[#F3F4F6]">
            {campaigns.map((c) => (
              <div
                key={c.id}
                onClick={() => onNavigateDetail(c.id)}
                className="flex items-center justify-between px-8 py-5 hover:bg-[#FBFBFC] cursor-pointer transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[#F7F8F9] flex items-center justify-center text-[#8BAFC0] group-hover:bg-[#E8F4F8] group-hover:text-[#2E8FAD] transition-all shadow-sm">
                    <Activity size={18} />
                  </div>
                  <div>
                    <p className="text-[14px] font-bold text-[#0D2137] group-hover:text-[#2E8FAD] transition-colors">
                      {c.name}
                    </p>
                    <p className="text-[11px] text-[#8BAFC0] font-semibold uppercase tracking-wider mt-1">
                      {c.type} · {fmt(c.successfulSends)} envoyés
                    </p>
                  </div>
                </div>
                <Badge
                  variant={c.status === "active" ? "success" : "neutral"}
                  dot
                  className="shadow-none"
                >
                  {statusLabel(c.status)}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardBody>
    </Card>
  );
}
