import type { Metadata } from 'next'
import { Inter, Outfit } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import { cn } from '@/lib/utils'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const outfit = Outfit({ subsets: ['latin'], variable: '--font-outfit' })

export const metadata: Metadata = {
  title: 'Arnav Abacus Academy',
  description: 'Management system for Arnav Abacus Academy',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn(inter.variable, outfit.variable, 'min-h-screen bg-background font-sans antialiased')}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
