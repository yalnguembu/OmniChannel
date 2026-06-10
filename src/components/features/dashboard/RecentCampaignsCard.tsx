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
    <Card>
      <CardHeader
        title="Campagnes récentes"
        action={
          <button
            onClick={onNavigateAll}
            className="flex items-center gap-1 text-[12px] text-[#2E8FAD] hover:text-[#1B5E82] transition-colors cursor-pointer"
          >
            Tout voir <ArrowRight size={11} />
          </button>
        }
      />
      <CardBody className="p-0">
        {campaigns.length === 0 ? (
          <EmptyState
            title="Aucune campagne"
            description="Commencez par créer une diffusion"
            icon={<Megaphone size={28} />}
            className="py-12"
          />
        ) : (
          campaigns.map((c) => (
            <div
              key={c.id}
              onClick={() => onNavigateDetail(c.id)}
              className="flex items-center justify-between px-5 py-3 border-b border-[#E5E7EB] last:border-b-0 hover:bg-[#F7F8F9] cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="w-7 h-7 rounded-[7px] bg-[#E8F4F8] flex items-center justify-center shrink-0 text-[#2E8FAD]">
                  <Activity size={13} />
                </div>
                <div className="min-w-0">
                  <p className="text-[13px] font-medium text-[#0D2137] truncate">
                    {c.name}
                  </p>
                  <p className="text-[11.5px] text-[#8BAFC0]">
                    {statusLabel(c.type)} · {fmt(c.successfulSends)} envoyés
                  </p>
                </div>
              </div>
              <Badge variant={c.status === "active" ? "success" : "neutral"} dot>
                {statusLabel(c.status)}
              </Badge>
            </div>
          ))
        )}
      </CardBody>
    </Card>
  );
}
