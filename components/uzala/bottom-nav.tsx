'use client'

import { House, Calendar, Plus, LayoutGrid } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

export function BottomNav() {
  const [hidden, setHidden] = useState(false)
  const lastY = useRef(0)

  useEffect(() => {
    lastY.current = window.scrollY

    const onScroll = () => {
      const y = window.scrollY
      const delta = y - lastY.current

      // Ignore tiny jitters and bounce near the top
      if (Math.abs(delta) > 6 && y > 24) {
        setHidden(delta > 0)
      } else if (y <= 24) {
        setHidden(false)
      }
      lastY.current = y
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav className="pointer-events-none fixed inset-x-0 bottom-0 z-20 flex justify-center px-5 pb-6">
      <div
        className={`glass pointer-events-auto relative flex w-full max-w-md items-center justify-between rounded-full px-8 py-3.5 transition-[transform,opacity] duration-500 ease-[cubic-bezier(0.22,1.4,0.36,1)] ${
          hidden
            ? 'translate-y-[140%] scale-95 opacity-0'
            : 'translate-y-0 scale-100 opacity-100'
        }`}
      >
        {/* Inicio (active) */}
        <button
          type="button"
          className="flex flex-col items-center gap-1 text-primary transition-transform active:scale-90"
        >
          <House
            className="size-6"
            strokeWidth={2}
            fill="currentColor"
            fillOpacity={0.15}
          />
          <span className="text-xs font-medium">Inicio</span>
        </button>

        {/* Calendario */}
        <button
          type="button"
          className="flex flex-col items-center gap-1 text-foreground/70 transition-transform active:scale-90"
        >
          <Calendar className="size-6" strokeWidth={1.8} />
          <span className="text-xs font-medium">Calendario</span>
        </button>

        {/* Center add button */}
        <div className="flex w-14 justify-center">
          <button
            type="button"
            aria-label="Crear"
            className="glow-teal absolute -top-4 flex size-16 items-center justify-center rounded-full bg-primary text-white transition-transform active:scale-90"
          >
            <Plus className="size-8" strokeWidth={2.4} />
          </button>
        </div>

        {/* Más */}
        <button
          type="button"
          className="flex flex-col items-center gap-1 text-foreground/70 transition-transform active:scale-90"
        >
          <LayoutGrid className="size-6" strokeWidth={1.8} />
          <span className="text-xs font-medium">Más</span>
        </button>
      </div>
    </nav>
  )
}
