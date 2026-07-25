import { useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import { cn, fmt } from "@/lib/utils";

export interface FunnelStage {
  label: string;
  count: number;
  /** Small caption under the label (e.g. conversion, avg time). */
  hint?: string;
}

/**
 * A quantity that *leaves* the funnel (failures, bounces, churn) rather than a
 * narrowed subset of it. Drawn as an arrow peeling off the funnel's upper edge
 * and descending out of it — never as a band: on the bands' shared linear scale
 * a small loss collapses into an invisible sliver, and a large one would slope
 * the funnel back outward and read as growth.
 */
export interface FunnelLeak {
  count: number;
  label: string;
  /** Index of the stage the loss escapes *after* (the arrow leaves at its right edge). */
  afterIndex?: number;
  color?: string;
}

interface FunnelChartProps {
  stages: FunnelStage[];
  /** Optional floating callout (e.g. overall conversion / delivery rate). */
  conversion?: { value: number; label?: string; sublabel?: string };
  /** Optional loss arrow branching out of the funnel. */
  leak?: FunnelLeak;
  /** Height of the graphic area (footers render below). */
  height?: number;
  className?: string;
}

/**
 * A `<defs>` id unique to this component instance. SVG defs share one
 * document-wide id namespace, so a fixed id makes every chart on the page
 * resolve to the first one's definitions. React's `useId` returns a value
 * containing colons (`:r0:`); they are stripped so the result drops into an id
 * and a `url(#…)` reference without any escaping question.
 */
function useSvgId(prefix: string): string {
  return `${prefix}-${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
}

/**
 * The loss arrow, drawn in an unscaled pixel overlay so its arrowhead keeps its
 * proportions (the bands' viewBox stretches x only). It starts on the funnel's
 * upper edge, curves down out of the flow, and ends in the strip below with the
 * count beside it.
 */
function LeakArrow({
  leak,
  anchor,
  boxW,
  bandsHeight,
}: {
  leak: FunnelLeak;
  anchor: { x: number; y: number };
  boxW: number;
  bandsHeight: number;
}) {
  const color = leak.color ?? "#DC2626";
  const markerId = useSvgId("fc-leak-arrow");
  // x needs the viewBox → pixel conversion; y already renders 1:1.
  const x0 = (anchor.x / VW) * boxW;
  const y0 = anchor.y;
  const yEnd = bandsHeight + LEAK_STRIP - 18;
  // Descend to the right, kept inside the box so the head never clips out.
  const xEnd = Math.min(x0 + 30, boxW - 6);
  const curve =
    `M${x0},${y0} C${x0 + 2},${y0 + (yEnd - y0) * 0.55}` +
    ` ${xEnd - 2},${y0 + (yEnd - y0) * 0.5} ${xEnd},${yEnd}`;

  return (
    <svg
      className="pointer-events-none absolute left-0 top-0 overflow-visible"
      width={boxW}
      height={bandsHeight + LEAK_STRIP}
    >
      <defs>
        {/* `orient="auto"` rotates the marker onto the path tangent, so the head
            is drawn pointing along +x with refX at its tip — the rotation then
            aims it down the descent. Drawing it pointing down instead would end
            up rotated sideways. */}
        <marker
          id={markerId}
          markerWidth="9"
          markerHeight="9"
          refX="8"
          refY="4"
          orient="auto"
          markerUnits="userSpaceOnUse"
        >
          <path d="M0,0 L8,4 L0,8 Z" fill={color} />
        </marker>
      </defs>
      {/* The arrow crosses the bands on its way out, so a white halo underneath
          keeps it legible whatever colour it passes over. */}
      <path d={curve} fill="none" stroke="#FFFFFF" strokeWidth={5} strokeOpacity={0.85} />
      {/* Anchor pip on the funnel edge, so the arrow reads as branching off it */}
      <circle cx={x0} cy={y0} r={3.5} fill={color} stroke="#FFFFFF" strokeWidth={1.5} />
      <path
        d={curve}
        fill="none"
        stroke={color}
        strokeWidth={2}
        markerEnd={`url(#${markerId})`}
      />
      <text
        x={xEnd + 9}
        y={yEnd + 2}
        fill={color}
        className="text-[12px] font-semibold"
        dominantBaseline="middle"
      >
        {fmt(leak.count)}
      </text>
      <text
        x={xEnd + 9}
        y={yEnd + 15}
        fill="#8BAFC0"
        className="text-[10.5px]"
        dominantBaseline="middle"
      >
        {leak.label}
      </text>
    </svg>
  );
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
/** Strip reserved below the bands for the leak arrow to descend into. */
const LEAK_STRIP = 40;

export function FunnelChart({
  stages,
  conversion,
  leak,
  height = 220,
  className,
}: FunnelChartProps) {
  const n = stages.length;
  const colors = useMemo(() => stages.map((_, i) => rampColor(i, n)), [n]);
  // Per-instance gradient ids — a fixed `fc-grad-${i}` made every chart on the
  // page paint with the FIRST chart's gradients, worse still when the stage
  // counts differ (a missing id leaves the band unfilled).
  const gradPrefix = useSvgId("fc-grad");

  // Where the leak arrow leaves the funnel, in viewBox units. Anchored on the
  // funnel's upper edge at the boundary right after `afterIndex`, so the arrow
  // visibly peels off the flow instead of floating in the plot area.
  const { bands, leakAnchor } = useMemo(() => {
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

    let leakAnchor: { x: number; y: number } | null = null;
    if (leak && leak.count > 0) {
      const i = Math.min(Math.max(leak.afterIndex ?? 0, 0), n - 1);
      leakAnchor = {
        x: (i + 1) * colW - GAP / 2,
        y: yFor(counts[i + 1] ?? counts[i]),
      };
    }
    return { bands, leakAnchor };
  }, [stages, n, height, colors, leak]);

  // The bands' viewBox is stretched horizontally (`preserveAspectRatio="none"`,
  // `width="100%"`) while its height renders 1:1 — so an arrowhead drawn in that
  // space would come out squashed. The leak arrow therefore lives in its own
  // overlay sized in real pixels; only x needs converting, via this measured width.
  const plotRef = useRef<HTMLDivElement>(null);
  const [boxW, setBoxW] = useState(0);
  useLayoutEffect(() => {
    const el = plotRef.current;
    if (!el) return;
    const measure = () =>
      setBoxW((prev) => (prev === el.clientWidth ? prev : el.clientWidth));
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  if (n === 0) return null;

  // Below ~4 stages the footers fit any width; beyond that, give each stage a
  // legible floor and let the whole graphic scroll horizontally on mobile
  // (SVG + footers share the same min-width so they stay aligned).
  const minWidth = n > 3 ? `${n * 96}px` : undefined;

  return (
    <div className={cn("relative", className)}>
      <div className="overflow-x-auto [&::-webkit-scrollbar]:hidden">
        <div style={{ minWidth }}>
          <div ref={plotRef} className="relative">
            <svg
              viewBox={`0 0 ${VW} ${height}`}
              preserveAspectRatio="none"
              width="100%"
              height={height}
              className="block"
            >
              <defs>
                {bands.map((b, i) => (
                  <linearGradient key={i} id={`${gradPrefix}-${i}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={b.color} stopOpacity={0.95} />
                    <stop offset="100%" stopColor={b.color} stopOpacity={0.6} />
                  </linearGradient>
                ))}
              </defs>
              {bands.map((b, i) => (
                <path key={i} d={b.d} fill={`url(#${gradPrefix}-${i})`} />
              ))}
            </svg>

            {/* Room for the leak arrow to descend below the bands */}
            {leakAnchor && <div style={{ height: LEAK_STRIP }} />}

            {leakAnchor && leak && boxW > 0 && (
              <LeakArrow
                leak={leak}
                anchor={leakAnchor}
                boxW={boxW}
                bandsHeight={height}
              />
            )}
          </div>

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
