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
import type { Priority, RestockItem } from '@/lib/types'

interface Props {
  onSuccess: () => void
  editItem?: RestockItem
}

export function RestockForm({ onSuccess, editItem }: Props) {
  const [title, setTitle] = useState(editItem?.title ?? '')
  const [quantity, setQuantity] = useState(editItem?.quantity?.toString() ?? '')
  const [unit, setUnit] = useState(editItem?.unit ?? '')
  const [priority, setPriority] = useState<Priority>(editItem?.priority ?? 'media')
  const [dueDate, setDueDate] = useState(
    editItem?.dueDate ? editItem.dueDate.slice(0, 10) : ''
  )
  const addItem = useAdvancedActivities((s) => s.addItem)
  const updateItem = useAdvancedActivities((s) => s.updateItem)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return

    const dueDateVal = dueDate ? new Date(dueDate).toISOString() : undefined
    const base = {
      title: title.trim(),
      type: 'por_surtir' as const,
      status: 'pendiente' as const,
      priority,
      createdAt: new Date().toISOString(),
      origin: 'formulario' as const,
      quantity: quantity ? Number(quantity) : undefined,
      unit: unit.trim() || undefined,
      scheduledDate: dueDateVal,
      dueDate: dueDateVal,
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
        <Label htmlFor="title">Producto / insumo</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Ej: Leche, Filtros de agua..."
          required
        />
      </div>

      <div className="flex gap-3">
        <div className="flex flex-1 flex-col gap-2">
          <Label htmlFor="qty">Cantidad</Label>
          <Input
            id="qty"
            type="number"
            min="0"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder="0"
          />
        </div>
        <div className="flex flex-1 flex-col gap-2">
          <Label htmlFor="unit">Unidad</Label>
          <Input
            id="unit"
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            placeholder="Ej: litros, kg, piezas"
          />
        </div>
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

      <div className="flex flex-col gap-2">
        <Label htmlFor="dueDate">Fecha límite (opcional)</Label>
        <Input
          id="dueDate"
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
        />
      </div>

      <button
        type="submit"
        className="mt-2 w-full rounded-full bg-primary py-3 text-sm font-semibold text-primary-foreground transition-transform active:scale-[0.98]"
      >
        {editItem ? 'Guardar cambios' : 'Agregar'}
      </button>
    </form>
  )
}
