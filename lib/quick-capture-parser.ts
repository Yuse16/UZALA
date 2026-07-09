import type { Priority } from './types'

export interface ParsedReminder {
  isReminder: boolean
  title: string
  priority: Priority
  scheduledDate?: string
  notifyBeforeMinutes: number
}

const WEEKDAYS: Record<string, number> = {
  domingo: 0, lunes: 1, martes: 2, miercoles: 3, miércoles: 3,
  jueves: 4, viernes: 5, sabado: 6, sábado: 6,
}

const HOUR_REGEX = /\b(?:a\s+las?\s+)?(\d{1,2}):(\d{2})\s*(?:hrs?|hs?|horas?)?\b/i
const HOUR_SIMPLE_REGEX = /\ba\s+las?\s+(\d{1,2})\s*(am|pm)?\b/i
const TOMORROW_REGEX = /\b(mañana|manana)\b/i
const IN_DAYS_REGEX = /\ben\s+(\d{1,2})\s+d[ií]as?\b/i
const WEEKDAY_REGEX = /\b(domingo|lunes|martes|mi[eé]rcoles|jueves|viernes|s[aá]bado)\b/i
const DATE_REGEX = /\b(\d{1,2})[\/\-](\d{1,2})(?:[\/\-](\d{2,4}))?\b/
const REMINDER_KEYWORDS = /\b(recordatorio|recordar|recu[eé]rdame|no\s+olvidar|av[ií]s[aá]me)\b/i
const ADVANCE_DAY_REGEX = /\bun\s+d[ií]a\s+antes\b/i
const ADVANCE_HOUR_REGEX = /\b(\d+)\s*horas?\s+antes\b/i
const ADVANCE_MIN_REGEX = /\b(\d+)\s*min(?:utos?)?\s+antes\b/i

function startOfDay(d: Date) { const c = new Date(d); c.setHours(0,0,0,0); return c }
function applyTime(d: Date, h: number, m: number) { const c = new Date(d); c.setHours(h,m,0,0); return c }

export function parseReminderText(input: string): ParsedReminder {
  const trimmed = input.trim()
  const isReminder = REMINDER_KEYWORDS.test(trimmed)

  let priority: Priority = 'media'
  if (/urgente|importante|prioridad/i.test(trimmed)) priority = 'alta'

  let targetDate = startOfDay(new Date())
  if (TOMORROW_REGEX.test(trimmed)) {
    targetDate.setDate(targetDate.getDate() + 1)
  } else {
    const inDaysMatch = trimmed.match(IN_DAYS_REGEX)
    const weekdayMatch = trimmed.match(WEEKDAY_REGEX)
    const dateMatch = trimmed.match(DATE_REGEX)
    if (inDaysMatch) {
      targetDate.setDate(targetDate.getDate() + Number.parseInt(inDaysMatch[1]))
    } else if (weekdayMatch) {
      const targetDay = WEEKDAYS[weekdayMatch[1].toLowerCase()]
      let diff = targetDay - targetDate.getDay()
      if (diff < 0) diff += 7
      targetDate.setDate(targetDate.getDate() + diff)
    } else if (dateMatch) {
      const day = Number.parseInt(dateMatch[1])
      const month = Number.parseInt(dateMatch[2]) - 1
      const year = dateMatch[3]
        ? Number.parseInt(dateMatch[3].length === 2 ? `20${dateMatch[3]}` : dateMatch[3])
        : targetDate.getFullYear()
      targetDate = new Date(year, month, day)
    }
  }

  const hourMatch = trimmed.match(HOUR_REGEX)
  const hourSimpleMatch = !hourMatch ? trimmed.match(HOUR_SIMPLE_REGEX) : null
  let scheduledDate: string | undefined

  if (hourMatch) {
    scheduledDate = applyTime(targetDate, Number.parseInt(hourMatch[1]), Number.parseInt(hourMatch[2])).toISOString()
  } else if (hourSimpleMatch) {
    let hour = Number.parseInt(hourSimpleMatch[1])
    const period = hourSimpleMatch[2]?.toLowerCase()
    if (period === 'pm' && hour < 12) hour += 12
    if (period === 'am' && hour === 12) hour = 0
    scheduledDate = applyTime(targetDate, hour, 0).toISOString()
  } else if (isReminder) {
    scheduledDate = applyTime(targetDate, 9, 0).toISOString()
  }

  let notifyBeforeMinutes = 60
  if (ADVANCE_DAY_REGEX.test(trimmed)) {
    notifyBeforeMinutes = 1440
  } else if (ADVANCE_HOUR_REGEX.test(trimmed)) {
    notifyBeforeMinutes = Number.parseInt(trimmed.match(ADVANCE_HOUR_REGEX)![1]) * 60
  } else if (ADVANCE_MIN_REGEX.test(trimmed)) {
    notifyBeforeMinutes = Number.parseInt(trimmed.match(ADVANCE_MIN_REGEX)![1])
  } else if (scheduledDate) {
    const sameDay = startOfDay(new Date(scheduledDate)).getTime() === startOfDay(new Date()).getTime()
    notifyBeforeMinutes = sameDay ? 60 : 1440
  }

  const cleanTitle = trimmed
    .replace(REMINDER_KEYWORDS, '').replace(HOUR_REGEX, '').replace(HOUR_SIMPLE_REGEX, '')
    .replace(TOMORROW_REGEX, '').replace(IN_DAYS_REGEX, '').replace(WEEKDAY_REGEX, '')
    .replace(ADVANCE_DAY_REGEX, '').replace(ADVANCE_HOUR_REGEX, '').replace(ADVANCE_MIN_REGEX, '')
    .replace(/\s{2,}/g, ' ').trim()

  return { isReminder, title: cleanTitle || trimmed, priority, scheduledDate, notifyBeforeMinutes }
}
