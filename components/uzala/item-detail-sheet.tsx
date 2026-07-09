'use client'

import { useState } from 'react'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { useAdvancedActivities } from '@/hooks/use-advanced-activities'
import type { UzalaItem } from '@/lib/types'

interface Props {
  item: UzalaItem | null
  onClose: () => void
}

const TYPE_LABELS: Record<string, string> = {
  actividad: 'Actividad',
  pendiente: 'Pendiente',
  recordatorio: 'Recordatorio',
  habito: 'Hábito',
  por_surtir: 'Por surtir',
  proveedor: 'Proveedor',
  nota: 'Nota',
}

export function ItemDetailSheet({ item, onClose }: Props) {
  const [confirmDelete, setConfirmDelete] = useState(false)
  const completeItem = useAdvancedActivities((s) => s.completeItem)
  const deleteItem = useAdvancedActivities((s) => s.deleteItem)

  if (!item) return null

  const isActive = item.status !== 'completado' && item.status !== 'omitido'

  return (
    <Sheet open={!!item} onOpenChange={(v) => { if (!v) { onClose(); setConfirmDelete(false) } }}>
      <SheetContent side="bottom" className="rounded-t-3xl border-none pb-8">
        <SheetHeader>
          <SheetTitle>{TYPE_LABELS[item.type] ?? 'Elemento'}</SheetTitle>
        </SheetHeader>

        <div className="flex flex-col gap-4 px-4 pt-2">
          <div>
            <h3 className="text-lg font-semibold text-foreground">{item.title}</h3>
            {item.description && (
              <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
            )}
          </div>

          <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-muted-foreground">
            <span>Estado: <span className="text-foreground">{item.status === 'completado' ? 'Completado' : item.status === 'omitido' ? 'Omitido' : 'Pendiente'}</span></span>
            {item.scheduledDate && (
              <span>Programado: <span className="text-foreground">{new Date(item.scheduledDate).toLocaleString('es-MX', { dateStyle: 'short', timeStyle: 'short' })}</span></span>
            )}
            {item.type === 'recordatorio' && 'reminderDateTime' in item && item.reminderDateTime && (
              <span>Recordatorio: <span className="text-foreground">{new Date(item.reminderDateTime).toLocaleString('es-MX', { dateStyle: 'short', timeStyle: 'short' })}</span></span>
            )}
            {item.type === 'habito' && 'repeatDays' in item && (
              <span>Días: <span className="text-foreground">{item.repeatDays.map((d: number) => ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa'][d]).join(' ')}</span></span>
            )}
            {item.type === 'por_surtir' && 'quantity' in item && item.quantity && (
              <span>Cantidad: <span className="text-foreground">{item.quantity} {('unit' in item && item.unit) || ''}</span></span>
            )}
            {item.type === 'proveedor' && 'phone' in item && (
              <span>Tel: <span className="text-foreground">{item.phone}</span></span>
            )}
          </div>

          {confirmDelete ? (
            <div className="glass rounded-3xl p-4 text-center">
              <p className="text-sm font-semibold text-foreground">¿Eliminar este elemento?</p>
              <p className="mt-1 text-xs text-muted-foreground">Esta acción no se puede deshacer.</p>
              <div className="mt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setConfirmDelete(false)}
                  className="flex-1 rounded-full border border-foreground/20 py-2.5 text-sm font-semibold text-foreground transition-transform active:scale-[0.98]"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => { deleteItem(item.id); onClose() }}
                  className="flex-1 rounded-full bg-destructive py-2.5 text-sm font-semibold text-white transition-transform active:scale-[0.98]"
                >
                  Eliminar
                </button>
              </div>
            </div>
          ) : (
            <div className="flex gap-3">
              {isActive && (
                <button
                  type="button"
                  onClick={() => completeItem(item.id)}
                  className="flex-1 rounded-full bg-status-success py-3 text-sm font-semibold text-white transition-transform active:scale-[0.98]"
                >
                  Marcar completado
                </button>
              )}
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                className="flex-1 rounded-full border border-destructive/40 py-3 text-sm font-semibold text-destructive transition-transform active:scale-[0.98]"
              >
                Eliminar
              </button>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
