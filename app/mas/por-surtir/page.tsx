'use client'

import { useState } from 'react'
import { useAdvancedActivities } from '@/hooks/use-advanced-activities'
import { useStoreSnapshot } from '@/hooks/use-store-snapshot'
import { isOverdue } from '@/lib/date-utils'
import { RestockForm } from '@/components/uzala/forms/restock-form'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { ChevronRight } from 'lucide-react'
import type { RestockItem, UzalaItem } from '@/lib/types'

export default function PorSurtirPage() {
  const [showForm, setShowForm] = useState(false)
  const [editItem, setEditItem] = useState<RestockItem | null>(null)
  const items = useAdvancedActivities((s) => s.items)
  const completeItem = useAdvancedActivities((s) => s.completeItem)

  const restockItems = useStoreSnapshot(() =>
    items.filter((item): item is RestockItem =>
      item.type === 'por_surtir'
    )
  )

  const active = restockItems.filter(
    (item) => item.status !== 'completado' && item.status !== 'omitido'
  )
  const completed = restockItems.filter(
    (item) => item.status === 'completado'
  )

  return (
    <main className="uzala-bg relative min-h-screen">
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col gap-4 px-5 pb-28 pt-[max(env(safe-area-inset-top),1.25rem)]">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-foreground">Por surtir</h1>
          <button
            type="button"
            onClick={() => { setEditItem(null); setShowForm(true) }}
            className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground transition-transform active:scale-[0.98]"
          >
            + Nuevo
          </button>
        </div>

        {active.length === 0 ? (
          <div className="glass rounded-3xl px-5 py-6 text-center text-sm text-muted-foreground">
            No tienes nada pendiente por surtir
          </div>
        ) : (
          <div className="glass overflow-hidden rounded-3xl">
            {active.map((item, index) => {
              const overdue = item.dueDate ? isOverdue(item.dueDate) : false
              return (
                <div
                  key={item.id}
                  className="flex items-center gap-3 px-5 py-3.5"
                  style={
                    index !== 0
                      ? { borderTop: '1px solid oklch(0.98 0.01 170 / 0.08)' }
                      : undefined
                  }
                >
                  <button
                    type="button"
                    onClick={() => completeItem(item.id)}
                    className={`flex size-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                      item.status === 'completado'
                        ? 'border-status-success bg-status-success'
                        : 'border-foreground/30'
                    }`}
                  />
                  <div
                    className="flex flex-1 flex-col cursor-pointer"
                    onClick={() => { setEditItem(item); setShowForm(true) }}
                  >
                    <span className={`text-base font-medium ${overdue ? 'text-destructive' : 'text-foreground'}`}>
                      {item.title}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {item.quantity && `${item.quantity}${item.unit ? ` ${item.unit}` : ''}`}
                      {item.dueDate && ` · ${new Date(item.dueDate).toLocaleDateString('es-MX')}`}
                    </span>
                  </div>
                  <ChevronRight className="size-4 text-foreground/40" />
                </div>
              )
            })}
          </div>
        )}

        {completed.length > 0 && (
          <>
            <h2 className="px-1 text-sm font-semibold text-muted-foreground">Surtidos</h2>
            <div className="glass rounded-3xl">
              {completed.map((item, index) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 px-5 py-3"
                  style={
                    index !== 0
                      ? { borderTop: '1px solid oklch(0.98 0.01 170 / 0.08)' }
                      : undefined
                  }
                >
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full border-2 border-status-success bg-status-success text-[10px] text-white">
                    ✓
                  </span>
                  <span className="flex-1 text-sm text-muted-foreground line-through">
                    {item.title}
                  </span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <Sheet open={showForm} onOpenChange={(v) => { setShowForm(v); if (!v) setEditItem(null) }}>
        <SheetContent side="bottom" className="rounded-t-3xl border-none pb-8">
          <SheetHeader>
            <SheetTitle>{editItem ? 'Editar' : 'Nuevo producto'}</SheetTitle>
          </SheetHeader>
          <RestockForm onSuccess={() => { setShowForm(false); setEditItem(null) }} editItem={editItem ?? undefined} />
        </SheetContent>
      </Sheet>
    </main>
  )
}
