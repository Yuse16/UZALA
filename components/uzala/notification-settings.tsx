'use client'

import { useState, useEffect } from 'react'
import { Bell, BellOff } from 'lucide-react'
import {
  isNotificationSupported,
  requestPermission,
  getPermission,
} from '@/hooks/use-notifications'

export function NotificationSettings() {
  const [permission, setPermission] = useState<NotificationPermission | null>(null)
  const [supported, setSupported] = useState(false)

  useEffect(() => {
    setSupported(isNotificationSupported())
    setPermission(getPermission())
  }, [])

  if (!supported) {
    return (
      <div className="glass rounded-3xl">
        <div className="flex items-center gap-3 px-5 py-4 opacity-50">
          <span className="flex size-10 items-center justify-center rounded-full bg-primary/15 text-primary">
            <BellOff className="size-5" />
          </span>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-foreground">Notificaciones</span>
            <span className="text-xs text-muted-foreground">
              No soportado en este navegador
            </span>
          </div>
        </div>
      </div>
    )
  }

  const enabled = permission === 'granted'

  async function handleToggle() {
    if (enabled) return
    const result = await requestPermission()
    setPermission(result)
  }

  return (
    <div className="glass rounded-3xl">
      <button
        type="button"
        onClick={handleToggle}
        className="flex w-full items-center gap-3 px-5 py-4 text-left transition-colors active:bg-foreground/5"
      >
        <span className="flex size-10 items-center justify-center rounded-full bg-primary/15 text-primary">
          <Bell className="size-5" />
        </span>
        <div className="flex flex-col">
          <span className="text-sm font-medium text-foreground">Notificaciones</span>
          <span className="text-xs text-muted-foreground">
            {enabled
              ? 'Activadas — recibirás avisos de pendientes'
              : 'Toca para activar notificaciones'}
          </span>
        </div>
        <span
          className={`ml-auto size-3 rounded-full ${
            enabled ? 'bg-status-success' : 'bg-foreground/20'
          }`}
        />
      </button>
    </div>
  )
}
