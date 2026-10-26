import { useQueryClient } from '@tanstack/react-query'
import { Heart, LogOut, MapPin, Package, UserRound } from 'lucide-react'
import { NavLink, Outlet, useNavigate } from 'react-router'
import { toast } from 'sonner'

import { Container } from '@/components/layout/app-layout'
import { Card } from '@/components/ui/card'
import { api } from '@/lib/api'
import { toFaDigits } from '@/lib/format'
import { useMe } from '@/lib/queries'
import { cn } from '@/lib/utils'
import { useAuth } from '@/stores/auth'

const LINKS = [
  { to: '/profile', label: 'اطلاعات حساب', icon: UserRound, end: true },
  { to: '/profile/orders', label: 'سفارش‌ها', icon: Package },
  { to: '/profile/addresses', label: 'آدرس‌ها', icon: MapPin },
  { to: '/profile/wishlist', label: 'علاقه‌مندی‌ها', icon: Heart },
]

export function ProfileLayout() {
  const { data: me } = useMe()
  const navigate = useNavigate()
  const client = useQueryClient()

  const logout = async () => {
    const { refresh } = useAuth.getState()
    try {
      if (refresh) await api.post('/auth/logout/', { refresh })
    } catch {
      /* the token may already be invalid */
    }
    useAuth.getState().logout()
    client.clear()
    toast('از حساب خارج شدید.')
    navigate('/')
  }

  return (
    <Container className="grid items-start gap-6 pt-6 lg:grid-cols-[250px_minmax(0,1fr)]">
      <Card className="p-4 lg:sticky lg:top-44">
        <div className="mb-4 flex items-center gap-3 border-b-[length:var(--bw-soft)] border-line-soft pb-4">
          <span className="grid size-12 rotate-[-5deg] place-items-center rounded-lg border-brutal bg-pink font-display text-lg text-[#0a0a0a]">
            {(me?.first_name || 'ک').slice(0, 1)}
          </span>
          <div className="min-w-0">
            <p className="truncate font-black">{me?.first_name || me?.last_name ? `${me.first_name} ${me.last_name}` : 'کاربر عزیز'}</p>
            <p className="text-sm text-muted"><bdi>{toFaDigits(me?.mobile ?? '')}</bdi></p>
          </div>
        </div>
        <nav className="-mx-1 flex gap-1 overflow-x-auto px-1 pb-1 lg:flex-col lg:overflow-visible" aria-label="حساب کاربری">
          {LINKS.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to} to={to} end={end}
              className={({ isActive }) => cn(
                'flex shrink-0 items-center gap-2.5 rounded-md border-2 px-3 py-2 text-sm font-bold transition-all',
                isActive ? 'border-line bg-yellow text-[#0a0a0a] shadow-brutal-sm' : 'border-transparent hover:bg-surface-2',
              )}
            >
              <Icon className="size-4.5" />{label}
            </NavLink>
          ))}
          <button onClick={logout} className="flex shrink-0 items-center gap-2.5 rounded-md border-2 border-transparent px-3 py-2 text-sm font-bold text-red-ink hover:bg-red/10">
            <LogOut className="size-4.5" />خروج
          </button>
        </nav>
      </Card>
      <div className="min-w-0"><Outlet /></div>
    </Container>
  )
}
