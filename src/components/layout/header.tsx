import { Heart, Menu, Moon, ShoppingCart, Sun, User } from 'lucide-react'
import { motion, useAnimationControls } from 'motion/react'
import { useEffect, useState } from 'react'
import { Link, NavLink } from 'react-router'

import { Button } from '@/components/ui/button'
import { buttonVariants } from '@/components/ui/button-variants'
import { Dialog } from '@/components/ui/dialog'
import { Marquee } from '@/components/ui/misc'
import { CategoryIcon } from '@/components/product/category-icon'
import { faNumber } from '@/lib/format'
import { useCart, useCategories } from '@/lib/queries'
import { cn } from '@/lib/utils'
import { useAuth } from '@/stores/auth'
import { useCartStore } from '@/stores/cart'
import { useTheme } from '@/stores/theme'

import { SearchBox } from './search-box'

const PROMOS = ['ارسال رایگان سفارش‌های بالای ۳۰ میلیون تومان', 'ضمانت اصالت همه‌ی کالاها', 'کد WELCOME10 برای اولین خرید', 'پیک فوری در تهران و کرج', '۷ روز ضمانت بازگشت']

export function Logo({ className }: { className?: string }) {
  return (
    <Link to="/" className={cn('group flex min-h-11 items-center gap-2', className)} aria-label="پی‌سی‌سلر، صفحه‌ی اصلی">
      <span className="grid size-10 rotate-[-6deg] place-items-center rounded-lg border-brutal bg-yellow font-black text-[#0a0a0a] shadow-brutal-sm transition-transform duration-200 group-hover:rotate-[4deg]" dir="ltr">
        PC
      </span>
      <span className="font-display text-xl leading-none">
        پی‌سی<span className="text-blue-ink">سلر</span>
      </span>
    </Link>
  )
}

function CartButton() {
  const { data } = useCart()
  const pulse = useCartStore((s) => s.pulse)
  const controls = useAnimationControls()
  useEffect(() => {
    if (pulse) controls.start({ scale: [1, 1.35, 0.9, 1.1, 1], rotate: [0, -12, 10, -4, 0], transition: { duration: 0.45 } })
  }, [pulse, controls])
  const count = data?.items_count ?? 0
  return (
    <Link to="/cart" id="cart-button" className={cn(buttonVariants({ variant: 'primary', size: 'icon' }), 'relative')} aria-label={`سبد خرید، ${faNumber(count)} کالا`}>
      <motion.span animate={controls} className="grid place-items-center"><ShoppingCart className="size-5" /></motion.span>
      {count > 0 && (
        <motion.span
          key={count}
          initial={{ scale: 0 }} animate={{ scale: 1 }}
          className="absolute -top-2.5 -left-2.5 grid min-w-6 place-items-center rounded-full border-brutal-soft bg-red px-1 text-xs font-black text-[#0a0a0a]"
        >
          {faNumber(count)}
        </motion.span>
      )}
    </Link>
  )
}

export function Header() {
  const { data: categories } = useCategories()
  const access = useAuth((s) => s.access)
  const { theme, toggle } = useTheme()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-30 bg-bg/90 backdrop-blur-md">
      <div className="border-b-[length:var(--bw)] border-line bg-ink py-1.5 text-xs font-bold text-bg">
        <Marquee>
          {PROMOS.map((promo) => (
            <span key={promo} className="flex items-center gap-10 whitespace-nowrap">
              {promo}<span className="text-yellow" aria-hidden>✦</span>
            </span>
          ))}
        </Marquee>
      </div>
      <div className="border-b-[length:var(--bw)] border-line">
        <div className="mx-auto flex max-w-7xl items-center gap-2 px-4 py-3 sm:gap-3 lg:gap-6">
          <Button variant="outline" size="icon" className="lg:hidden" onClick={() => setMenuOpen(true)} aria-label="منو">
            <Menu className="size-5" />
          </Button>
          <Logo />
          <SearchBox className="hidden min-w-0 flex-1 md:block" />
          <div className="ms-auto flex shrink-0 items-center gap-2 md:ms-0 lg:gap-2.5">
            <Button variant="outline" size="icon" onClick={toggle} aria-label={theme === 'dark' ? 'حالت روشن' : 'حالت تیره'} className="hidden sm:inline-flex">
              {theme === 'dark' ? <Sun className="size-5" /> : <Moon className="size-5" />}
            </Button>
            {access && (
              <Link to="/profile/wishlist" className={cn(buttonVariants({ variant: 'outline', size: 'icon' }), 'hidden sm:inline-flex')} aria-label="علاقه‌مندی‌ها">
                <Heart className="size-5" />
              </Link>
            )}
            <Link
              to={access ? '/profile' : '/login'}
              className={cn(buttonVariants({ variant: access ? 'outline' : 'blue', size: 'md' }), 'max-lg:size-11 max-lg:px-0')}
            >
              <User className="size-5" />
              <span className="hidden lg:inline">{access ? 'حساب من' : 'ورود | ثبت‌نام'}</span>
            </Link>
            <CartButton />
          </div>
        </div>
        <div className="px-4 pb-3 md:hidden"><SearchBox /></div>
        <nav className="hidden border-t-[length:var(--bw-soft)] border-line-soft lg:block" aria-label="دسته‌بندی‌ها">
          <ul className="mx-auto flex max-w-7xl items-center gap-1 px-4 py-1.5">
            {categories?.map((category) => (
              <li key={category.id}>
                <NavLink
                  to={`/category/${category.slug}`}
                  className={({ isActive }) => cn(
                    'flex min-h-11 items-center gap-1.5 rounded-md border-2 border-transparent px-3 py-1.5 text-sm font-bold transition-all hover:border-line hover:bg-yellow hover:text-[#0a0a0a] hover:shadow-brutal-sm',
                    isActive && 'border-line bg-yellow text-[#0a0a0a] shadow-brutal-sm',
                  )}
                >
                  <CategoryIcon slug={category.slug} className="size-4" />{category.name}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <Dialog open={menuOpen} onOpenChange={setMenuOpen} title="دسته‌بندی‌ها" variant="drawer">
        <ul className="flex flex-col gap-2">
          {categories?.map((category) => (
            <li key={category.id}>
              <Link to={`/category/${category.slug}`} onClick={() => setMenuOpen(false)} className="flex items-center gap-3 rounded-brutal-sm border-brutal-soft bg-surface px-3 py-3 font-bold shadow-brutal-sm transition-colors hover:bg-yellow hover:text-[#0a0a0a]">
                <CategoryIcon slug={category.slug} className="size-5" />{category.name}
              </Link>
              {category.children.length > 0 && (
                <ul className="mt-2 flex flex-wrap gap-2 ps-4">
                  {category.children.map((child) => (
                    <li key={child.id}>
                      <Link to={`/category/${child.slug}`} onClick={() => setMenuOpen(false)} className="flex min-h-11 items-center rounded-md border-hairline px-3.5 text-sm font-bold">{child.name}</Link>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
        <Button variant="outline" className="mt-6 w-full" onClick={toggle}>
          {theme === 'dark' ? <Sun className="size-5" /> : <Moon className="size-5" />}
          {theme === 'dark' ? 'حالت روشن' : 'حالت تیره'}
        </Button>
      </Dialog>
    </header>
  )
}
