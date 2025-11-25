import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
  }),
  useSearchParams: () => ({
    get: vi.fn(),
  }),
  usePathname: () => '/',
}))

// Mock NextAuth
vi.mock('next-auth/react', () => ({
  useSession: () => ({
    data: { user: { name: 'Test User', email: 'test@example.com', role: 'ADMIN' } },
    status: 'authenticated',
  }),
  signIn: vi.fn(),
  signOut: vi.fn(),
}))

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
