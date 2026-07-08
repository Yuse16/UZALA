'use client'

import { Bell } from 'lucide-react'
import { UzalaLogo } from './logo'
import { getUrgent } from '@/hooks/use-advanced-activities'
import { useStoreSnapshot } from '@/hooks/use-store-snapshot'

export function HomeHeader() {
  const hasUrgent = useStoreSnapshot(() => getUrgent().length > 0)

  return (
    <header className="relative flex items-center justify-center pt-2">
      <button
        type="button"
        aria-label="Notificaciones"
        className="glass absolute left-0 flex size-12 items-center justify-center rounded-full transition-transform active:scale-95"
      >
        <Bell className="size-5 text-foreground/90" strokeWidth={1.8} />
        {hasUrgent && (
          <span className="absolute right-2.5 top-2.5 size-2.5 rounded-full bg-primary ring-2 ring-background" />
        )}
      </button>
      <UzalaLogo />
    </header>
  )
}
