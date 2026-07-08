import { HomeHeader } from '@/components/uzala/home-header'
import { GreetingCard } from '@/components/uzala/greeting-card'
import { StatCards } from '@/components/uzala/stat-cards'
import { UpcomingList } from '@/components/uzala/upcoming-list'
import { BottomNav } from '@/components/uzala/bottom-nav'

export default function HomePage() {
  return (
    <main className="uzala-bg relative min-h-screen">
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col gap-4 px-5 pb-28 pt-[max(env(safe-area-inset-top),1.25rem)]">
        <HomeHeader />
        <GreetingCard />
        <StatCards />
        <UpcomingList />
      </div>
      <BottomNav />
    </main>
  )
}
