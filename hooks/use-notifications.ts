'use client'

import { useCallback, useEffect, useRef } from 'react'

let swRegistration: ServiceWorkerRegistration | null = null

export async function registerSW() {
  if (typeof window === 'undefined') return null
  if (swRegistration) return swRegistration
  try {
    if (!('serviceWorker' in navigator)) return null
    swRegistration = await navigator.serviceWorker.register('/sw.js')
    return swRegistration
  } catch {
    return null
  }
}

export function isNotificationSupported() {
  if (typeof window === 'undefined') return false
  return 'Notification' in window && 'serviceWorker' in navigator
}

export async function requestPermission(): Promise<NotificationPermission | null> {
  if (!isNotificationSupported()) return null
  const permission = await Notification.requestPermission()
  return permission
}

export function getPermission(): NotificationPermission | null {
  if (typeof window === 'undefined') return null
  if (!('Notification' in window)) return null
  return Notification.permission
}

export async function sendLocalNotification(title: string, body?: string, tag?: string) {
  const reg = await registerSW()
  if (!reg) return
  if (getPermission() !== 'granted') return

  if (reg.active) {
    reg.active.postMessage({
      type: 'SHOW_NOTIFICATION',
      title,
      body: body || '',
      tag: tag || 'uzala-default',
    })
  } else {
    reg.showNotification(title, {
      body: body || '',
      tag: tag || 'uzala-default',
      icon: '/icon-512.png',
      badge: '/icon-512.png',
    })
  }
}

export function useNotificationScheduler(
  items: { id: string; title: string; scheduledDate?: string | null; status: string }[]
) {
  const notifiedRef = useRef(new Set<string>())

  const checkDueItems = useCallback(() => {
    if (getPermission() !== 'granted') return
    const now = Date.now()
    for (const item of items) {
      if (item.status === 'completado' || !item.scheduledDate) continue
      const due = new Date(item.scheduledDate).getTime()
      if (due <= now && !notifiedRef.current.has(item.id)) {
        notifiedRef.current.add(item.id)
        sendLocalNotification(
          '🔔 Recordatorio UZALA',
          item.title,
          `uzala-item-${item.id}`
        )
      }
    }
  }, [items])

  useEffect(() => {
    notifiedRef.current.clear()
    checkDueItems()
    const interval = setInterval(checkDueItems, 60_000)
    return () => clearInterval(interval)
  }, [checkDueItems])
}
