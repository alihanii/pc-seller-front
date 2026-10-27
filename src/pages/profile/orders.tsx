import { ChevronLeft, Package } from 'lucide-react'
import { motion } from 'motion/react'
import { Link, useSearchParams } from 'react-router'

import { buttonVariants } from '@/components/ui/button-variants'
import { Card } from '@/components/ui/card'
import { EmptyState } from '@/components/ui/misc'
import { Skeleton } from '@/components/ui/skeleton'
import { faNumber, jalaliDate, toFaDigits, toman } from '@/lib/format'
import { ORDER_FILTERS, ORDER_STATUS_TONE } from '@/lib/order-status'
import { useOrders } from '@/lib/queries'
import { cn } from '@/lib/utils'

export function OrdersPage() {
  const [params, setParams] = useSearchParams()
  const status = params.get('status') ?? ''
  const { data, isLoading, isPlaceholderData } = useOrders(status)

  return (
    <div>
      <h1 className="mb-4 font-display text-2xl">سفارش‌ها</h1>
      <div className="-mx-1 mb-5 flex gap-1.5 overflow-x-auto px-1 pb-1 [scrollbar-width:none]" role="tablist" aria-label="وضعیت سفارش">
        {ORDER_FILTERS.map(([value, label]) => (
          <button
            key={value} role="tab" aria-selected={status === value}
            onClick={() => setParams(value ? { status: value } : {})}
            className={cn('min-h-11 shrink-0 rounded-md border-2 px-3 py-1.5 text-sm font-bold transition-all', status === value ? 'border-line bg-ink text-bg shadow-brutal-sm' : 'border-line-soft bg-surface hover:border-line')}
          >
            {label}
          </button>
        ))}
      </div>
      {isLoading && <div className="space-y-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-24 rounded-brutal" />)}</div>}
      {data?.count === 0 && (
        <EmptyState icon={<Package />} title="سفارشی پیدا نشد" text={status ? 'در این وضعیت سفارشی ندارید.' : 'هنوز سفارشی ثبت نکرده‌اید.'} action={<Link to="/" className={buttonVariants({})}>شروع خرید</Link>} />
      )}
      <motion.ul
        key={status} className={cn('flex flex-col gap-3', isPlaceholderData && 'opacity-60')}
        initial="hidden" animate="show" variants={{ hidden: {}, show: { transition: { staggerChildren: 0.05 } } }}
      >
        {data?.results.map((order) => (
          <motion.li key={order.number} variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}>
            <Link to={`/profile/orders/${order.number}`} className="group block">
              <Card tone="calm" className="flex flex-wrap items-center gap-x-6 gap-y-2 p-4 transition-[transform,box-shadow] group-hover:translate-x-[2px] group-hover:-translate-y-[2px] group-hover:shadow-brutal">
                <div className="min-w-32">
                  <p className="text-xs text-muted">شماره سفارش</p>
                  <p className="font-black tabular-nums"><bdi>{toFaDigits(order.number)}</bdi></p>
                </div>
                <span className={cn('rounded-md border-2 border-line px-2.5 py-1 text-xs font-black', ORDER_STATUS_TONE[order.status])}>{order.status_display}</span>
                <p className="text-sm text-muted">{jalaliDate(order.created_at)} · {faNumber(order.items_count ?? 0)} کالا</p>
                <p className="ms-auto font-display tabular-nums">{toman(order.total)} <span className="text-xs font-bold text-muted">تومان</span></p>
                <ChevronLeft className="size-5 transition-transform group-hover:-translate-x-1" />
              </Card>
            </Link>
          </motion.li>
        ))}
      </motion.ul>
    </div>
  )
}
