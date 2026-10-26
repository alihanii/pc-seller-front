import { CheckCircle2, Clock, CreditCard, RefreshCw, XCircle } from 'lucide-react'
import { motion } from 'motion/react'
import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { toast } from 'sonner'

import { Container } from '@/components/layout/app-layout'
import { Button } from '@/components/ui/button'
import { buttonVariants } from '@/components/ui/button-variants'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Sticker } from '@/components/ui/sticker'
import { errorMessage } from '@/lib/api'
import { faNumber, toFaDigits, toman } from '@/lib/format'
import { redirectToGateway, usePaymentStatus, useStartPayment } from '@/lib/queries'
import { cn } from '@/lib/utils'
import { useAuth } from '@/stores/auth'

const CONFETTI = ['bg-yellow', 'bg-blue', 'bg-pink', 'bg-cyan', 'bg-green', 'bg-red']

function Confetti() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {Array.from({ length: 18 }, (_, i) => (
        <motion.span
          key={i}
          className={cn('absolute size-3 border-2 border-black', CONFETTI[i % CONFETTI.length], i % 3 === 0 && 'rounded-full')}
          style={{ left: `${(i * 37) % 100}%`, top: -20 }}
          initial={{ y: -20, rotate: 0, opacity: 1 }}
          animate={{ y: 420, rotate: 360 + i * 40, opacity: 0 }}
          transition={{ duration: 1.4 + (i % 5) * 0.2, delay: (i % 6) * 0.05, ease: 'easeIn' }}
        />
      ))}
    </div>
  )
}

function useCountdown(until: string | null) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])
  return until ? Math.max(0, Math.floor((new Date(until).getTime() - now) / 1000)) : 0
}

export function PaymentResultPage() {
  const [params] = useSearchParams()
  const number = params.get('order')
  const access = useAuth((s) => s.access)
  const { data, isLoading, refetch } = usePaymentStatus(access ? number : null)
  const start = useStartPayment()
  const [gateway, setGateway] = useState<string | null>(null)
  const left = useCountdown(data?.reservation_expires_at ?? null)

  const success = data ? data.is_paid : params.get('status') === 'success'
  const needsRefund = params.get('status') === 'needs_refund' || data?.last_payment?.status === 'needs_refund'
  const chosen = gateway ?? data?.gateways[0]?.bank_type

  if (access && isLoading) return <Container className="pt-10"><Skeleton className="mx-auto h-80 max-w-lg rounded-brutal" /></Container>

  return (
    <Container className="grid place-items-center pt-10">
      <Card className={cn('relative w-full max-w-lg overflow-hidden p-0', success ? 'bg-green/10' : '')}>
        {success && <Confetti />}
        <div className={cn('flex flex-col items-center gap-3 border-b-[length:var(--bw)] border-line px-6 py-8 text-center', success ? 'bg-green' : needsRefund ? 'bg-yellow' : 'bg-red')}>
          <motion.span
            initial={{ scale: 0, rotate: -30 }} animate={{ scale: 1, rotate: -6 }} transition={{ type: 'spring', stiffness: 380, damping: 14 }}
            className="grid size-20 place-items-center rounded-2xl border-brutal bg-surface text-ink shadow-brutal"
          >
            {success ? <CheckCircle2 className="size-10 text-green-ink" /> : <XCircle className="size-10 text-red-ink" />}
          </motion.span>
          <h1 className="font-display text-2xl text-[#0a0a0a]">
            {success ? 'پرداخت موفق بود!' : needsRefund ? 'پرداخت نیاز به بررسی دارد' : 'پرداخت انجام نشد'}
          </h1>
          {number && <Sticker tone="dark" tilt={3} wobble={false}>سفارش <bdi>{toFaDigits(number)}</bdi></Sticker>}
        </div>
        <div className="flex flex-col gap-4 p-6">
          {success && (
            <>
              <p className="text-center leading-7">سفارش شما ثبت شد و به‌زودی آماده‌ی ارسال می‌شود. وضعیت را از بخش سفارش‌ها دنبال کنید.</p>
              {data?.last_payment && (
                <dl className="grid grid-cols-2 gap-2 rounded-brutal-sm border-hairline bg-surface p-3 text-sm">
                  <dt className="text-muted">مبلغ</dt><dd className="font-bold">{toman(data.total)} تومان</dd>
                  <dt className="text-muted">درگاه</dt><dd className="font-bold">{data.last_payment.gateway_display}</dd>
                  <dt className="text-muted">کد پیگیری بانک</dt><dd className="font-bold" dir="ltr">{data.last_payment.reference_number || '—'}</dd>
                </dl>
              )}
              <Link to={number ? `/profile/orders/${number}` : '/profile/orders'} className={buttonVariants({ size: 'lg' })}>مشاهده‌ی سفارش</Link>
            </>
          )}
          {!success && needsRefund && (
            <p className="text-center leading-7">پرداخت شما دریافت شد اما سفارش قابل تکمیل نبود (مثلاً موجودی تمام شده بود). مبلغ ظرف ۷۲ ساعت به حسابتان برمی‌گردد. پشتیبانی با شما تماس می‌گیرد.</p>
          )}
          {!success && !needsRefund && (
            <>
              <p className="text-center leading-7">مبلغی از حسابتان کم نشده است؛ اگر کم شده باشد، تا ۷۲ ساعت برمی‌گردد.</p>
              {data?.can_retry ? (
                <>
                  <p className="flex items-center justify-center gap-2 text-sm font-bold">
                    <Clock className="size-4" /> کالاها تا
                    <span className="rounded-md bg-ink px-2 py-0.5 font-black text-yellow tabular-nums">
                      {faNumber(Math.floor(left / 60))}:{toFaDigits(String(left % 60).padStart(2, '0'))}
                    </span>
                    دیگر برایتان رزرو هستند.
                  </p>
                  <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="درگاه">
                    {data.gateways.map((g) => (
                      <button
                        key={g.bank_type} role="radio" aria-checked={chosen === g.bank_type} onClick={() => setGateway(g.bank_type)}
                        className={cn('flex items-center justify-center gap-2 rounded-brutal-sm border-brutal-soft py-2.5 text-sm font-black', chosen === g.bank_type ? 'bg-yellow text-[#0a0a0a] shadow-brutal-sm' : 'bg-surface')}
                      >
                        <CreditCard className="size-4" />{g.title}
                      </button>
                    ))}
                  </div>
                  <Button
                    size="lg" loading={start.isPending} disabled={!chosen}
                    onClick={() => number && chosen && start.mutate({ number, gateway: chosen }, {
                      onSuccess: (payment) => redirectToGateway(payment.gateway),
                      onError: (error) => {
                        toast.error(errorMessage(error))
                        refetch()
                      },
                    })}
                  >
                    <RefreshCw className="size-5" /> پرداخت دوباره
                  </Button>
                </>
              ) : data && (
                <p className="rounded-brutal-sm border-hairline bg-surface-2 p-3 text-center text-sm">مهلت پرداخت این سفارش تمام شده است؛ می‌توانید دوباره سفارش دهید.</p>
              )}
              <div className="flex justify-center gap-4 text-sm font-bold">
                {number && access && <Link to={`/profile/orders/${number}`} className="underline underline-offset-4">جزئیات سفارش</Link>}
                <Link to="/cart" className="underline underline-offset-4">بازگشت به سبد</Link>
              </div>
            </>
          )}
        </div>
      </Card>
    </Container>
  )
}
