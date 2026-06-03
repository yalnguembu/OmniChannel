import React from "react";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
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
    <Card className="rounded-md border-[#E5E7EB]">
      <CardHeader
        title="Logs d'activités"
        className="px-8 py-6 border-b border-[#F3F4F6] bg-[#FAFBFC]"
        action={
          <Button
            variant="ghost"
            size="sm"
            onClick={onNavigateAll}
            className="text-[#8BAFC0] font-bold"
          >
            Consulter l'historique complet
          </Button>
        }
      />
      <CardBody className="p-0">
        <div className="overflow-x-auto overflow-y-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[#F7F8F9] border-b border-[#E5E7EB]">
                {["Destinataire", "Canal", "Statut", "Heure"].map((h) => (
                  <th
                    key={h}
                    className="px-8 py-3.5 text-[11px] font-bold text-[#8BAFC0] uppercase tracking-[0.1em]"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F3F4F6]">
              {messages.map((m) => (
                <tr key={m.id} className="hover:bg-[#FAFBFC] transition-colors">
                  <td className="px-8 py-4 text-[13.5px] font-bold text-[#0D2137]">
                    {m.recipientAddress || "—"}
                  </td>
                  <td className="px-8 py-4">
                    <Badge
                      variant="neutral"
                      className="uppercase text-[9.5px] font-bold tracking-widest px-2.5 py-1"
                    >
                      {m.channelCode}
                    </Badge>
                  </td>
                  <td className="px-8 py-4">
                    <Badge
                      variant={m.status === "sent" ? "success" : "neutral"}
                      dot
                      className="font-bold"
                    >
                      {statusLabel(m.status)}
                    </Badge>
                  </td>
                  <td className="px-8 py-4 text-[12px] text-[#8BAFC0] font-medium font-mono lowercase tracking-tight">
                    {formatRelative(m.sentAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardBody>
    </Card>
  );
}
