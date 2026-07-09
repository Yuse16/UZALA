'use client'

import { useMemo, useState } from 'react'
import { useAdvancedActivities, getHistory } from '@/hooks/use-advanced-activities'
import { isOverdue } from '@/lib/date-utils'
import { ChevronRight } from 'lucide-react'
import { ItemDetailSheet } from '@/components/uzala/item-detail-sheet'
import type { UzalaItem } from '@/lib/types'

export default function HistorialPage() {
  const [selectedItem, setSelectedItem] = useState<UzalaItem | null>(null)
  const storeItems = useAdvancedActivities((s) => s.items)
  const items = useMemo(() => getHistory(), [storeItems])

  return (
    <main className="uzala-bg relative min-h-screen">
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col gap-4 px-5 pt-[max(env(safe-area-inset-top),1.25rem)]" style={{ paddingBottom: 'calc(7rem + env(safe-area-inset-bottom))' }}>
        <h1 className="text-xl font-semibold text-foreground">Historial</h1>

        {items.length === 0 ? (
          <div className="glass rounded-3xl px-5 py-6 text-center text-sm text-muted-foreground">
            No hay elementos en el historial
          </div>
        ) : (
          <div className="glass overflow-hidden rounded-3xl">
            {items.map((item, index) => {
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
                      item.status === 'completado'
                        ? 'bg-status-success'
                        : overdue
                        ? 'bg-destructive'
                        : item.status === 'omitido'
                        ? 'bg-muted-foreground'
                        : 'bg-primary'
                    }`}
                  />
                  <div className="flex flex-1 flex-col">
                    <span className="text-base font-medium text-foreground">
                      {item.title}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {item.status === 'completado'
                        ? `Completado ${item.completedAt ? new Date(item.completedAt).toLocaleDateString('es-MX') : ''}`
                        : item.status === 'omitido'
                        ? 'Omitido'
                        : overdue
                        ? 'Vencido'
                        : 'Pendiente'}
                    </span>
                  </div>
                  <span className="glass flex size-8 items-center justify-center rounded-full">
                    <ChevronRight className="size-4 text-foreground/80" strokeWidth={2.2} />
                  </span>
                </button>
              )
            })}
          </div>
        )}
      </div>

      <ItemDetailSheet item={selectedItem} onClose={() => setSelectedItem(null)} />
    </main>
  )
}
