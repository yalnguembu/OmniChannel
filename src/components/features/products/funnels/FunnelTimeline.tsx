import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getApiFunnelReportsByFunnelIdOptions } from "@/shared/api/generated/@tanstack/react-query.gen";
import type { FunnelReport } from "@/shared/api/generated/types.gen";
import { CircularGauge } from "@/components/charts/CircularGauge";
import { fmt } from "@/lib/utils";

interface FunnelTimelineProps {
  funnelId?: string;
}

export function FunnelTimeline({ funnelId }: FunnelTimelineProps) {
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

  if (!funnelId) return null;

  return (
    <div>
      <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <p className="text-[12px] text-[#8BAFC0]">
          {data?.name ?? "Rapport de conversion"}
        </p>
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
        <div className="py-8 text-center text-[12px] text-[#8BAFC0]">
          Chargement du rapport…
        </div>
      ) : steps.length === 0 ? (
        <div className="rounded-lg border border-dashed border-[#E5E7EB] px-4 py-10 text-center text-[12px] text-[#8BAFC0]">
          Aucun rapport disponible pour ce tunnel.
        </div>
      ) : (
        <div className="overflow-x-auto pb-2">
          <div className="flex items-start min-w-fit px-2">
            {steps.map((step, index) => {
              const count = step.count ?? 0;
              const conversion = index === 0 ? 100 : (step.conversionFromPreviousPct ?? 0);

              return (
                <div key={`${step.eventDefinitionId ?? "step"}-${index}`} className="flex items-start">
                  <div className="flex flex-col items-center w-[130px] shrink-0">
                    <span className="text-[10.5px] font-semibold uppercase tracking-[0.06em] text-[#8BAFC0] mb-2">
                      Étape {index + 1}
                    </span>
                    <CircularGauge value={conversion} size={72} strokeWidth={7} />
                    <p className="mt-2 text-[12.5px] font-medium text-[#0D2137] text-center truncate max-w-[120px]">
                      {step.label ?? step.eventCode ?? "Étape"}
                    </p>
                    <p className="text-[11px] text-[#8BAFC0] tabular-nums">{fmt(count)} contacts</p>
                  </div>

                  {index < steps.length - 1 && (
                    <div className="h-[72px] w-[36px] flex items-center shrink-0">
                      <div className="h-0.5 w-full bg-[#E5E7EB]" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
