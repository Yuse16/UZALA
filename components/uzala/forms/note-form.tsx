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

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return

    const base = {
      title: title.trim(),
      body: body.trim() || title.trim(),
      type: 'nota' as const,
      status: 'pendiente' as const,
      priority: 'media' as const,
      createdAt: new Date().toISOString(),
      origin: 'formulario' as const,
    }

    if (editItem) {
      updateItem(editItem.id, base)
    } else {
      addItem({
        ...base,
        id: crypto.randomUUID(),
      })
    }
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

      <button
        type="submit"
        className="mt-2 w-full rounded-full bg-primary py-3 text-sm font-semibold text-primary-foreground transition-transform active:scale-[0.98]"
      >
        {editItem ? 'Guardar cambios' : 'Agregar nota'}
      </button>
    </form>
  )
}
