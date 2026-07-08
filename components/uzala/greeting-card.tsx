import { Plus, ListChecks, Circle } from 'lucide-react'

export function GreetingCard() {
  return (
    <section className="glass glow-border rounded-3xl p-5">
      <h1 className="text-[1.75rem] font-semibold leading-tight tracking-tight text-foreground text-balance">
        Hola, Jorge
      </h1>
      <p className="mt-1 text-[0.95rem] text-muted-foreground">
        ¿Qué necesitas recordar hoy?
      </p>

      {/* Quick input */}
      <div className="glass mt-4 flex items-center gap-3 rounded-2xl py-2 pl-5 pr-2">
        <input
          type="text"
          placeholder="Escribe algo rápido..."
          className="min-w-0 flex-1 bg-transparent text-base text-foreground placeholder:text-muted-foreground/80 outline-none"
        />
        <button
          type="button"
          aria-label="Agregar"
          className="glow-teal flex size-11 shrink-0 items-center justify-center rounded-full bg-primary text-white transition-transform active:scale-95"
        >
          <Plus className="size-6" strokeWidth={2.4} />
        </button>
      </div>

      {/* Toggle */}
      <div className="mt-4 flex gap-3">
        <button
          type="button"
          className="glow-teal flex flex-1 items-center justify-center gap-2 rounded-full bg-primary py-3 text-[0.95rem] font-semibold text-primary-foreground transition-transform active:scale-[0.98]"
        >
          <ListChecks className="size-5" strokeWidth={2.2} />
          Actividades
        </button>
        <button
          type="button"
          className="flex flex-1 items-center justify-center gap-2 rounded-full bg-foreground py-3 text-[0.95rem] font-semibold text-background transition-transform active:scale-[0.98]"
        >
          <Circle className="size-5" strokeWidth={2.2} />
          Pendientes
        </button>
      </div>
    </section>
  )
}
