'use client'

import { useMemo } from 'react'
import { ChevronRight } from 'lucide-react'
import { useAdvancedActivities, getUpcoming } from '@/hooks/use-advanced-activities'

export function UpcomingList() {
  const storeItems = useAdvancedActivities((s) => s.items)
  const items = useMemo(() => getUpcoming(3), [storeItems])

  return (
    <section>
      <h2 className="mb-3 px-1 text-lg font-semibold text-foreground">
        Pendientes próximos
      </h2>
      {items.length === 0 ? (
        <div className="glass rounded-3xl px-5 py-6 text-center text-sm text-muted-foreground">
          No tienes nada programado por ahora
        </div>
      ) : (
        <div className="glass overflow-hidden rounded-3xl">
          {items.map((item, index) => (
            <button
              key={item.id}
              type="button"
              className="flex w-full items-center gap-3.5 px-5 py-3.5 text-left transition-colors active:bg-foreground/5"
              style={
                index !== 0
                  ? { borderTop: '1px solid oklch(0.98 0.01 170 / 0.08)' }
                  : undefined
              }
            >
              <span className="size-3 shrink-0 rounded-full bg-primary" />
              <span className="flex-1 text-base font-medium text-foreground">
                {item.title}
              </span>
              <span className="text-base font-medium text-primary">
                {item.scheduledDate
                  ? new Date(item.scheduledDate).toLocaleTimeString('es-MX', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  : ''}
              </span>
              <span className="glass flex size-8 items-center justify-center rounded-full">
                <ChevronRight className="size-4 text-foreground/80" strokeWidth={2.2} />
              </span>
            </button>
          ))}
        </div>
      )}
    </section>
  )
}
