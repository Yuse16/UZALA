import { CalendarGrid } from '@/components/uzala/calendar-grid'
import { BottomNav } from '@/components/uzala/bottom-nav'

export default function CalendarioPage() {
  return (
    <main className="uzala-bg relative min-h-screen">
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col gap-4 px-5 pt-[max(env(safe-area-inset-top),1.25rem)]" style={{ paddingBottom: 'calc(7rem + env(safe-area-inset-bottom))' }}>
        <h1 className="text-xl font-semibold text-foreground">Calendario</h1>
        <CalendarGrid />
      </div>
      <BottomNav />
    </main>
  )
}
