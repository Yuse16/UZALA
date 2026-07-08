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
    <main className="uzala-bg relative min-h-screen">
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col gap-4 px-5 pb-28 pt-[max(env(safe-area-inset-top),1.25rem)]">
        <HomeHeader />
        <GreetingCard filter={filter} onFilterChange={setFilter} />
        <StatCards />
        <UpcomingList />
        <ItemList filter={filter} />
      </div>
      <BottomNav />
    </main>
  )
}
