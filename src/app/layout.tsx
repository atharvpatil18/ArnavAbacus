import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import { cn } from '@/lib/utils'

const inter = Inter({ subsets: ['latin'] })

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
    <html lang="en">
      <body className={cn(inter.className, 'min-h-screen bg-background antialiased')}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
