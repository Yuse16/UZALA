export function isOverdue(scheduledDate?: string): boolean {
  if (!scheduledDate) return false
  return new Date(scheduledDate) < new Date()
}

export function isToday(date: string): boolean {
  const d = new Date(date)
  const now = new Date()
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  )
}

export function isSameDay(a: string, b: string): boolean {
  const da = new Date(a)
  const db = new Date(b)
  return (
    da.getFullYear() === db.getFullYear() &&
    da.getMonth() === db.getMonth() &&
    da.getDate() === db.getDate()
  )
}

export function matchesWeekday(repeatDays: number[]): boolean {
  return repeatDays.includes(new Date().getDay())
}
