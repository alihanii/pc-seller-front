import { AnimatePresence, motion } from 'motion/react'
import { Navigate, Outlet, ScrollRestoration, useLocation, useOutlet } from 'react-router'
import { Toaster } from 'sonner'

import { useAuth } from '@/stores/auth'
import { useTheme } from '@/stores/theme'

import { Footer } from './footer'
import { Header } from './header'

export function AppLayout() {
  const location = useLocation()
  const theme = useTheme((s) => s.theme)
  // useOutlet() (not <Outlet />) so the page leaving keeps its own content during the exit animation.
  const outlet = useOutlet()
  return (
    <div className="flex min-h-dvh flex-col">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:right-2 focus:z-50 focus:rounded-md focus:bg-yellow focus:px-3 focus:py-2 focus:font-bold">
        رفتن به محتوای اصلی
      </a>
      <Header />
      <AnimatePresence mode="wait" initial={false}>
        <motion.main
          id="main"
          key={location.pathname}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
          className="flex-1"
        >
          {outlet}
        </motion.main>
      </AnimatePresence>
      <Footer />
      <ScrollRestoration />
      <Toaster
        position="top-center"
        dir="rtl"
        theme={theme}
        toastOptions={{
          className: '!font-sans !rounded-brutal-sm !border-brutal !shadow-brutal !bg-surface !text-ink !font-bold',
        }}
      />
    </div>
  )
}

/** Sends visitors to the login page and back here afterwards. */
export function RequireAuth() {
  const access = useAuth((s) => s.access)
  const location = useLocation()
  if (!access) return <Navigate to={`/login?next=${encodeURIComponent(location.pathname + location.search)}`} replace />
  return <Outlet />
}

export function Container({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`mx-auto w-full max-w-7xl px-4 ${className}`}>{children}</div>
}
