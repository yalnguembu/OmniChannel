import { motion } from 'framer-motion'
import { KPICard } from '@/components/feedback/KPICard'
import { staggerContainer, cardItem } from '@/lib/animations'

interface ContactKPIsProps {
  total: number
  activeCount: number
  inactiveCount: number
  blockedCount: number
}

export function ContactKPIs({ total, activeCount, inactiveCount, blockedCount }: ContactKPIsProps) {
  const kpis = [
    { label: 'Total contacts', value: total.toLocaleString('fr'), trend: 'up' as const, trendLabel: 'chargement...' },
    { label: 'Actifs', value: activeCount.toLocaleString('fr'), trend: 'neutral' as const, trendLabel: 'contacts actifs' },
    { label: 'Inactifs', value: inactiveCount.toLocaleString('fr'), trend: 'down' as const, trendLabel: 'À réactiver' },
    { label: 'Bloqués', value: blockedCount.toLocaleString('fr'), trend: 'neutral' as const, trendLabel: 'en blocklist' },
  ]

  return (
    <motion.div variants={staggerContainer} initial="initial" animate="animate" className="grid grid-cols-4 gap-4 mb-5">
      {kpis.map((kpi, i) => (
        <motion.div key={i} variants={cardItem}>
          <KPICard {...kpi} />
        </motion.div>
      ))}
    </motion.div>
  )
}
