'use client'

import { useMemo, useState } from 'react'
import { ChevronRight } from 'lucide-react'
import { useAdvancedActivities } from '@/hooks/use-advanced-activities'
import { isOverdue } from '@/lib/date-utils'
import { ItemDetailSheet } from './item-detail-sheet'
import type { ItemType, UzalaItem } from '@/lib/types'

interface Props {
  filter: 'actividades' | 'pendientes'
}

export function ItemList({ filter }: Props) {
  const [selectedItem, setSelectedItem] = useState<UzalaItem | null>(null)
  const items = useAdvancedActivities((s) => s.items)

  const filtered = useMemo(() => {
    const active = items.filter(
      (item) => item.status !== 'completado' && item.status !== 'omitido'
    )
    if (filter === 'actividades') {
      return active.filter(
        (item) => item.type === 'actividad' || item.type === 'recordatorio'
      )
    }
    return active.filter((item) => item.type === 'pendiente')
  }, [items, filter])

  if (filtered.length === 0) {
    return (
      <section>
        <h2 className="mb-3 px-1 text-lg font-semibold text-foreground">
          {filter === 'actividades' ? 'Actividades' : 'Pendientes'}
        </h2>
        <div className="glass rounded-3xl px-5 py-6 text-center text-sm text-muted-foreground">
          {filter === 'actividades'
            ? 'No tienes actividades pendientes'
            : 'No tienes pendientes'}
        </div>
      </section>
    )
  }

  return (
    <section>
      <h2 className="mb-3 px-1 text-lg font-semibold text-foreground">
        {filter === 'actividades' ? 'Actividades' : 'Pendientes'}
      </h2>
      <div className="glass overflow-hidden rounded-3xl">
        {filtered.map((item, index) => {
          const overdue = isOverdue(item.scheduledDate)
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setSelectedItem(item)}
              className="flex w-full items-center gap-3.5 px-5 py-3.5 text-left transition-colors active:bg-foreground/5"
              style={
                index !== 0
                  ? { borderTop: '1px solid oklch(0.98 0.01 170 / 0.08)' }
                  : undefined
              }
            >
              <span
                className={`size-3 shrink-0 rounded-full ${
                  overdue
                    ? 'bg-destructive'
                    : 'bg-primary'
                }`}
              />
              <span className="flex-1 text-base font-medium text-foreground">
                {item.title}
              </span>
              {item.scheduledDate && (
                <span className="text-base font-medium text-primary">
                  {new Date(item.scheduledDate).toLocaleTimeString('es-MX', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              )}
              <span className="glass flex size-8 items-center justify-center rounded-full">
                <ChevronRight className="size-4 text-foreground/80" strokeWidth={2.2} />
              </span>
            </button>
          )
        })}
      </div>

      <ItemDetailSheet item={selectedItem} onClose={() => setSelectedItem(null)} />
    </section>
  )
}
