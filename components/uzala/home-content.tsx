'use client'

import { useState } from 'react'
import { HomeHeader } from './home-header'
import { GreetingCard } from './greeting-card'
import { StatCards } from './stat-cards'
import { UpcomingList } from './upcoming-list'
import { ItemList } from './item-list'
import { BottomNav } from './bottom-nav'

export function HomeContent() {
  const [filter, setFilter] = useState<'actividades' | 'pendientes'>('actividades')

  return (
    <main className="uzala-bg fixed inset-0 flex flex-col">
      <div className="shrink-0 px-5 pt-[max(env(safe-area-inset-top),1.25rem)]">
        <HomeHeader />
      </div>
      <div className="flex-1 overflow-y-auto px-5" style={{ paddingBottom: 'calc(7rem + env(safe-area-inset-bottom))' }}>
        <div className="flex flex-col gap-4 pt-4">
          <GreetingCard filter={filter} onFilterChange={setFilter} />
          <StatCards />
          <UpcomingList />
          <ItemList filter={filter} />
        </div>
      </div>
      <BottomNav />
    </main>
  )
}
