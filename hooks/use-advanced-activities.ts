import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { PersistStorage } from 'zustand/middleware'
import type { UzalaItem, ItemType } from '@/lib/types'
import { isOverdue, isToday, isSameDay } from '@/lib/date-utils'

interface ActivitiesState {
  items: UzalaItem[]
  addItem: (item: UzalaItem) => void
  updateItem: (id: string, changes: Partial<UzalaItem>) => void
  completeItem: (id: string) => void
  omitItem: (id: string) => void
  deleteItem: (id: string) => void
}

const STORAGE_KEY = 'uzala:v1:items'

const persistStorage: PersistStorage<ActivitiesState> = {
  getItem: (name) => {
    if (typeof window === 'undefined') return null
    try {
      const raw = localStorage.getItem(name)
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  },
  setItem: (name, value) => {
    if (typeof window === 'undefined') return
    try {
      localStorage.setItem(name, JSON.stringify(value))
    } catch {
      // storage full or unavailable
    }
  },
  removeItem: (name) => {
    if (typeof window === 'undefined') return
    try {
      localStorage.removeItem(name)
    } catch {
      // unavailable
    }
  },
}

export const useAdvancedActivities = create<ActivitiesState>()(
  persist(
    (set) => ({
      items: [],

      addItem: (item) =>
        set((state) => ({ items: [...state.items, item] })),

      updateItem: (id, changes) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id ? ({ ...item, ...changes } as UzalaItem) : item
          ),
        })),

      completeItem: (id) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id
              ? ({ ...item, status: 'completado' as const, completedAt: new Date().toISOString() } as UzalaItem)
              : item
          ),
        })),

      omitItem: (id) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id
              ? ({ ...item, status: 'omitido' as const } as UzalaItem)
              : item
          ),
        })),

      deleteItem: (id) =>
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        })),
    }),
    {
      name: STORAGE_KEY,
      storage: persistStorage,
    }
  )
)

function activeItems(items: UzalaItem[]) {
  return items.filter(
    (item) => item.status !== 'completado' && item.status !== 'omitido'
  )
}

export function getToday() {
  const items = useAdvancedActivities.getState().items
  return activeItems(items).filter(
    (item) =>
      (item.scheduledDate != null && isToday(item.scheduledDate)) ||
      (item.type === 'habito' &&
        item.repeatDays.includes(new Date().getDay()) &&
        !item.history.some((h) => isToday(h.date)))
  )
}

export function getUrgent() {
  const items = useAdvancedActivities.getState().items
  return activeItems(items).filter(
    (item) =>
      item.priority === 'alta' ||
      (item.scheduledDate != null && isOverdue(item.scheduledDate))
  )
}

export function getUpcoming(limit = 3) {
  const items = useAdvancedActivities.getState().items
  return activeItems(items)
    .filter((item) => item.scheduledDate != null)
    .sort(
      (a, b) =>
        new Date(a.scheduledDate!).getTime() -
        new Date(b.scheduledDate!).getTime()
    )
    .slice(0, limit)
}

export function getByType(type: ItemType) {
  return useAdvancedActivities.getState().items.filter(
    (item) => item.type === type
  )
}

export function getByDate(date: string) {
  return useAdvancedActivities.getState().items.filter(
    (item) =>
      item.scheduledDate != null && isSameDay(item.scheduledDate, date)
  )
}

export function getByProvider(providerId: string) {
  return useAdvancedActivities.getState().items.filter(
    (item) =>
      item.type === 'por_surtir' &&
      'supplierId' in item &&
      item.supplierId === providerId
  )
}

export function getHistory() {
  return [...useAdvancedActivities.getState().items].sort((a, b) => {
    const dateA = a.completedAt ?? a.createdAt
    const dateB = b.completedAt ?? b.createdAt
    return new Date(dateB).getTime() - new Date(dateA).getTime()
  })
}
