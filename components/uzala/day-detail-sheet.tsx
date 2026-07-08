'use client'

import { ChevronRight } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { useAdvancedActivities } from '@/hooks/use-advanced-activities'
import { isOverdue } from '@/lib/date-utils'

interface Props {
  date: string | null
  onClose: () => void
}

export function DayDetailSheet({ date, onClose }: Props) {
  const items = useAdvancedActivities((s) => s.items)
  const dayItems = date
    ? items.filter(
        (item) => item.scheduledDate && item.scheduledDate.startsWith(date)
      )
    : []

  const formattedDate = date
    ? new Date(date + 'T12:00:00').toLocaleDateString('es-MX', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
      })
    : ''

  return (
    <Sheet open={!!date} onOpenChange={(v) => !v && onClose()}>
      <SheetContent side="bottom" className="rounded-t-3xl border-none pb-8">
        <SheetHeader>
          <SheetTitle>{formattedDate}</SheetTitle>
        </SheetHeader>

        {dayItems.length === 0 ? (
          <p className="px-4 text-sm text-muted-foreground">
            Sin elementos para este día
          </p>
        ) : (
          <div className="flex flex-col">
            {dayItems.map((item) => {
              const overdue = isOverdue(item.scheduledDate)
              return (
                <button
                  key={item.id}
                  type="button"
                  className="flex w-full items-center gap-3.5 px-4 py-3 text-left transition-colors active:bg-foreground/5"
                >
                  <span
                    className={`size-3 shrink-0 rounded-full ${
                      item.status === 'completado'
                        ? 'bg-status-success'
                        : overdue
                        ? 'bg-destructive'
                        : 'bg-primary'
                    }`}
                  />
                  <span className="flex-1 text-sm font-medium text-foreground">
                    {item.title}
                  </span>
                  {item.scheduledDate && (
                    <span className="text-xs text-muted-foreground">
                      {new Date(item.scheduledDate).toLocaleTimeString('es-MX', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  )}
                  <span className="glass flex size-7 items-center justify-center rounded-full">
                    <ChevronRight className="size-3.5 text-foreground/60" strokeWidth={2.2} />
                  </span>
                </button>
              )
            })}
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
