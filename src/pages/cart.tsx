import { AlertTriangle, ArrowLeft, Minus, Plus, ShoppingBag, TicketPercent, Trash2, X } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { toast } from 'sonner'

import { Container } from '@/components/layout/app-layout'
import { Button } from '@/components/ui/button'
import { buttonVariants } from '@/components/ui/button-variants'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { EmptyState } from '@/components/ui/misc'
import { NumberTicker } from '@/components/ui/price'
import { Skeleton } from '@/components/ui/skeleton'
import { errorMessage } from '@/lib/api'
import { faNumber, rialToToman, toman } from '@/lib/format'
import { useApplyDiscount, useCart, useRemoveCartItem, useRemoveDiscount, useUpdateCartItem } from '@/lib/queries'
import type { Cart, CartItem } from '@/lib/types'
import { useAuth } from '@/stores/auth'

function Line({ item }: { item: CartItem }) {
  const update = useUpdateCartItem()
  const remove = useRemoveCartItem()
  const setQuantity = (quantity: number) =>
    update.mutate({ id: item.id, quantity }, { onError: (e) => toast.error(errorMessage(e)) })

  return (
    <motion.li layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: 60, transition: { duration: 0.18 } }}>
      <Card tone="calm" className="flex gap-4 p-3 sm:p-4">
        <Link to={`/product/${item.product.slug}`} className="size-24 shrink-0 overflow-hidden rounded-brutal-sm border-brutal-soft bg-surface-2 sm:size-28">
          {item.product.image && <img src={item.product.image} alt="" className="size-full object-cover" />}
        </Link>
        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <Link to={`/product/${item.product.slug}`} className="line-clamp-2 font-bold leading-6 hover:underline">{item.product.name}</Link>
          {item.options && <p className="text-xs font-bold text-muted">{item.options}</p>}
          {item.warning && (
            <p className="flex items-center gap-1 text-xs font-black text-red"><AlertTriangle className="size-3.5" />{item.warning}</p>
          )}
          <div className="mt-auto flex flex-wrap items-end justify-between gap-3">
            <div className="flex h-10 items-center rounded-brutal-sm border-brutal-soft bg-surface" aria-label="تعداد">
              <button className="grid h-full w-9 place-items-center hover:bg-surface-2" onClick={() => setQuantity(item.quantity + 1)} disabled={update.isPending} aria-label="افزایش">
                <Plus className="size-4" />
              </button>
              <span className="w-7 text-center font-black tabular-nums">{faNumber(item.quantity)}</span>
              {item.quantity > 1 ? (
                <button className="grid h-full w-9 place-items-center hover:bg-surface-2" onClick={() => setQuantity(item.quantity - 1)} disabled={update.isPending} aria-label="کاهش">
                  <Minus className="size-4" />
                </button>
              ) : (
                <button className="grid h-full w-9 place-items-center text-red hover:bg-red/10" onClick={() => remove.mutate(item.id)} aria-label="حذف">
                  <Trash2 className="size-4" />
                </button>
              )}
            </div>
            <div className="text-left">
              {item.current_price < item.unit_price && (
                <p className="text-xs font-bold text-red">{toman((item.unit_price - item.current_price) * item.quantity)} تومان تخفیف</p>
              )}
              <p className="font-display text-lg tabular-nums">
                <NumberTicker value={rialToToman(item.line_total)} /> <span className="text-xs font-bold text-muted">تومان</span>
              </p>
            </div>
          </div>
        </div>
        <button className="self-start text-muted hover:text-red" onClick={() => remove.mutate(item.id)} aria-label="حذف از سبد">
          <X className="size-5" />
        </button>
      </Card>
    </motion.li>
  )
}

export function DiscountBox({ cart }: { cart: Cart }) {
  const [code, setCode] = useState('')
  const apply = useApplyDiscount()
  const remove = useRemoveDiscount()
  if (cart.discount) {
    return (
      <div className="flex items-center justify-between gap-2 rounded-brutal-sm border-2 border-dashed border-green bg-green/10 px-3 py-2 text-sm">
        <span className="flex items-center gap-1.5 font-black" dir="ltr"><TicketPercent className="size-4 text-green" />{cart.discount.code}</span>
        {cart.discount.error && <span className="text-xs font-bold text-red">{cart.discount.error}</span>}
        <button className="text-xs font-bold text-red underline" onClick={() => remove.mutate(undefined)}>حذف</button>
      </div>
    )
  }
  return (
    <form
      className="flex gap-2"
      onSubmit={(e) => {
        e.preventDefault()
        apply.mutate(code.trim(), {
          onSuccess: () => {
            toast.success('کد تخفیف اعمال شد')
            setCode('')
          },
          onError: (error) => toast.error(errorMessage(error)),
        })
      }}
    >
      <Input value={code} onChange={(e) => setCode(e.target.value)} placeholder="کد تخفیف" dir="ltr" className="h-10 text-center font-bold uppercase" />
      <Button type="submit" variant="outline" size="sm" className="h-10" loading={apply.isPending} disabled={!code.trim()}>اعمال</Button>
    </form>
  )
}

export function SummaryRows({ rows, total }: { rows: [string, number, string?][]; total: number }) {
  return (
    <div className="flex flex-col gap-2.5 text-sm">
      {rows.map(([label, value, tone]) => (
        <div key={label} className="flex justify-between gap-2">
          <span className="text-muted">{label}</span>
          <span className={`font-bold tabular-nums ${tone ?? ''}`}>{value === 0 && label.includes('ارسال') ? 'رایگان' : `${toman(value)} تومان`}</span>
        </div>
      ))}
      <div className="mt-1 flex items-center justify-between gap-2 border-t-[length:var(--bw-soft)] border-line pt-3">
        <span className="font-black">مبلغ قابل پرداخت</span>
        <span className="font-display text-xl tabular-nums"><NumberTicker value={rialToToman(total)} /> <span className="text-xs font-bold text-muted">تومان</span></span>
      </div>
    </div>
  )
}

export function CartPage() {
  const { data: cart, isLoading } = useCart()
  const access = useAuth((s) => s.access)
  const navigate = useNavigate()

  if (isLoading) {
    return <Container className="space-y-3 pt-8">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-32 w-full rounded-brutal" />)}</Container>
  }
  if (!cart?.items.length) {
    return (
      <Container className="pt-10">
        <EmptyState
          icon={<ShoppingBag />}
          title="سبد خرید خالی است"
          text="یک سر به تخفیف‌ها بزنید؛ قطعه‌ی بعدی سیستمتان منتظر است."
          action={<Link to="/" className={buttonVariants({})}>رفتن به فروشگاه <ArrowLeft className="size-4" /></Link>}
        />
      </Container>
    )
  }

  return (
    <Container className="pt-6">
      <h1 className="mb-6 font-display text-3xl">سبد خرید <span className="text-lg text-muted">({faNumber(cart.items_count)} کالا)</span></h1>
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <ul className="flex flex-col gap-3">
          <AnimatePresence initial={false}>
            {cart.items.map((item) => <Line key={item.id} item={item} />)}
          </AnimatePresence>
        </ul>
        <Card className="sticky top-44 flex flex-col gap-4 p-5">
          <h2 className="font-display text-lg">خلاصه‌ی سفارش</h2>
          <SummaryRows
            rows={[
              ['قیمت کالاها', cart.subtotal + cart.items_discount],
              ...(cart.items_discount ? [['تخفیف کالاها', cart.items_discount, 'text-red'] as [string, number, string]] : []),
              ...(cart.discount?.amount ? [['کد تخفیف', cart.discount.amount, 'text-red'] as [string, number, string]] : []),
            ]}
            total={cart.total}
          />
          <DiscountBox cart={cart} />
          {cart.has_problems && <p className="text-xs font-bold text-red">موجودی بعضی کالاها تغییر کرده؛ قبل از ادامه تعدادشان را اصلاح کنید.</p>}
          <Button size="lg" disabled={cart.has_problems} onClick={() => navigate(access ? '/checkout' : '/login?next=/checkout')}>
            {access ? 'ادامه‌ی خرید' : 'ورود و ادامه‌ی خرید'} <ArrowLeft className="size-5" />
          </Button>
          <p className="text-center text-xs text-muted">هزینه‌ی ارسال در مرحله‌ی بعد محاسبه می‌شود.</p>
        </Card>
      </div>
    </Container>
  )
}
