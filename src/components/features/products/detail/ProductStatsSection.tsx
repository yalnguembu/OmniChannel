import { motion } from "framer-motion";
import {
  Send,
  CheckCircle2,
  XCircle,
  Wallet,
  BarChart3,
  RefreshCw,
  Radio,
  TrendingUp,
} from "lucide-react";
import type { useProductStats } from "@/hooks/useProductStats";
import { fmt, fmtCurrency, cn } from "@/lib/utils";
import { formatDate } from "@/lib/date";
import { staggerContainer, cardItem } from "@/lib/animations";

type StatsVM = ReturnType<typeof useProductStats>;

/** Distinct accent colors for per-channel rows. */
const CHANNEL_COLORS = [
  "#2E8FAD",
  "#7C3AED",
  "#16A34A",
  "#E8541A",
  "#D97706",
  "#1B5E82",
];

/* ── Product-wide metric tile ─────────────────────────────────────────────── */
function MetricTile({
  icon,
  label,
  value,
  sub,
  color,
  bg,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  sub?: React.ReactNode;
  color: string;
  bg: string;
}) {
  return (
    <motion.div
      variants={cardItem}
      className="relative overflow-hidden bg-white border border-[#E5E7EB] rounded-[16px] p-4 shadow-[0_1px_3px_rgba(13,33,55,0.04)]"
    >
      {/* faint corner glow */}
      <div
        className="absolute -right-6 -top-6 w-20 h-20 rounded-full opacity-[0.07] blur-xl"
        style={{ background: color }}
      />
      <div
        className="w-9 h-9 rounded-[11px] flex items-center justify-center mb-3"
        style={{ background: bg, color }}
      >
        {icon}
      </div>
      <p className="text-[24px] font-semibold text-[#0D2137] tracking-tight leading-none tabular-nums">
        {value}
      </p>
      <p className="text-[11.5px] font-medium text-[#8BAFC0] uppercase tracking-[0.05em] mt-2">
        {label}
      </p>
      {sub && <div className="text-[11.5px] mt-1.5">{sub}</div>}
    </motion.div>
  );
}

/* ── Dark hero gauge (delivery rate) ──────────────────────────────────────── */
function HeroGauge({ value }: { value: number }) {
  const size = 132;
  const stroke = 10;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(100, value));
  const offset = c * (1 - pct / 100);
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <linearGradient id="gaugeGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#6AD4B0" />
            <stop offset="100%" stopColor="#5BC0DE" />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="rgba(255,255,255,0.14)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="url(#gaugeGrad)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          className="transition-all duration-700"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[30px] font-bold text-white tabular-nums leading-none">
          {Math.round(pct)}
          <span className="text-[15px] font-semibold text-white/70">%</span>
        </span>
        <span className="text-[10.5px] text-white/60 uppercase tracking-[0.08em] mt-1">
          Livraison
        </span>
      </div>
    </div>
  );
}

function HeroLine({
  label,
  count,
  pct,
  color,
}: {
  label: string;
  count: number;
  pct: number;
  color: string;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="flex items-center gap-1.5 text-[12px] text-white/70">
          <span
            className="w-1.5 h-1.5 rounded-full"
            style={{ background: color }}
          />
          {label}
        </span>
        <span className="text-[12.5px] font-semibold text-white tabular-nums">
          {fmt(count)}
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${Math.max(2, pct)}%`, background: color }}
        />
      </div>
    </div>
  );
}

/* ── Skeleton ─────────────────────────────────────────────────────────────── */
function StatsSkeleton() {
  return (
    <div className="space-y-3.5 animate-pulse">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-[112px] bg-[#F0F2F4] rounded-[16px]" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-3.5">
        <div className="h-[220px] bg-[#F0F2F4] rounded-[16px] lg:col-span-2" />
        <div className="h-[220px] bg-[#F0F2F4] rounded-[16px] lg:col-span-3" />
      </div>
    </div>
  );
}

/* ── Section ──────────────────────────────────────────────────────────────── */
export function ProductStatsSection({ stats }: { stats: StatsVM }) {
  if (stats.isLoading) return <StatsSkeleton />;

  const period =
    stats.periodStart && stats.periodEnd
      ? `${formatDate(stats.periodStart)} – ${formatDate(stats.periodEnd)}`
      : "Toutes périodes";

  const delivered = stats.totalDelivered;
  const sent = stats.totalSent;
  const failed = stats.totalFailed;
  const denom = Math.max(sent, delivered + failed, 1);

  return (
    <motion.section
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className="space-y-3.5"
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-[10px] bg-[#E8F4F8] flex items-center justify-center">
            <BarChart3 size={16} className="text-[#2E8FAD]" />
          </div>
          <div>
            <h2 className="text-[15px] font-semibold text-[#0D2137] tracking-tight">
              Statistiques de messagerie
            </h2>
            <p className="text-[11.5px] text-[#8BAFC0]">{period}</p>
          </div>
        </div>
        <button
          onClick={() => stats.refetch()}
          className="flex items-center gap-1.5 text-[12px] text-[#4A7A94] hover:text-[#0D2137] transition-colors"
        >
          <RefreshCw size={13} /> Actualiser
        </button>
      </div>

      {!stats.hasData ? (
        <div className="bg-white border border-dashed border-[#E5E7EB] rounded-[16px] py-14 text-center">
          <div className="w-12 h-12 rounded-[14px] bg-[#F0F2F4] flex items-center justify-center mx-auto mb-3">
            <BarChart3 size={22} className="text-[#8BAFC0]" />
          </div>
          <p className="text-[13.5px] font-medium text-[#0D2137]">
            Aucune statistique pour l'instant
          </p>
          <p className="text-[12px] text-[#8BAFC0] mt-1">
            Les métriques d'envoi apparaîtront ici dès la première diffusion.
          </p>
        </div>
      ) : (
        <>
          {/* Metric tiles */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
            <MetricTile
              icon={<Send size={17} />}
              label="Envoyés"
              value={fmt(sent)}
              color="#2E8FAD"
              bg="#E8F4F8"
              sub={
                <span className="text-[#8BAFC0]">Total sur la période</span>
              }
            />
            <MetricTile
              icon={<CheckCircle2 size={17} />}
              label="Livrés"
              value={fmt(delivered)}
              color="#16A34A"
              bg="#DCFCE7"
              sub={
                <span className="flex items-center gap-1 text-[#16A34A] font-medium">
                  <TrendingUp size={12} /> {stats.deliveryRate}% du volume
                </span>
              }
            />
            <MetricTile
              icon={<XCircle size={17} />}
              label="Échecs"
              value={fmt(failed)}
              color="#DC2626"
              bg="#FEE2E2"
              sub={
                <span
                  className={cn(
                    "font-medium",
                    stats.failureRate > 5 ? "text-[#DC2626]" : "text-[#8BAFC0]",
                  )}
                >
                  {stats.failureRate}% du volume
                </span>
              }
            />
            <MetricTile
              icon={<Wallet size={17} />}
              label="Coût total"
              value={
                stats.totalCost > 0 ? (
                  <span className="whitespace-nowrap">
                    {fmt(stats.totalCost)}{" "}
                    <span className="text-[13px] font-normal text-[#8BAFC0]">
                      XAF
                    </span>
                  </span>
                ) : (
                  "—"
                )
              }
              color="#7C3AED"
              bg="#EDE9FE"
              sub={<span className="text-[#8BAFC0]">Coût cumulé des envois</span>}
            />
          </div>

          {/* Hero + channels */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-3.5">
            {/* Delivery performance hero */}
            <motion.div
              variants={cardItem}
              className="lg:col-span-2 rounded-[16px] p-5 text-white relative overflow-hidden shadow-[0_8px_28px_rgba(13,33,55,0.18)]"
              style={{
                background:
                  "linear-gradient(135deg,#0D2137 0%,#164863 55%,#1B5E82 100%)",
              }}
            >
              <div className="absolute -right-10 -bottom-10 w-40 h-40 rounded-full bg-white/5 blur-2xl" />
              <p className="text-[11px] font-medium text-white/60 uppercase tracking-[0.08em]">
                Performance de livraison
              </p>
              <div className="flex items-center gap-5 mt-4">
                <HeroGauge value={stats.deliveryRate} />
                <div className="flex-1 space-y-3">
                  <HeroLine
                    label="Envoyés"
                    count={sent}
                    pct={(sent / denom) * 100}
                    color="#5BC0DE"
                  />
                  <HeroLine
                    label="Livrés"
                    count={delivered}
                    pct={(delivered / denom) * 100}
                    color="#6AD4B0"
                  />
                  <HeroLine
                    label="Échecs"
                    count={failed}
                    pct={(failed / denom) * 100}
                    color="#F98A8A"
                  />
                </div>
              </div>
            </motion.div>

            {/* Per-channel breakdown */}
            <motion.div
              variants={cardItem}
              className="lg:col-span-3 bg-white border border-[#E5E7EB] rounded-[16px] p-5 shadow-[0_1px_3px_rgba(13,33,55,0.04)]"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[13px] font-semibold text-[#0D2137]">
                  Répartition par canal
                </h3>
                <span className="text-[11px] text-[#8BAFC0]">
                  {stats.perChannel.length} canal
                  {stats.perChannel.length > 1 ? "aux" : ""}
                </span>
              </div>

              {stats.perChannel.length === 0 ? (
                <div className="py-8 text-center text-[12.5px] text-[#8BAFC0]">
                  Aucun canal avec activité.
                </div>
              ) : (
                <div className="space-y-3.5">
                  {stats.perChannel.slice(0, 5).map((ch, i) => {
                    const color = CHANNEL_COLORS[i % CHANNEL_COLORS.length];
                    return (
                      <div key={ch.channelId}>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="flex items-center gap-2 min-w-0">
                            <span
                              className="w-6 h-6 rounded-[7px] flex items-center justify-center shrink-0"
                              style={{
                                background: `${color}1A`,
                                color,
                              }}
                            >
                              <Radio size={12} />
                            </span>
                            <span className="text-[12.5px] font-medium text-[#0D2137] truncate">
                              {ch.name}
                            </span>
                          </span>
                          <span className="flex items-center gap-3 shrink-0 text-[11.5px]">
                            <span className="text-[#8BAFC0]">
                              {fmt(ch.sent)} env.
                            </span>
                            <span
                              className="font-semibold tabular-nums"
                              style={{ color }}
                            >
                              {ch.deliveryRate}%
                            </span>
                          </span>
                        </div>
                        <div className="h-2 rounded-full bg-[#F0F2F4] overflow-hidden flex">
                          <div
                            className="h-full transition-all duration-700"
                            style={{
                              width: `${ch.deliveryRate}%`,
                              background: color,
                            }}
                          />
                          {ch.sent > 0 && ch.failed > 0 && (
                            <div
                              className="h-full bg-[#F98A8A] transition-all duration-700"
                              style={{
                                width: `${Math.min(
                                  100 - ch.deliveryRate,
                                  (ch.failed / ch.sent) * 100,
                                )}%`,
                              }}
                            />
                          )}
                        </div>
                        <div className="flex items-center gap-4 mt-1 text-[11px] text-[#8BAFC0]">
                          <span className="flex items-center gap-1">
                            <CheckCircle2 size={11} className="text-[#16A34A]" />
                            {fmt(ch.delivered)} livrés
                          </span>
                          <span className="flex items-center gap-1">
                            <XCircle size={11} className="text-[#DC2626]" />
                            {fmt(ch.failed)} échecs
                          </span>
                          {ch.cost > 0 && (
                            <span className="ml-auto">
                              {fmtCurrency(ch.cost)}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          </div>
        </>
      )}
    </motion.section>
  );
}
