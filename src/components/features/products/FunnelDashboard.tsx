import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getApiFunnelReportsByFunnelIdOptions } from "@/shared/api/generated/@tanstack/react-query.gen";
import type { FunnelReport } from "@/shared/api/generated/types.gen";

interface FunnelDashboardProps {
  funnelId?: string;
}

export function FunnelDashboard({ funnelId }: FunnelDashboardProps) {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const { data, isLoading } = useQuery({
    ...getApiFunnelReportsByFunnelIdOptions({
      path: { funnelId: funnelId ?? "" },
      query: {
        from: from || undefined,
        to: to || undefined,
      },
    }),
    enabled: !!funnelId,
    select: (res) => res?.data as FunnelReport | undefined,
  });

  const steps = data?.steps ?? [];
  const maxCount = useMemo(() => Math.max(...steps.map((s) => s.count ?? 0), 1), [steps]);

  if (!funnelId) {
    return null;
  }

  return (
    <div className="rounded-xl border border-[#E5E7EB] bg-white p-4">
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h3 className="text-[14px] font-semibold text-[#0D2137]">
            Tableau de bord du tunnel
          </h3>
          <p className="text-[12px] text-[#8BAFC0]">
            {data?.name ?? "Rapports de conversion"}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-[11px] text-[#4A7A94]">
            Du
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="ml-2 rounded-md border border-[#E5E7EB] px-2 py-1 text-[12px]"
            />
          </label>
          <label className="text-[11px] text-[#4A7A94]">
            Au
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="ml-2 rounded-md border border-[#E5E7EB] px-2 py-1 text-[12px]"
            />
          </label>
        </div>
      </div>

      {isLoading ? (
        <div className="py-8 text-center text-[12px] text-[#8BAFC0]">Chargement du rapport…</div>
      ) : steps.length === 0 ? (
        <div className="rounded-lg border border-dashed border-[#E5E7EB] px-4 py-10 text-center text-[12px] text-[#8BAFC0]">
          Aucun rapport disponible pour ce tunnel.
        </div>
      ) : (
        <div className="space-y-3">
          {steps.map((step, index) => {
            const count = step.count ?? 0;
            const width = Math.max(12, (count / maxCount) * 100);
            const conversion = step.conversionFromPreviousPct ?? 0;

            return (
              <div key={`${step.eventDefinitionId ?? "step"}-${index}`} className="rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] p-3">
                <div className="mb-2 flex items-center justify-between gap-3">
                  <div>
                    <span className="text-[11px] font-semibold text-[#4A7A94]">
                      Étape {index + 1}
                    </span>
                    <div className="text-[13px] font-medium text-[#0D2137]">
                      {step.label ?? step.eventCode ?? "Étape"}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="block text-[12px] font-semibold text-[#0D2137]">
                      {count}
                    </span>
                    <span className="text-[11px] text-[#8BAFC0]">
                      {conversion.toFixed(1)}% de conversion
                    </span>
                  </div>
                </div>

                <div className="h-2 rounded-full bg-[#E5E7EB]">
                  <div
                    className="h-2 rounded-full bg-[#2E8FAD]"
                    style={{ width: `${width}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
