import { ChevronRight } from 'lucide-react'

const items: {
  id: number; title: string; time: string; color: string
}[] = []

export function UpcomingList() {
  return (
    <section>
      <h2 className="mb-3 px-1 text-lg font-semibold text-foreground">
        Pendientes próximos
      </h2>
      <div className="glass overflow-hidden rounded-3xl">
        {items.map((item, index) => (
          <button
            key={item.id}
            type="button"
            className="flex w-full items-center gap-3.5 px-5 py-3.5 text-left transition-colors active:bg-foreground/5"
            style={
              index !== 0
                ? { borderTop: '1px solid oklch(0.98 0.01 170 / 0.08)' }
                : undefined
            }
          >
            <span className={`size-3 shrink-0 rounded-full ${item.color}`} />
            <span className="flex-1 text-base font-medium text-foreground">
              {item.title}
            </span>
            <span className="text-base font-medium text-primary">{item.time}</span>
            <span className="glass flex size-8 items-center justify-center rounded-full">
              <ChevronRight className="size-4 text-foreground/80" strokeWidth={2.2} />
            </span>
          </button>
        ))}
      </div>
    </section>
  )
}
