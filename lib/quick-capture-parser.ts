import type { ItemType, Priority } from './types'

export interface ParsedItem {
  title: string
  type: ItemType
  priority: Priority
  scheduledDate?: string
}

const HOUR_REGEX = /\b(?:a\s+las?\s+)?(\d{1,2}):(\d{2})\s*(?:hrs?|hs?|horas?)?\b/i
const TOMORROW_REGEX = /\b(mañana|manana)\b/i
const TODAY_REGEX = /\b(hoy)\b/i
const DATE_REGEX = /\b(\d{1,2})[\/-](\d{1,2})(?:[\/-](\d{2,4}))?\b/

const BUY_KEYWORDS = /\b(comprar|surtir|falta|mercado|super|abarrote|tienda)\b/i
const HABIT_KEYWORDS = /\b(todos?\s+los\s+d[ií]as|cada\s+(d[ií]a|semana)|diario|diariamente|cotidiano)\b/i
const REMINDER_KEYWORDS = /\b(recordar|recu[eé]rdame|no\s+olvidar|av[ií]s[aá]me)\b/i

function buildDate(hour: number, minute: number): string {
  const d = new Date()
  d.setHours(hour, minute, 0, 0)
  if (d <= new Date()) d.setDate(d.getDate() + 1)
  return d.toISOString()
}

export function parseQuickCapture(input: string): ParsedItem {
  const trimmed = input.trim()

  let priority: Priority = 'media'
  if (/urgente|importante|prioridad/i.test(trimmed)) {
    priority = 'alta'
  }

  const hourMatch = trimmed.match(HOUR_REGEX)
  const hasTomorrow = TOMORROW_REGEX.test(trimmed)
  const hasToday = TODAY_REGEX.test(trimmed)

  let type: ItemType = 'pendiente'
  let scheduledDate: string | undefined

  if (hourMatch) {
    const hour = Number.parseInt(hourMatch[1])
    const minute = Number.parseInt(hourMatch[2])
    scheduledDate = buildDate(hour, minute)
    type = 'actividad'
  }

  if (REMINDER_KEYWORDS.test(trimmed) && hourMatch) {
    type = 'recordatorio'
  }

  if (BUY_KEYWORDS.test(trimmed)) {
    type = 'por_surtir'
  }

  if (HABIT_KEYWORDS.test(trimmed)) {
    type = 'habito'
  }

  const cleanTitle = trimmed
    .replace(HOUR_REGEX, '')
    .replace(TOMORROW_REGEX, '')
    .replace(TODAY_REGEX, '')
    .trim()

  return {
    title: cleanTitle || trimmed,
    type,
    priority,
    scheduledDate,
  }
}
