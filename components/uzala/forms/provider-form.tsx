'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { useAdvancedActivities } from '@/hooks/use-advanced-activities'
import type { Provider } from '@/lib/types'

interface Props {
  onSuccess: () => void
  editItem?: Provider
}

export function ProviderForm({ onSuccess, editItem }: Props) {
  const [name, setName] = useState(editItem?.title ?? '')
  const [phone, setPhone] = useState(editItem?.phone ?? '')
  const [whatsapp, setWhatsapp] = useState(editItem?.whatsapp ?? '')
  const [products, setProducts] = useState(editItem?.products.join(', ') ?? '')
  const [notes, setNotes] = useState(editItem?.description ?? '')
  const addItem = useAdvancedActivities((s) => s.addItem)
  const updateItem = useAdvancedActivities((s) => s.updateItem)

  function normalizePhone(value: string): string {
    let cleaned = value.replace(/\D/g, '')
    if (!cleaned.startsWith('+')) {
      cleaned = cleaned.startsWith('52') ? `+${cleaned}` : `+52${cleaned}`
    }
    return cleaned
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !phone.trim()) return

    const base = {
      title: name.trim(),
      phone: phone.trim(),
      whatsapp: whatsapp.trim() ? normalizePhone(whatsapp.trim()) : undefined,
      products: products.split(',').map((p) => p.trim()).filter(Boolean),
      description: notes.trim() || undefined,
      type: 'proveedor' as const,
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
        <Label htmlFor="name">Nombre</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nombre del proveedor"
          required
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="phone">Teléfono</Label>
        <Input
          id="phone"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Ej: 8441234567"
          required
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="whatsapp">WhatsApp (si es diferente)</Label>
        <Input
          id="whatsapp"
          type="tel"
          value={whatsapp}
          onChange={(e) => setWhatsapp(e.target.value)}
          placeholder="Ej: 8441234567"
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="products">Productos que surte</Label>
        <Input
          id="products"
          value={products}
          onChange={(e) => setProducts(e.target.value)}
          placeholder="Separados por coma: Agua, Hielo, Garrafones"
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="notes">Notas</Label>
        <Textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Opcional"
        />
      </div>

      <button
        type="submit"
        className="mt-2 w-full rounded-full bg-primary py-3 text-sm font-semibold text-primary-foreground transition-transform active:scale-[0.98]"
      >
        {editItem ? 'Guardar cambios' : 'Agregar proveedor'}
      </button>
    </form>
  )
}
