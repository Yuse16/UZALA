'use client'

import { History, Repeat, ShoppingCart, User, FileText } from 'lucide-react'
import Link from 'next/link'
import { NotificationSettings } from '@/components/uzala/notification-settings'

const SECTIONS = [
  {
    href: '/mas/historial',
    icon: <History className="size-5" />,
    label: 'Historial',
    desc: 'Elementos completados y archivados',
  },
  {
    href: '/mas/habitos',
    icon: <Repeat className="size-5" />,
    label: 'Hábitos',
    desc: 'Gestiona tus hábitos diarios',
  },
  {
    href: '/mas/por-surtir',
    icon: <ShoppingCart className="size-5" />,
    label: 'Por surtir',
    desc: 'Productos e insumos pendientes',
  },
  {
    href: '/mas/proveedores',
    icon: <User className="size-5" />,
    label: 'Proveedores',
    desc: 'Contactos y productos que surten',
  },
  {
    href: '#',
    icon: <FileText className="size-5" />,
    label: 'Notas',
    desc: 'Disponible próximamente',
  },
]

export default function MasPage() {
  return (
    <main className="uzala-bg relative min-h-screen">
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col gap-4 px-5 pb-28 pt-[max(env(safe-area-inset-top),1.25rem)]">
        <h1 className="text-xl font-semibold text-foreground">Más</h1>

        <NotificationSettings />

        <div className="glass rounded-3xl">
          {SECTIONS.map((section) => {
            const disabled = section.href === '#'
            const Content = (
              <button
                type="button"
                className={`flex w-full items-center gap-3 px-5 py-4 text-left transition-colors active:bg-foreground/5 ${
                  disabled ? 'opacity-50' : ''
                }`}
              >
                <span className="flex size-10 items-center justify-center rounded-full bg-primary/15 text-primary">
                  {section.icon}
                </span>
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-foreground">{section.label}</span>
                  <span className="text-xs text-muted-foreground">{section.desc}</span>
                </div>
              </button>
            )
            if (disabled) return <div key={section.label}>{Content}</div>
            return (
              <Link key={section.href} href={section.href}>
                {Content}
              </Link>
            )
          })}
        </div>
      </div>
    </main>
  )
}
