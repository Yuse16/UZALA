import { useSyncExternalStore } from 'react'
import { useAdvancedActivities } from './use-advanced-activities'

export function useStoreSnapshot<T>(snapshot: () => T): T {
  return useSyncExternalStore(
    (cb) => {
      const unsub = useAdvancedActivities.subscribe(cb)
      return unsub
    },
    snapshot,
    snapshot
  )
}
