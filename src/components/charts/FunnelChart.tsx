import { useMemo } from "react";
import { cn, fmt } from "@/lib/utils";

export interface FunnelStage {
  label: string;
  count: number;
  /** Small caption under the label (e.g. conversion, avg time). */
  hint?: string;
}

interface FunnelChartProps {
  stages: FunnelStage[];
  /** Optional floating callout (e.g. overall conversion / delivery rate). */
  conversion?: { value: number; label?: string; sublabel?: string };
  /** Height of the graphic area (footers render below). */
  height?: number;
  className?: string;
}

/* App-palette ramp (dark teal → light blue), interpolated for any stage count. */
const RAMP_FROM = [27, 94, 130]; // #1B5E82
const RAMP_TO = [138, 200, 229]; // #8AC8E5
function rampColor(i: number, n: number): string {
  if (n <= 1) return "rgb(46,143,173)"; // #2E8FAD
  const t = i / (n - 1);
  const c = RAMP_FROM.map((f, j) => Math.round(f + (RAMP_TO[j] - f) * t));
  return `rgb(${c[0]},${c[1]},${c[2]})`;
}

const VW = 1000; // viewBox width
const TOP_PAD = 14;
const GAP = 10;

export function FunnelChart({
  stages,
  conversion,
  height = 220,
  className,
}: FunnelChartProps) {
  const n = stages.length;
  const colors = useMemo(() => stages.map((_, i) => rampColor(i, n)), [n]);

  const { bands } = useMemo(() => {
    const counts = stages.map((s) => Math.max(0, s.count ?? 0));
    const max = Math.max(...counts, 1);
    const colW = VW / Math.max(1, n);
    const yFor = (c: number) => TOP_PAD + (1 - c / max) * (height - TOP_PAD);

    const bands = counts.map((c, i) => {
      const x0 = i * colW + GAP / 2;
      const x1 = (i + 1) * colW - GAP / 2;
      const yL = yFor(c);
      const yR = yFor(counts[i + 1] ?? c); // continue toward the next stage
      const cx = (x1 - x0) * 0.5;
      const d =
        `M${x0},${height} L${x0},${yL} ` +
        `C${x0 + cx},${yL} ${x1 - cx},${yR} ${x1},${yR} ` +
        `L${x1},${height} Z`;
      return { d, color: colors[i] };
    });
    return { bands };
  }, [stages, n, height, colors]);

  if (n === 0) return null;

  // Below ~4 stages the footers fit any width; beyond that, give each stage a
  // legible floor and let the whole graphic scroll horizontally on mobile
  // (SVG + footers share the same min-width so they stay aligned).
  const minWidth = n > 3 ? `${n * 96}px` : undefined;

  return (
    <div className={cn("relative", className)}>
      <div className="overflow-x-auto [&::-webkit-scrollbar]:hidden">
        <div style={{ minWidth }}>
          <svg
            viewBox={`0 0 ${VW} ${height}`}
            preserveAspectRatio="none"
            width="100%"
            height={height}
            className="block"
          >
            <defs>
              {bands.map((b, i) => (
                <linearGradient key={i} id={`fc-grad-${i}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={b.color} stopOpacity={0.95} />
                  <stop offset="100%" stopColor={b.color} stopOpacity={0.6} />
                </linearGradient>
              ))}
            </defs>
            {bands.map((b, i) => (
              <path key={i} d={b.d} fill={`url(#fc-grad-${i})`} />
            ))}
          </svg>

          {/* Stage footers */}
          <div className="flex border-t border-[#E5E7EB]">
            {stages.map((s, i) => (
              <div
                key={i}
                className="flex-1 min-w-0 border-l-[3px] pl-2.5 pr-2 pt-2.5 sm:pl-3"
                style={{ borderColor: colors[i] }}
              >
                <p
                  className="text-[20px] sm:text-[24px] font-bold leading-none tabular-nums"
                  style={{ color: colors[i] }}
                >
                  {fmt(s.count)}
                </p>
                <p className="mt-1.5 text-[12px] sm:text-[12.5px] font-semibold text-[#0D2137] truncate">
                  {s.label}
                </p>
                {s.hint && (
                  <p className="text-[11px] italic text-[#8BAFC0] truncate">
                    {s.hint}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Conversion callout — kept out of the scroll area so it stays pinned */}
      {conversion && (
        <div className="absolute top-2 right-2 sm:top-3 sm:right-3 max-w-[45%] rounded-[14px] border border-[#E5E7EB] bg-white/95 px-3 py-2 sm:px-4 sm:py-3 shadow-[0_10px_30px_rgba(30,60,90,0.08)] backdrop-blur-sm">
          <p
            className="text-[22px] sm:text-[26px] font-bold leading-none"
            style={{ color: colors[n - 1] }}
          >
            {Math.round(conversion.value)}
            <span className="text-[14px] sm:text-[15px] font-semibold">%</span>
          </p>
          <p className="mt-1 text-[11.5px] sm:text-[12px] font-medium text-[#0D2137] leading-tight">
            {conversion.label ?? "Taux de conversion"}
          </p>
          {conversion.sublabel && (
            <p className="text-[11px] italic text-[#8BAFC0] leading-tight">
              {conversion.sublabel}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
