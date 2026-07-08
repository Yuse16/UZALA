'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useAdvancedActivities } from '@/hooks/use-advanced-activities'
import type { Priority } from '@/lib/types'

interface Props {
  onSuccess: () => void
}

export function PendienteForm({ onSuccess }: Props) {
  const [title, setTitle] = useState('')
  const [priority, setPriority] = useState<Priority>('media')
  const addItem = useAdvancedActivities((s) => s.addItem)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    addItem({
      id: crypto.randomUUID(),
      title: title.trim(),
      type: 'pendiente',
      status: 'pendiente',
      priority,
      createdAt: new Date().toISOString(),
      origin: 'formulario',
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
          placeholder="¿Qué necesitas hacer?"
          required
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="priority">Prioridad</Label>
        <Select value={priority} onValueChange={(v) => v && setPriority(v as Priority)}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="baja">Baja</SelectItem>
            <SelectItem value="media">Media</SelectItem>
            <SelectItem value="alta">Alta</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <button
        type="submit"
        className="mt-2 w-full rounded-full bg-primary py-3 text-sm font-semibold text-primary-foreground transition-transform active:scale-[0.98]"
      >
        Crear pendiente
      </button>
    </form>
  )
}
