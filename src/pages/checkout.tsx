import { Bike, Building2, CreditCard, MapPin, Package, Plus, Store, Truck } from 'lucide-react'
import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router'
import { toast } from 'sonner'

import { AddressForm } from '@/components/address-form'
import { Container } from '@/components/layout/app-layout'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Dialog } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { errorMessage } from '@/lib/api'
import { faNumber, toFaDigits, toman } from '@/lib/format'
import {
  redirectToGateway, useAddresses, useCart, useCheckout, useGateways, useShippingOptions, useStartPayment,
} from '@/lib/queries'
import type { ShippingOption } from '@/lib/types'
import { cn } from '@/lib/utils'

import { DiscountBox, SummaryRows } from './cart'

const SHIPPING_ICONS: Record<ShippingOption['kind'], typeof Truck> = { post: Package, tipax: Truck, courier: Bike, pickup: Store }

function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <Card tone="calm" className="p-5">
      <h2 className="mb-4 flex items-center gap-3 font-display text-lg">
        <span className="grid size-8 rotate-[-6deg] place-items-center rounded-md border-brutal-soft bg-yellow text-sm text-[#0a0a0a]">{faNumber(n)}</span>
        {title}
      </h2>
      {children}
    </Card>
  )
}

function Choice({ selected, onSelect, children, disabled }: {
  selected: boolean; onSelect: () => void; children: React.ReactNode; disabled?: boolean
}) {
  return (
    <button
      type="button" role="radio" aria-checked={selected} disabled={disabled} onClick={onSelect}
      className={cn(
        'flex w-full items-start gap-3 rounded-brutal-sm border-brutal-soft p-3.5 text-start transition-all duration-150 disabled:opacity-50',
        selected ? 'bg-yellow/30 shadow-brutal-sm dark:bg-yellow/15' : 'border-line-soft bg-surface hover:border-line',
      )}
    >
      <span className={cn('mt-1 grid size-5 shrink-0 place-items-center rounded-full border-2 border-line', selected && 'bg-ink')}>
        {selected && <span className="size-2 rounded-full bg-yellow" />}
      </span>
      <span className="flex-1">{children}</span>
    </button>
  )
}

export function CheckoutPage() {
  const navigate = useNavigate()
  const { data: cart, isLoading: cartLoading } = useCart()
  const { data: addresses, isLoading: addressesLoading } = useAddresses()
  const { data: gateways } = useGateways()
  const [addressId, setAddressId] = useState<number | null>(null)
  const [shippingId, setShippingId] = useState<number | null>(null)
  const [gateway, setGateway] = useState<string | null>(null)
  const [note, setNote] = useState('')
  const [adding, setAdding] = useState(false)
  const checkout = useCheckout()
  const startPayment = useStartPayment()

  const address = addresses?.find((a) => a.id === addressId) ?? addresses?.find((a) => a.is_default) ?? addresses?.[0]
  const { data: shippingOptions, isFetching: shippingLoading } = useShippingOptions(address?.id ?? null)
  const shipping = shippingOptions?.find((s) => s.id === shippingId) ?? shippingOptions?.[0]
  const chosenGateway = gateway ?? gateways?.[0]?.bank_type ?? null

  if (cartLoading || addressesLoading) {
    return <Container className="space-y-4 pt-8"><Skeleton className="h-40 rounded-brutal" /><Skeleton className="h-40 rounded-brutal" /></Container>
  }
  if (!cart?.items.length && !checkout.isSuccess) return <Navigate to="/cart" replace />

  const placeOrder = () => {
    if (!shipping || !chosenGateway) return
    checkout.mutate(
      { shipping_method: shipping.id, address: shipping.requires_address ? address?.id ?? null : null, note },
      {
        onSuccess: (order) => {
          startPayment.mutate({ number: order.number, gateway: chosenGateway }, {
            onSuccess: (payment) => {
              toast.success('در حال انتقال به درگاه پرداخت…')
              redirectToGateway(payment.gateway)
            },
            onError: (error) => {
              toast.error(errorMessage(error))
              navigate(`/payment/result?order=${order.number}&status=failed`)
            },
          })
        },
        onError: (error) => toast.error(errorMessage(error)),
      },
    )
  }

  const total = cart ? cart.total + (shipping?.cost ?? 0) : 0
  const busy = checkout.isPending || startPayment.isPending

  return (
    <Container className="pt-6">
      <h1 className="mb-6 font-display text-3xl">تسویه‌حساب</h1>
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div className="flex flex-col gap-5">
          <Step n={1} title="آدرس تحویل">
            {addresses?.length ? (
              <div className="flex flex-col gap-2.5" role="radiogroup" aria-label="آدرس">
                {addresses.map((a) => (
                  <Choice key={a.id} selected={a.id === address?.id} onSelect={() => { setAddressId(a.id); setShippingId(null) }}>
                    <span className="flex items-center gap-2 font-black">
                      <MapPin className="size-4 text-blue" />{a.title || a.recipient_name}
                      {a.is_default && <span className="rounded border border-line px-1.5 text-[11px]">پیش‌فرض</span>}
                    </span>
                    <span className="mt-1 block text-sm leading-6 text-muted">{a.full_address}</span>
                    <span className="mt-0.5 block text-xs text-muted">{a.recipient_name} · <bdi>{toFaDigits(a.recipient_mobile)}</bdi></span>
                  </Choice>
                ))}
              </div>
            ) : (
              <p className="mb-3 text-sm text-muted">هنوز آدرسی ثبت نکرده‌اید.</p>
            )}
            <Button variant="outline" size="sm" className="mt-3" onClick={() => setAdding(true)}><Plus className="size-4" /> آدرس جدید</Button>
          </Step>

          <Step n={2} title="روش ارسال">
            {shippingLoading && !shippingOptions ? <Skeleton className="h-20" /> : (
              <div className="grid gap-2.5 sm:grid-cols-2" role="radiogroup" aria-label="روش ارسال">
                {shippingOptions?.map((option) => {
                  const Icon = SHIPPING_ICONS[option.kind] ?? Building2
                  return (
                    <Choice key={option.id} selected={option.id === shipping?.id} onSelect={() => setShippingId(option.id)}>
                      <span className="flex items-center justify-between gap-2">
                        <span className="flex items-center gap-2 font-black"><Icon className="size-4.5" />{option.name}</span>
                        <span className="text-sm font-black tabular-nums">{option.cost ? `${toman(option.cost)} ت` : 'رایگان'}</span>
                      </span>
                      <span className="mt-1 block text-xs text-muted">{[option.estimated_delivery, option.description].filter(Boolean).join(' · ')}</span>
                    </Choice>
                  )
                })}
              </div>
            )}
          </Step>

          <Step n={3} title="درگاه پرداخت">
            <div className="grid gap-2.5 sm:grid-cols-2" role="radiogroup" aria-label="درگاه پرداخت">
              {gateways?.map((g) => (
                <Choice key={g.bank_type} selected={g.bank_type === chosenGateway} onSelect={() => setGateway(g.bank_type)}>
                  <span className="flex items-center gap-2 font-black"><CreditCard className="size-4.5" />{g.title}</span>
                  <span className="mt-1 block text-xs text-muted">پرداخت امن با همه‌ی کارت‌های شتاب</span>
                </Choice>
              ))}
            </div>
            <label className="mt-4 flex flex-col gap-1.5 text-sm font-bold">
              یادداشت برای فروشگاه (اختیاری)
              <Textarea value={note} onChange={(e) => setNote(e.target.value)} maxLength={1000} className="min-h-16" />
            </label>
          </Step>
        </div>

        <Card className="sticky top-44 flex flex-col gap-4 p-5">
          <h2 className="font-display text-lg">سفارش شما</h2>
          <ul className="flex max-h-56 flex-col gap-2 overflow-y-auto">
            {cart?.items.map((item) => (
              <li key={item.id} className="flex items-center gap-3 text-sm">
                <span className="relative size-12 shrink-0 overflow-hidden rounded-md border-hairline">
                  {item.product.image && <img src={item.product.image} alt="" className="size-full object-cover" />}
                  <span className="absolute -top-0 -left-0 grid size-5 place-items-center rounded-br-md bg-ink text-[10px] font-black text-bg">{faNumber(item.quantity)}</span>
                </span>
                <span className="line-clamp-2 flex-1 leading-5">{item.product.name}</span>
              </li>
            ))}
          </ul>
          {cart && (
            <>
              <SummaryRows
                rows={[
                  ['قیمت کالاها', cart.subtotal + cart.items_discount],
                  ...(cart.items_discount ? [['تخفیف کالاها', cart.items_discount, 'text-red'] as [string, number, string]] : []),
                  ...(cart.discount?.amount ? [['کد تخفیف', cart.discount.amount, 'text-red'] as [string, number, string]] : []),
                  ['هزینه‌ی ارسال', shipping?.cost ?? 0],
                ]}
                total={total}
              />
              <DiscountBox cart={cart} />
            </>
          )}
          <Button size="lg" onClick={placeOrder} loading={busy} disabled={!shipping || !chosenGateway || (shipping.requires_address && !address)}>
            ثبت سفارش و پرداخت
          </Button>
          <p className="text-center text-xs leading-5 text-muted">
            با ثبت سفارش <Link to="/terms" className="underline">قوانین فروشگاه</Link> را می‌پذیرید. کالاها تا پایان مهلت پرداخت برایتان رزرو می‌شوند.
          </p>
        </Card>
      </div>

      <Dialog open={adding} onOpenChange={setAdding} title="آدرس جدید" className="w-[min(94vw,640px)]">
        <AddressForm onSaved={(saved) => { setAddressId(saved.id); setShippingId(null); setAdding(false) }} />
      </Dialog>
    </Container>
  )
}
