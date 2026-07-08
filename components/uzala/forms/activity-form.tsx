'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAdvancedActivities } from '@/hooks/use-advanced-activities'

interface Props {
  onSuccess: () => void
}

export function ActivityForm({ onSuccess }: Props) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const addItem = useAdvancedActivities((s) => s.addItem)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    const scheduledDate = date && time
      ? new Date(`${date}T${time}`).toISOString()
      : undefined
    addItem({
      id: crypto.randomUUID(),
      title: title.trim(),
      description: description.trim() || undefined,
      type: 'actividad',
      status: 'pendiente',
      priority: 'media',
      createdAt: new Date().toISOString(),
      origin: 'formulario',
      scheduledDate,
    })
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
          placeholder="Nombre de la actividad"
          required
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="desc">Descripción</Label>
        <Input
          id="desc"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Opcional"
        />
      </div>
      <div className="flex gap-3">
        <div className="flex flex-1 flex-col gap-2">
          <Label htmlFor="date">Fecha</Label>
          <Input
            id="date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
        <div className="flex flex-1 flex-col gap-2">
          <Label htmlFor="time">Hora</Label>
          <Input
            id="time"
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
          />
        </div>
      </div>
      <button
        type="submit"
        className="mt-2 w-full rounded-full bg-primary py-3 text-sm font-semibold text-primary-foreground transition-transform active:scale-[0.98]"
      >
        Crear actividad
      </button>
    </form>
  )
}
