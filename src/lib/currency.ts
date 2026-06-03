export function formatCurrency(
  amount: number | null | undefined,
  currency: string | null | undefined = 'XAF',
): string {
  if (amount == null) return '—'
  return `${amount.toLocaleString('fr-FR')} ${currency ?? 'XAF'}`
}

export function formatRate(rate: number | undefined): string {
  if (rate == null) return '—'
  return `${rate.toFixed(1)}%`
}
