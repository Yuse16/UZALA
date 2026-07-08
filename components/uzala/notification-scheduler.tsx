'use client'

import { useAdvancedActivities } from '@/hooks/use-advanced-activities'
import { useNotificationScheduler, registerSW } from '@/hooks/use-notifications'
import { useEffect } from 'react'

export function NotificationScheduler() {
  const items = useAdvancedActivities((s) => s.items)

  useNotificationScheduler(items)

  useEffect(() => {
    registerSW()
  }, [])

  return null
}
