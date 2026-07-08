'use client'

import { useState } from 'react'
import { Plus, ListChecks, Circle } from 'lucide-react'
import { useAdvancedActivities } from '@/hooks/use-advanced-activities'
import { parseQuickCapture } from '@/lib/quick-capture-parser'
import type { Pendiente } from '@/lib/types'

interface Props {
  filter: 'actividades' | 'pendientes'
  onFilterChange: (f: 'actividades' | 'pendientes') => void
}

export function GreetingCard({ filter, onFilterChange }: Props) {
  const [text, setText] = useState('')
  const addItem = useAdvancedActivities((s) => s.addItem)

  function handleSubmit() {
    const title = text.trim()
    if (!title) return

    const parsed = parseQuickCapture(title)

    const item: Pendiente = {
      id: crypto.randomUUID(),
      title: parsed.title,
      type: 'pendiente',
      status: 'pendiente',
      priority: parsed.priority,
      createdAt: new Date().toISOString(),
      origin: 'captura_rapida',
      scheduledDate: parsed.scheduledDate,
    }

    if (parsed.type === 'recordatorio') {
      addItem({
        ...item,
        type: 'recordatorio',
        reminderDateTime: parsed.scheduledDate ?? new Date().toISOString(),
        critical: false,
        notifyBeforeMinutes: 5,
      })
    } else {
      addItem(item)
    }
    setText('')
  }

  return (
    <section className="glass glow-border rounded-3xl p-5">
      <h1 className="text-[1.75rem] font-semibold leading-tight tracking-tight text-foreground text-balance">
        Hola
      </h1>
      <p className="mt-1 text-[0.95rem] text-muted-foreground">
        ¿Qué necesitas recordar hoy?
      </p>

      <div className="glass mt-4 flex items-center gap-3 rounded-2xl py-2 pl-5 pr-2">
        <input
          type="text"
          placeholder="Escribe algo rápido..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          className="min-w-0 flex-1 bg-transparent text-base text-foreground placeholder:text-muted-foreground/80 outline-none"
        />
        <button
          type="button"
          aria-label="Agregar"
          onClick={handleSubmit}
          className="glow-teal flex size-11 shrink-0 items-center justify-center rounded-full bg-primary text-white transition-transform active:scale-95"
        >
          <Plus className="size-6" strokeWidth={2.4} />
        </button>
      </div>

      <div className="mt-4 flex gap-3">
        <button
          type="button"
          onClick={() => onFilterChange('actividades')}
          className={`flex flex-1 items-center justify-center gap-2 rounded-full py-3 text-[0.95rem] font-semibold transition-transform active:scale-[0.98] ${
            filter === 'actividades'
              ? 'glow-teal bg-primary text-primary-foreground'
              : 'bg-foreground text-background'
          }`}
        >
          <ListChecks className="size-5" strokeWidth={2.2} />
          Actividades
        </button>
        <button
          type="button"
          onClick={() => onFilterChange('pendientes')}
          className={`flex flex-1 items-center justify-center gap-2 rounded-full py-3 text-[0.95rem] font-semibold transition-transform active:scale-[0.98] ${
            filter === 'pendientes'
              ? 'glow-teal bg-primary text-primary-foreground'
              : 'bg-foreground text-background'
          }`}
        >
          <Circle className="size-5" strokeWidth={2.2} />
          Pendientes
        </button>
      </div>
    </section>
  )
}
