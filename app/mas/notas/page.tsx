'use client'

import { useState, useMemo } from 'react'
import { useAdvancedActivities } from '@/hooks/use-advanced-activities'
import { NoteForm } from '@/components/uzala/forms/note-form'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Trash2 } from 'lucide-react'
import type { Note } from '@/lib/types'

export default function NotasPage() {
  const [showForm, setShowForm] = useState(false)
  const [editItem, setEditItem] = useState<Note | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const items = useAdvancedActivities((s) => s.items)
  const completeItem = useAdvancedActivities((s) => s.completeItem)
  const deleteItem = useAdvancedActivities((s) => s.deleteItem)

  const notes = useMemo(
    () => items.filter((item): item is Note => item.type === 'nota'),
    [items]
  )

  const active = notes.filter(
    (item) => item.status !== 'completado' && item.status !== 'omitido'
  )
  const completed = notes.filter((item) => item.status === 'completado')

  return (
    <main className="uzala-bg relative min-h-screen">
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col gap-4 px-5 pt-[max(env(safe-area-inset-top),1.25rem)]" style={{ paddingBottom: 'calc(7rem + env(safe-area-inset-bottom))' }}>
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-foreground">Notas</h1>
          <button
            type="button"
            onClick={() => { setEditItem(null); setShowForm(true) }}
            className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground transition-transform active:scale-[0.98]"
          >
            + Nueva
          </button>
        </div>

        {active.length === 0 ? (
          <div className="glass rounded-3xl px-5 py-6 text-center text-sm text-muted-foreground">
            No tienes notas todavía
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {active.map((note) => (
              <div key={note.id} className="glass rounded-3xl p-4">
                <div className="flex items-start justify-between gap-3">
                  <div
                    className="flex-1 cursor-pointer"
                    onClick={() => { setEditItem(note); setShowForm(true) }}
                  >
                    <h3 className="text-base font-semibold text-foreground">{note.title}</h3>
                    {note.body && note.body !== note.title && (
                      <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                        {note.body}
                      </p>
                    )}
                    <p className="mt-2 text-xs text-muted-foreground">
                      {new Date(note.createdAt).toLocaleDateString('es-MX', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setConfirmDeleteId(note.id)}
                      className="flex size-6 items-center justify-center rounded-full text-foreground/30 transition-colors hover:text-destructive"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => completeItem(note.id)}
                      className="flex size-6 shrink-0 items-center justify-center rounded-full border-2 border-foreground/30 transition-colors hover:border-status-success"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {completed.length > 0 && (
          <>
            <h2 className="px-1 text-sm font-semibold text-muted-foreground">
              Completadas ({completed.length})
            </h2>
            <div className="glass rounded-3xl">
              {completed.map((note, index) => (
                <div
                  key={note.id}
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
                    {note.title}
                  </span>
                  <button
                    type="button"
                    onClick={() => setConfirmDeleteId(note.id)}
                    className="flex size-6 shrink-0 items-center justify-center rounded-full text-foreground/30 transition-colors hover:text-destructive"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <Sheet open={showForm} onOpenChange={(v) => { setShowForm(v); if (!v) setEditItem(null) }}>
        <SheetContent side="bottom" className="rounded-t-3xl border-none pb-8">
          <SheetHeader>
            <SheetTitle>{editItem ? 'Editar nota' : 'Nueva nota'}</SheetTitle>
          </SheetHeader>
          <NoteForm onSuccess={() => { setShowForm(false); setEditItem(null) }} editItem={editItem ?? undefined} />
        </SheetContent>
      </Sheet>

      {confirmDeleteId && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/40 px-5 pb-20">
          <div className="glass w-full max-w-md rounded-3xl p-6 text-center">
            <p className="text-base font-semibold text-foreground">¿Eliminar nota?</p>
            <p className="mt-1 text-sm text-muted-foreground">Esta acción no se puede deshacer.</p>
            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={() => setConfirmDeleteId(null)}
                className="flex-1 rounded-full border border-foreground/20 py-3 text-sm font-semibold text-foreground transition-transform active:scale-[0.98]"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => { deleteItem(confirmDeleteId); setConfirmDeleteId(null) }}
                className="flex-1 rounded-full bg-destructive py-3 text-sm font-semibold text-white transition-transform active:scale-[0.98]"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
