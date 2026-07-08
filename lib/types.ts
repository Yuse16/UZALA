export type ItemType =
  | 'actividad'
  | 'pendiente'
  | 'recordatorio'
  | 'habito'
  | 'por_surtir'
  | 'proveedor'
  | 'nota'

export type ItemStatus = 'pendiente' | 'en_proceso' | 'completado' | 'omitido'

export type Priority = 'baja' | 'media' | 'alta'

export type Origin = 'captura_rapida' | 'formulario' | 'sistema' | 'importado'

export interface BaseItem {
  id: string
  title: string
  description?: string
  type: ItemType
  status: ItemStatus
  priority: Priority
  createdAt: string
  scheduledDate?: string
  completedAt?: string
  origin: Origin
}

export interface Activity extends BaseItem {
  type: 'actividad'
}

export interface Pendiente extends BaseItem {
  type: 'pendiente'
}

export interface Reminder extends BaseItem {
  type: 'recordatorio'
  reminderDateTime: string
  critical: boolean
  notifyBeforeMinutes: number
}

export interface HabitHistoryEntry {
  date: string
  status: 'completado' | 'omitido'
}

export interface Habit extends BaseItem {
  type: 'habito'
  repeatDays: number[]
  suggestedTime?: string
  currentStreak: number
  bestStreak: number
  history: HabitHistoryEntry[]
  smartConfig?: null
}

export interface RestockItem extends BaseItem {
  type: 'por_surtir'
  quantity?: number
  unit?: string
  supplierId?: string
  dueDate?: string
}

export interface Provider extends BaseItem {
  type: 'proveedor'
  phone: string
  whatsapp?: string
  products: string[]
  nextCallDate?: string
}

export interface Note extends BaseItem {
  type: 'nota'
  body: string
  tags?: string[]
}

export type UzalaItem = Activity | Pendiente | Reminder | Habit | RestockItem | Provider | Note
