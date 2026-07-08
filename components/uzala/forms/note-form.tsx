'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { useAdvancedActivities } from '@/hooks/use-advanced-activities'
import type { Note } from '@/lib/types'

interface Props {
  onSuccess: () => void
  editItem?: Note
}

export function NoteForm({ onSuccess, editItem }: Props) {
  const [title, setTitle] = useState(editItem?.title ?? '')
  const [body, setBody] = useState(editItem?.body ?? editItem?.description ?? '')
  const addItem = useAdvancedActivities((s) => s.addItem)
  const updateItem = useAdvancedActivities((s) => s.updateItem)
  const deleteItem = useAdvancedActivities((s) => s.deleteItem)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return

    if (editItem) {
      updateItem(editItem.id, {
        title: title.trim(),
        body: body.trim() || title.trim(),
      })
    } else {
      addItem({
        id: crypto.randomUUID(),
        title: title.trim(),
        body: body.trim() || title.trim(),
        type: 'nota',
        status: 'pendiente',
        priority: 'media',
        createdAt: new Date().toISOString(),
        origin: 'formulario',
      })
    }
    onSuccess()
  }

  function handleDelete() {
    if (!editItem) return
    deleteItem(editItem.id)
    onSuccess()
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="title">Título</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Título de la nota"
          required
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="body">Contenido</Label>
        <Textarea
          id="body"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Escribe tu nota aquí..."
          rows={4}
        />
      </div>

      <div className="mt-2 flex gap-3">
        {editItem && (
          <button
            type="button"
            onClick={handleDelete}
            className="flex-1 rounded-full border border-destructive/40 py-3 text-sm font-semibold text-destructive transition-transform active:scale-[0.98]"
          >
            Eliminar nota
          </button>
        )}
        <button
          type="submit"
          className={`rounded-full bg-primary py-3 text-sm font-semibold text-primary-foreground transition-transform active:scale-[0.98] ${editItem ? 'flex-auto' : 'w-full'}`}
        >
          {editItem ? 'Guardar cambios' : 'Agregar nota'}
        </button>
      </div>
    </form>
  )
}
