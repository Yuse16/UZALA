'use client'

import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { DayDetailSheet } from './day-detail-sheet'
import { useAdvancedActivities } from '@/hooks/use-advanced-activities'
import { isOverdue } from '@/lib/date-utils'

const WEEKDAYS = ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa']
const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

export function CalendarGrid() {
  const [cursor, setCursor] = useState(() => new Date())
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  const year = cursor.getFullYear()
  const month = cursor.getMonth()

  const today = new Date()
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`

  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const firstDayOfWeek = new Date(year, month, 1).getDay()

  const weeks = useMemo(() => {
    const cells: (number | null)[][] = []
    let week: (number | null)[] = []
    for (let i = 0; i < firstDayOfWeek; i++) week.push(null)
    for (let d = 1; d <= daysInMonth; d++) {
      week.push(d)
      if (week.length === 7) {
        cells.push(week)
        week = []
      }
    }
    if (week.length) {
      while (week.length < 7) week.push(null)
      cells.push(week)
    }
    return cells
  }, [year, month, daysInMonth, firstDayOfWeek])

  const items = useAdvancedActivities((s) => s.items)

  function getDayKey(day: number) {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  }

  function getItemsForDay(day: number) {
    const key = getDayKey(day)
    return items.filter(
      (item) =>
        item.scheduledDate &&
        item.scheduledDate.startsWith(key)
    )
  }

  function prevMonth() {
    setCursor(new Date(year, month - 1, 1))
  }

  function nextMonth() {
    setCursor(new Date(year, month + 1, 1))
  }

  return (
    <>
      <div className="glass rounded-3xl p-4">
        <div className="mb-4 flex items-center justify-between">
          <button
            type="button"
            onClick={prevMonth}
            className="flex size-9 items-center justify-center rounded-full text-foreground/70 transition-colors active:bg-foreground/10"
          >
            <ChevronLeft className="size-5" />
          </button>
          <span className="text-base font-semibold text-foreground">
            {MONTHS[month]} {year}
          </span>
          <button
            type="button"
            onClick={nextMonth}
            className="flex size-9 items-center justify-center rounded-full text-foreground/70 transition-colors active:bg-foreground/10"
          >
            <ChevronRight className="size-5" />
          </button>
        </div>

        <div className="grid grid-cols-7 text-center">
          {WEEKDAYS.map((wd) => (
            <div key={wd} className="py-1 text-xs font-medium text-muted-foreground">
              {wd}
            </div>
          ))}
          {weeks.map((week, wi) =>
            week.map((day, di) => {
              if (day === null) return <div key={`${wi}-${di}`} />
              const key = getDayKey(day)
              const dayItems = getItemsForDay(day)
              const isToday = key === todayStr
              const allCompleted = dayItems.length > 0 && dayItems.every(
                (item) => item.status === 'completado'
              )
              const anyOverdue = dayItems.some(
                (item) =>
                  item.status !== 'completado' &&
                  item.status !== 'omitido' &&
                  item.scheduledDate &&
                  isOverdue(item.scheduledDate)
              )
              const hasItems = dayItems.length > 0

              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setSelectedDate(key)}
                  className="relative flex flex-col items-center py-1"
                >
                  <span
                    className={`flex size-9 items-center justify-center rounded-full text-sm transition-colors ${
                      isToday
                        ? 'bg-primary font-bold text-primary-foreground'
                        : 'text-foreground hover:bg-foreground/10'
                    }`}
                  >
                    {day}
                  </span>
                  {hasItems && (
                    <span
                      className={`mt-0.5 size-1.5 rounded-full ${
                        allCompleted
                          ? 'bg-status-success'
                          : anyOverdue
                          ? 'bg-destructive'
                          : 'bg-primary'
                      }`}
                    />
                  )}
                </button>
              )
            })
          )}
        </div>
      </div>

      <DayDetailSheet
        date={selectedDate}
        onClose={() => setSelectedDate(null)}
      />
    </>
  )
}
