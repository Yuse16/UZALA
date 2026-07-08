'use client'

import { useState, useMemo } from 'react'
import { useAdvancedActivities } from '@/hooks/use-advanced-activities'
import { HabitForm } from '@/components/uzala/forms/habit-form'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import type { Habit } from '@/lib/types'

const WEEKDAYS = [
  { value: 0, label: 'Do' },
  { value: 1, label: 'Lu' },
  { value: 2, label: 'Ma' },
  { value: 3, label: 'Mi' },
  { value: 4, label: 'Ju' },
  { value: 5, label: 'Vi' },
  { value: 6, label: 'Sa' },
]

export default function HabitosPage() {
  const [showForm, setShowForm] = useState(false)
  const [editItem, setEditItem] = useState<Habit | null>(null)
  const items = useAdvancedActivities((s) => s.items)
  const updateItem = useAdvancedActivities((s) => s.updateItem)

  const habits = useMemo(
    () => items.filter((item): item is Habit => item.type === 'habito'),
    [items]
  )

  function todayStr() {
    return new Date().toISOString().slice(0, 10)
  }

  function todayStatus(habit: Habit): 'pendiente' | 'completado' | 'omitido' {
    const entry = habit.history.find((h) => h.date.startsWith(todayStr()))
    if (!entry) return 'pendiente'
    return entry.status
  }

  function handleComplete(habit: Habit) {
    const ts = todayStr()
    const history = habit.history.filter((h) => !h.date.startsWith(ts))
    const existing = habit.history.find((h) => h.date.startsWith(ts))
    if (!existing || existing.status !== 'completado') {
      history.push({ date: new Date().toISOString(), status: 'completado' })
    }
    updateItem(habit.id, { history } as Partial<Habit>)
    // Recalculate streaks
    const streak = calculateStreak(habit.repeatDays, history)
    updateItem(habit.id, { currentStreak: streak } as Partial<Habit>)
  }

  function handleOmit(habit: Habit) {
    const ts = todayStr()
    const history = habit.history.filter((h) => !h.date.startsWith(ts))
    const existing = habit.history.find((h) => h.date.startsWith(ts))
    if (!existing || existing.status !== 'omitido') {
      history.push({ date: new Date().toISOString(), status: 'omitido' })
    }
    updateItem(habit.id, { history } as Partial<Habit>)
  }

  function calculateStreak(repeatDays: number[], history: Habit['history']): number {
    let streak = 0
    const d = new Date()
    while (true) {
      const dateStr = d.toISOString().slice(0, 10)
      const entry = history.find((h) => h.date.startsWith(dateStr))
      if (entry?.status === 'completado') {
        streak++
        d.setDate(d.getDate() - 1)
      } else {
        if (streak === 0 && !repeatDays.includes(d.getDay())) {
          d.setDate(d.getDate() - 1)
          continue
        }
        break
      }
    }
    return streak
  }

  return (
    <main className="uzala-bg relative min-h-screen">
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col gap-4 px-5 pt-[max(env(safe-area-inset-top),1.25rem)]" style={{ paddingBottom: 'calc(7rem + env(safe-area-inset-bottom))' }}>
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-foreground">Hábitos</h1>
          <button
            type="button"
            onClick={() => { setEditItem(null); setShowForm(true) }}
            className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground transition-transform active:scale-[0.98]"
          >
            + Nuevo
          </button>
        </div>

        {habits.length === 0 ? (
          <div className="glass rounded-3xl px-5 py-6 text-center text-sm text-muted-foreground">
            No tienes hábitos todavía
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {habits.map((habit) => {
              const status = todayStatus(habit)
              const streak = calculateStreak(habit.repeatDays, habit.history)
              return (
                <div key={habit.id} className="glass rounded-3xl p-4">
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => { setEditItem(habit); setShowForm(true) }}
                      className="text-base font-semibold text-foreground hover:underline"
                    >
                      {habit.title}
                    </button>
                    <span className="text-xs text-muted-foreground">
                      Racha: {streak} días
                    </span>
                  </div>

                  {habit.suggestedTime && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      {habit.suggestedTime}
                    </p>
                  )}

                  <div className="mt-3 flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleComplete(habit)}
                      className={`flex-1 rounded-full py-2 text-sm font-medium transition-colors ${
                        status === 'completado'
                          ? 'bg-status-success text-white'
                          : 'bg-foreground/10 text-foreground/70'
                      }`}
                    >
                      {status === 'completado' ? '✔ Completado' : 'Completar'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOmit(habit)}
                      className={`flex-1 rounded-full py-2 text-sm font-medium transition-colors ${
                        status === 'omitido'
                          ? 'bg-destructive text-white'
                          : 'bg-foreground/10 text-foreground/70'
                      }`}
                    >
                      {status === 'omitido' ? '✕ Omitido' : 'Omitir'}
                    </button>
                  </div>

                  <div className="mt-3 flex gap-1">
                    {WEEKDAYS.map((wd) => (
                      <span
                        key={wd.value}
                        className={`flex size-7 items-center justify-center rounded-full text-xs font-medium ${
                          habit.repeatDays.includes(wd.value)
                            ? 'bg-primary/20 text-primary'
                            : 'text-muted-foreground/50'
                        }`}
                      >
                        {wd.label}
                      </span>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <Sheet open={showForm} onOpenChange={(v) => { setShowForm(v); if (!v) setEditItem(null) }}>
        <SheetContent side="bottom" className="rounded-t-3xl border-none pb-8">
          <SheetHeader>
            <SheetTitle>{editItem ? 'Editar hábito' : 'Nuevo hábito'}</SheetTitle>
          </SheetHeader>
          <HabitForm onSuccess={() => { setShowForm(false); setEditItem(null) }} editItem={editItem ?? undefined} />
        </SheetContent>
      </Sheet>
    </main>
  )
}
