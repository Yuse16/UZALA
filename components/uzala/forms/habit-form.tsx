'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAdvancedActivities } from '@/hooks/use-advanced-activities'
import type { Habit } from '@/lib/types'

interface Props {
  onSuccess: () => void
  editItem?: Habit
}

const WEEKDAYS = [
  { value: 0, label: 'Do' },
  { value: 1, label: 'Lu' },
  { value: 2, label: 'Ma' },
  { value: 3, label: 'Mi' },
  { value: 4, label: 'Ju' },
  { value: 5, label: 'Vi' },
  { value: 6, label: 'Sa' },
]

export function HabitForm({ onSuccess, editItem }: Props) {
  const [title, setTitle] = useState(editItem?.title ?? '')
  const [repeatDays, setRepeatDays] = useState<number[]>(editItem?.repeatDays ?? [])
  const [suggestedTime, setSuggestedTime] = useState(editItem?.suggestedTime ?? '')
  const addItem = useAdvancedActivities((s) => s.addItem)
  const updateItem = useAdvancedActivities((s) => s.updateItem)

  function toggleDay(day: number) {
    setRepeatDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    )
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim() || repeatDays.length === 0) return

    if (editItem) {
      updateItem(editItem.id, {
        title: title.trim(),
        repeatDays,
        suggestedTime: suggestedTime || undefined,
      } as Partial<Habit>)
    } else {
      addItem({
        id: crypto.randomUUID(),
        title: title.trim(),
        type: 'habito',
        status: 'pendiente',
        priority: 'media',
        createdAt: new Date().toISOString(),
        origin: 'formulario',
        repeatDays,
        suggestedTime: suggestedTime || undefined,
        currentStreak: 0,
        bestStreak: 0,
        history: [],
      })
    }
    onSuccess()
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="title">Nombre del hábito</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Ej: Hacer ejercicio"
          required
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label>Días de repetición</Label>
        <div className="flex gap-2">
          {WEEKDAYS.map((wd) => (
            <button
              key={wd.value}
              type="button"
              onClick={() => toggleDay(wd.value)}
              className={`flex size-10 items-center justify-center rounded-full text-sm font-medium transition-colors ${
                repeatDays.includes(wd.value)
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-foreground/10 text-foreground/70'
              }`}
            >
              {wd.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="time">Hora sugerida (opcional)</Label>
        <Input
          id="time"
          type="time"
          value={suggestedTime}
          onChange={(e) => setSuggestedTime(e.target.value)}
        />
      </div>

      <button
        type="submit"
        className="mt-2 w-full rounded-full bg-primary py-3 text-sm font-semibold text-primary-foreground transition-transform active:scale-[0.98]"
      >
        {editItem ? 'Guardar cambios' : 'Crear hábito'}
      </button>
    </form>
  )
}
