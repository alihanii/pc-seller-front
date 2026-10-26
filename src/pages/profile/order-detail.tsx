import { Check, ChevronRight, Copy, CreditCard, MapPin, PackageX, Truck } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router'
import { toast } from 'sonner'

import { SummaryRows } from '@/pages/cart'
import { Button } from '@/components/ui/button'
import { buttonVariants } from '@/components/ui/button-variants'
import { Card } from '@/components/ui/card'
import { EmptyState } from '@/components/ui/misc'
import { Skeleton } from '@/components/ui/skeleton'
import { errorMessage } from '@/lib/api'
import { faNumber, jalaliDateTime, toFaDigits, toman } from '@/lib/format'
import { ORDER_FLOW, ORDER_STATUS_TONE } from '@/lib/order-status'
import { useCancelOrder, useOrder } from '@/lib/queries'
import type { OrderDetail } from '@/lib/types'
import { cn } from '@/lib/utils'

function Progress({ order }: { order: OrderDetail }) {
  if (order.status === 'cancelled' || order.status === 'returned') return null
  const current = ORDER_FLOW.indexOf(order.status)
  const labels = ['ثبت', 'پرداخت', 'پردازش', 'ارسال', 'تحویل']
  return (
    <ol className="flex items-center">
      {ORDER_FLOW.map((step, i) => (
        <li key={step} className="flex flex-1 items-center last:flex-none">
          <div className="flex flex-col items-center gap-1.5">
            <span className={cn(
              'grid size-9 place-items-center rounded-full border-brutal-soft text-sm font-black transition-colors',
              i < current ? 'bg-green text-[#0a0a0a]' : i === current ? 'bg-yellow text-[#0a0a0a] shadow-brutal-sm' : 'bg-surface text-muted',
            )}>
              {i < current ? <Check className="size-4 stroke-[3]" /> : faNumber(i + 1)}
            </span>
            <span className={cn('text-xs font-bold', i > current && 'text-muted')}>{labels[i]}</span>
          </div>
          {i < ORDER_FLOW.length - 1 && <span className={cn('mx-1 mb-5 h-1 flex-1 rounded-full', i < current ? 'bg-green' : 'bg-line-soft')} />}
        </li>
      ))}
    </ol>
  )
}

export function OrderDetailPage() {
  const { number } = useParams()
  const { data: order, isLoading, isError } = useOrder(number)
  const cancel = useCancelOrder()
  const navigate = useNavigate()

  if (isError) return <EmptyState icon={<PackageX />} title="سفارش پیدا نشد" />
  if (isLoading || !order) return <Skeleton className="h-96 rounded-brutal" />

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center gap-3">
        <Link to="/profile/orders" className={buttonVariants({ variant: 'outline', size: 'icon-sm' })} aria-label="بازگشت"><ChevronRight className="size-4" /></Link>
        <h1 className="font-display text-2xl">سفارش <bdi className="tabular-nums">{toFaDigits(order.number)}</bdi></h1>
        <span className={cn('rounded-md border-2 border-line px-2.5 py-1 text-xs font-black', ORDER_STATUS_TONE[order.status])}>{order.status_display}</span>
        <span className="text-sm text-muted">{jalaliDateTime(order.created_at)}</span>
      </div>

      <Card tone="calm" className="p-5"><Progress order={order} />
        {order.is_payable && (
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-brutal-sm border-2 border-dashed border-line bg-yellow/20 p-3">
            <p className="text-sm font-bold">این سفارش هنوز پرداخت نشده است.</p>
            <div className="flex gap-2">
              <Button size="sm" onClick={() => navigate(`/payment/result?order=${order.number}&status=failed`)}><CreditCard className="size-4" /> پرداخت</Button>
              <Button
                size="sm" variant="ghost" className="text-red" loading={cancel.isPending}
                onClick={() => cancel.mutate(order.number, {
                  onSuccess: () => toast('سفارش لغو شد و کالاها آزاد شدند.'),
                  onError: (e) => toast.error(errorMessage(e)),
                })}
              >
                لغو سفارش
              </Button>
            </div>
          </div>
        )}
      </Card>

      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
        <Card tone="calm" className="overflow-hidden">
          <h2 className="border-b-[length:var(--bw-soft)] border-line bg-surface-2 px-4 py-3 font-black">اقلام سفارش</h2>
          <ul>
            {order.items.map((item) => (
              <li key={item.id} className="flex flex-wrap items-center gap-x-4 gap-y-1 border-b border-line-soft px-4 py-3 last:border-0">
                <div className="min-w-0 flex-1">
                  {item.product_slug ? (
                    <Link to={`/product/${item.product_slug}`} className="font-bold hover:underline">{item.product_name}</Link>
                  ) : <span className="font-bold">{item.product_name}</span>}
                  <p className="text-xs text-muted">{[item.variant_label, `کد ${item.sku}`].filter(Boolean).join(' · ')}</p>
                </div>
                <div className="whitespace-nowrap text-left text-sm tabular-nums">
                  <p>{faNumber(item.quantity)} × {toman(item.final_unit_price)} ت</p>
                  {item.unit_discount > 0 && <p className="text-xs text-red line-through">{toman(item.unit_price)} ت</p>}
                </div>
                <p className="min-w-28 whitespace-nowrap text-left font-black tabular-nums">{toman(item.line_total)} ت</p>
              </li>
            ))}
          </ul>
          <div className="border-t-[length:var(--bw-soft)] border-line p-4">
            <SummaryRows
              rows={[
                ['جمع کالاها', order.subtotal],
                ...(order.discount_amount ? [[`کد تخفیف ${order.discount_code_text}`, order.discount_amount, 'text-red'] as [string, number, string]] : []),
                ['هزینه‌ی ارسال', order.shipping.cost],
              ]}
              total={order.total}
            />
          </div>
        </Card>

        <div className="flex flex-col gap-5">
          <Card tone="calm" className="p-4 text-sm">
            <h2 className="mb-2 flex items-center gap-2 font-black"><Truck className="size-4.5" /> ارسال</h2>
            <p>{order.shipping.method}</p>
            {order.shipping.tracking_code ? (
              <button
                className="mt-2 flex w-full items-center justify-between rounded-md border-2 border-dashed border-line bg-cyan/20 px-3 py-2 font-black"
                onClick={() => navigator.clipboard?.writeText(order.shipping.tracking_code).then(() => toast('کد رهگیری کپی شد'))}
              >
                <span>کد رهگیری: <bdi dir="ltr">{order.shipping.tracking_code}</bdi></span><Copy className="size-4" />
              </button>
            ) : <p className="mt-1 text-xs text-muted">کد رهگیری پس از ارسال نمایش داده می‌شود.</p>}
          </Card>
          {order.address && (
            <Card tone="calm" className="p-4 text-sm">
              <h2 className="mb-2 flex items-center gap-2 font-black"><MapPin className="size-4.5" /> تحویل گیرنده</h2>
              <p className="leading-6">{order.address.province}، {order.address.city}، {order.address.address}</p>
              <p className="mt-1 text-xs text-muted">{order.address.recipient_name} · <bdi>{toFaDigits(order.address.recipient_mobile)}</bdi> · کد پستی <bdi>{toFaDigits(order.address.postal_code)}</bdi></p>
            </Card>
          )}
          {order.payment && (
            <Card tone="calm" className="p-4 text-sm">
              <h2 className="mb-2 flex items-center gap-2 font-black"><CreditCard className="size-4.5" /> پرداخت</h2>
              <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5">
                <dt className="text-muted">درگاه</dt><dd className="font-bold">{order.payment.gateway_display}</dd>
                <dt className="text-muted">کد پیگیری بانک</dt><dd className="font-bold" dir="ltr">{order.payment.reference_number || '—'}</dd>
                <dt className="text-muted">زمان پرداخت</dt><dd className="font-bold">{jalaliDateTime(order.payment.paid_at ?? order.paid_at)}</dd>
              </dl>
            </Card>
          )}
          <Card tone="calm" className="p-4 text-sm">
            <h2 className="mb-3 font-black">تاریخچه</h2>
            <ol className="relative flex flex-col gap-4 border-s-2 border-line-soft ps-4">
              {order.history.map((entry, i) => (
                <li key={i} className="relative">
                  <span className={cn('absolute -start-[23px] top-1 size-3.5 rounded-full border-2 border-line', ORDER_STATUS_TONE[entry.status])} />
                  <p className="font-bold">{entry.status_display}</p>
                  <p className="text-xs text-muted">{jalaliDateTime(entry.created_at)}{entry.note && ` · ${entry.note}`}</p>
                </li>
              ))}
            </ol>
          </Card>
        </div>
      </div>
    </div>
  )
}
