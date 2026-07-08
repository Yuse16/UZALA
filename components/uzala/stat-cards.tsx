'use client'

import { Calendar, Zap } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { getToday, getUrgent } from '@/hooks/use-advanced-activities'
import { useStoreSnapshot } from '@/hooks/use-store-snapshot'

function StatCard({
  icon: Icon,
  title,
  value,
  unit,
  note,
}: {
  icon: LucideIcon
  title: string
  value: string
  unit: string
  note: string
}) {
  return (
    <div className="glass flex-1 rounded-3xl p-4">
      <div className="flex items-center gap-3">
        <span className="flex size-11 items-center justify-center rounded-full bg-primary/15">
          <Icon className="size-5 text-primary" strokeWidth={2} />
        </span>
        <span className="text-lg font-semibold text-foreground">{title}</span>
      </div>
      <div className="mt-4 flex items-baseline gap-1.5">
        <span className="text-3xl font-bold text-foreground">{value}</span>
        <span className="text-base text-muted-foreground">{unit}</span>
      </div>
      <p className="mt-1 text-sm text-primary">{note}</p>
    </div>
  )
}

export function StatCards() {
  const todayCount = useStoreSnapshot(() => getToday().length)
  const urgentCount = useStoreSnapshot(() => getUrgent().length)

  return (
    <section className="flex gap-4">
      <StatCard
        icon={Calendar}
        title="Hoy"
        value={String(todayCount)}
        unit="tareas"
        note="prioridad"
      />
      <StatCard
        icon={Zap}
        title="Urgentes"
        value={String(urgentCount)}
        unit="pendientes"
        note="revisar"
      />
    </section>
  )
}
