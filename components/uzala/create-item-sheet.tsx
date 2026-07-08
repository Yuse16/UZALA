'use client'

import { useState } from 'react'
import {
  Calendar,
  Circle,
  Bell,
  Repeat,
  ShoppingCart,
  User,
  FileText,
} from 'lucide-react'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { ActivityForm } from './forms/activity-form'
import { PendienteForm } from './forms/pendiente-form'
import { ReminderForm } from './forms/reminder-form'

type Tab = 'menu' | 'actividad' | 'pendiente' | 'recordatorio'

const ICON_CLASS = 'size-5'

const OPTIONS = [
  {
    key: 'actividad' as const,
    icon: <Calendar className={ICON_CLASS} />,
    label: 'Actividad',
    desc: 'Con fecha y hora concretas',
  },
  {
    key: 'pendiente' as const,
    icon: <Circle className={ICON_CLASS} />,
    label: 'Pendiente',
    desc: 'Sin hora exacta todavía',
  },
  {
    key: 'recordatorio' as const,
    icon: <Bell className={ICON_CLASS} />,
    label: 'Recordatorio',
    desc: 'Con alerta programada',
  },
  {
    key: 'placeholder-habito' as const,
    icon: <Repeat className={ICON_CLASS} />,
    label: 'Hábito',
    desc: 'Disponible próximamente',
  },
  {
    key: 'placeholder-surtir' as const,
    icon: <ShoppingCart className={ICON_CLASS} />,
    label: 'Por surtir',
    desc: 'Disponible próximamente',
  },
  {
    key: 'placeholder-proveedor' as const,
    icon: <User className={ICON_CLASS} />,
    label: 'Proveedor',
    desc: 'Disponible próximamente',
  },
  {
    key: 'placeholder-nota' as const,
    icon: <FileText className={ICON_CLASS} />,
    label: 'Nota',
    desc: 'Disponible próximamente',
  },
]

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateItemSheet({ open, onOpenChange }: Props) {
  const [tab, setTab] = useState<Tab>('menu')

  function handleSuccess() {
    onOpenChange(false)
    setTab('menu')
  }

  return (
    <Sheet open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) setTab('menu') }}>
      <SheetContent side="bottom" className="rounded-t-3xl border-none pb-8">
        <SheetHeader>
          <SheetTitle>
            {tab === 'menu' && 'Nuevo elemento'}
            {tab === 'actividad' && 'Nueva actividad'}
            {tab === 'pendiente' && 'Nuevo pendiente'}
            {tab === 'recordatorio' && 'Nuevo recordatorio'}
          </SheetTitle>
        </SheetHeader>

        {tab === 'menu' && (
          <div className="flex flex-col gap-2">
            {OPTIONS.map((opt) => (
              <button
                key={opt.key}
                type="button"
                onClick={() => {
                  if (opt.key.startsWith('placeholder-')) return
                  setTab(opt.key as Tab)
                }}
                className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-left transition-colors active:bg-foreground/5 ${
                  opt.key.startsWith('placeholder-')
                    ? 'opacity-50'
                    : ''
                }`}
              >
                <span className="flex size-10 items-center justify-center rounded-full bg-primary/15 text-primary">
                  {opt.icon}
                </span>
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-foreground">{opt.label}</span>
                  <span className="text-xs text-muted-foreground">{opt.desc}</span>
                </div>
              </button>
            ))}
          </div>
        )}

        {tab === 'actividad' && <ActivityForm onSuccess={handleSuccess} />}
        {tab === 'pendiente' && <PendienteForm onSuccess={handleSuccess} />}
        {tab === 'recordatorio' && <ReminderForm onSuccess={handleSuccess} />}
      </SheetContent>
    </Sheet>
  )
}
