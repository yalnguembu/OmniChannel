import { Inbox, ArrowRight } from "lucide-react";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatRelative } from "@/lib/date";
import { statusLabel } from "@/lib/utils";

export function GlobalActivityLog({
  messages,
  onNavigateAll,
}: {
  messages: any[];
  onNavigateAll: () => void;
}) {
  return (
    <Card>
      <CardHeader
        title="Journal d'activité"
        action={
          <button
            onClick={onNavigateAll}
            className="flex items-center gap-1 text-[12px] text-[#2E8FAD] hover:text-[#1B5E82] transition-colors cursor-pointer"
          >
            Historique complet <ArrowRight size={11} />
          </button>
        }
      />
      <CardBody className="p-0">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center py-12 text-[13px] text-[#8BAFC0]">
            <Inbox size={20} className="mr-2.5 opacity-30" />
            Aucune activité récente
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-[#F7F8F9] border-b border-[#E5E7EB]">
                  {["Destinataire", "Canal", "Statut", "Heure"].map((h) => (
                    <th
                      key={h}
                      className="px-5 py-3 text-[10.5px] font-semibold text-[#8BAFC0] uppercase tracking-[0.06em]"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB]">
                {messages.map((m) => (
                  <tr
                    key={m.id}
                    className="hover:bg-[#F7F8F9] transition-colors"
                  >
                    <td className="px-5 py-3 text-[13px] font-medium text-[#0D2137]">
                      {m.recipientAddress || "—"}
                    </td>
                    <td className="px-5 py-3">
                      <Badge
                        variant="neutral"
                        className="uppercase text-[10px] tracking-wider"
                      >
                        {m.channelCode}
                      </Badge>
                    </td>
                    <td className="px-5 py-3">
                      <Badge
                        variant={m.status === "sent" ? "success" : "neutral"}
                        dot
                      >
                        {statusLabel(m.status)}
                      </Badge>
                    </td>
                    <td className="px-5 py-3 text-[12px] text-[#8BAFC0]">
                      {formatRelative(m.sentAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardBody>
    </Card>
  );
}
