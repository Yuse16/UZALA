import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Outfit } from 'next/font/google'
import { NotificationScheduler } from '@/components/uzala/notification-scheduler'
import './globals.css'

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
})

export const metadata: Metadata = {
  title: 'UZALA',
  description: 'Tu asistente para recordar todo lo que necesitas',
  generator: 'v0.app',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'UZALA',
  },
  icons: {
    icon: '/icon-512.png',
    apple: '/icon-512.png',
  },
}

export const viewport: Viewport = {
  colorScheme: 'dark',
  themeColor: '#0d2622',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className={outfit.variable}>
      <body className="uzala-bg font-sans antialiased">
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
        <NotificationScheduler />
      </body>
    </html>
  )
}
