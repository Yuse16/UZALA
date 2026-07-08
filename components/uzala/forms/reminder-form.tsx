'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAdvancedActivities } from '@/hooks/use-advanced-activities'

interface Props {
  onSuccess: () => void
}

export function ReminderForm({ onSuccess }: Props) {
  const [title, setTitle] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [critical, setCritical] = useState(false)
  const addItem = useAdvancedActivities((s) => s.addItem)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim() || !date || !time) return
    const reminderDateTime = new Date(`${date}T${time}`).toISOString()
    addItem({
      id: crypto.randomUUID(),
      title: title.trim(),
      type: 'recordatorio',
      status: 'pendiente',
      priority: 'media',
      createdAt: new Date().toISOString(),
      origin: 'formulario',
      reminderDateTime,
      critical,
      notifyBeforeMinutes: 5,
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
          placeholder="¿Qué quieres recordar?"
          required
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
            required
          />
        </div>
        <div className="flex flex-1 flex-col gap-2">
          <Label htmlFor="time">Hora</Label>
          <Input
            id="time"
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            required
          />
        </div>
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={critical}
          onChange={(e) => setCritical(e.target.checked)}
          className="size-4"
        />
        Recordatorio crítico (se repite hasta confirmar)
      </label>
      <button
        type="submit"
        className="mt-2 w-full rounded-full bg-primary py-3 text-sm font-semibold text-primary-foreground transition-transform active:scale-[0.98]"
      >
        Crear recordatorio
      </button>
    </form>
  )
}
