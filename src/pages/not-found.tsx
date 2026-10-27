import { Home } from 'lucide-react'
import { motion } from 'motion/react'
import { Link } from 'react-router'

import { Container } from '@/components/layout/app-layout'
import { buttonVariants } from '@/components/ui/button-variants'
import { Sticker } from '@/components/ui/sticker'

export function NotFoundPage() {
  return (
    <Container className="grid grid-cols-1 place-items-center py-20 text-center">
      <div className="relative">
        <motion.h1
          initial={{ rotate: -20, scale: 0.6, opacity: 0 }} animate={{ rotate: -4, scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 12 }}
          className="font-display text-[9rem] leading-none text-yellow [-webkit-text-stroke:4px_var(--c-line)] [text-shadow:-8px_8px_0_var(--c-shadow)] sm:text-[13rem]"
        >
          ۴۰۴
        </motion.h1>
        <Sticker tone="pink" tilt={10} className="absolute top-4 -right-6 text-base">ارور!</Sticker>
      </div>
      <p className="mt-6 font-display text-2xl">این صفحه پیدا نشد</p>
      <p className="mt-2 text-muted">شاید آدرس اشتباه است، یا این قطعه دیگر در انبار ما نیست.</p>
      <Link to="/" className={`${buttonVariants({ size: 'lg' })} mt-8`}><Home className="size-5" /> صفحه‌ی اصلی</Link>
    </Container>
  )
}
