import { cn } from '@/lib/utils'
import { formatCurrency } from '@/lib/currency'

interface WalletBalanceChartProps {
  balance: number
  minimum: number
  threshold: number
  currency?: string
}

export function WalletBalanceChart({ balance, minimum, threshold, currency = 'XAF' }: WalletBalanceChartProps) {
  const max = Math.max(balance * 1.5, minimum * 2)
  const balancePct = Math.min(100, (balance / max) * 100)
  const minPct = (minimum / max) * 100
  const thresholdPct = (threshold / max) * 100

  const isLow = balance < threshold
  const isCritical = balance < minimum

  return (
    <div className="space-y-3">
      <div className="flex justify-between text-[12px] mb-1">
        <span className="text-[#8BAFC0]">0 {currency}</span>
        <span className="text-[#8BAFC0]">{formatCurrency(max, currency)}</span>
      </div>
      <div className="relative h-3 bg-[#F0F2F4] rounded-full overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all duration-700', isCritical ? 'bg-[#DC2626]' : isLow ? 'bg-[#D97706]' : 'bg-[#16A34A]')}
          style={{ width: `${balancePct}%` }}
        />
        {/* Threshold marker */}
        <div
          className="absolute top-0 bottom-0 w-px bg-[#D97706]"
          style={{ left: `${thresholdPct}%` }}
          title={`Seuil d'alerte: ${formatCurrency(threshold, currency)}`}
        />
        {/* Minimum marker */}
        <div
          className="absolute top-0 bottom-0 w-px bg-[#DC2626]"
          style={{ left: `${minPct}%` }}
          title={`Minimum: ${formatCurrency(minimum, currency)}`}
        />
      </div>
      <div className="flex justify-between text-[11px]">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#DC2626]" />
          <span className="text-[#8BAFC0]">Minimum: {formatCurrency(minimum, currency)}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#D97706]" />
          <span className="text-[#8BAFC0]">Seuil: {formatCurrency(threshold, currency)}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className={cn('w-2 h-2 rounded-full', isCritical ? 'bg-[#DC2626]' : isLow ? 'bg-[#D97706]' : 'bg-[#16A34A]')} />
          <span className={cn('font-medium', isCritical ? 'text-[#DC2626]' : isLow ? 'text-[#D97706]' : 'text-[#16A34A]')}>
            Solde: {formatCurrency(balance, currency)}
          </span>
        </div>
      </div>
    </div>
  )
}
