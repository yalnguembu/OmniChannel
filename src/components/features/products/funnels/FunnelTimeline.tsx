import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getApiFunnelReportsByFunnelIdOptions } from "@/shared/api/generated/@tanstack/react-query.gen";
import type { FunnelReport } from "@/shared/api/generated/types.gen";
import { FunnelChart, type FunnelStage } from "@/components/charts/FunnelChart";

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

  const stages: FunnelStage[] = steps.map((step, index) => ({
    label: step.label ?? step.eventCode ?? `Étape ${index + 1}`,
    count: step.count ?? 0,
    hint:
      index === 0
        ? "Point de départ"
        : `${Math.round(step.conversionFromPreviousPct ?? 0)}% depuis l'étape préc.`,
  }));

  const lastStep = steps[steps.length - 1];
  const conversion =
    steps.length > 1
      ? {
          value: lastStep?.conversionFromStartPct ?? 0,
          label: "Taux de conversion",
          sublabel: "du début à la fin",
        }
      : undefined;

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
        <FunnelChart stages={stages} conversion={conversion} />
      )}
    </div>
  );
}
