import { useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { ArrowRight, MessageSquareCode, Smartphone } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { Navigate, useNavigate, useSearchParams } from 'react-router'
import { toast } from 'sonner'

import { Container } from '@/components/layout/app-layout'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Sticker } from '@/components/ui/sticker'
import { api, errorMessage } from '@/lib/api'
import { faNumber, toEnDigits, toFaDigits } from '@/lib/format'
import type { User } from '@/lib/types'
import { cn } from '@/lib/utils'
import { useAuth } from '@/stores/auth'
import { useCartStore } from '@/stores/cart'

const CODE_LENGTH = 5
const RESEND_SECONDS = 120

function OtpInput({ value, onChange, disabled, error }: {
  value: string; onChange: (value: string) => void; disabled?: boolean; error?: boolean
}) {
  const inputs = useRef<(HTMLInputElement | null)[]>([])
  useEffect(() => inputs.current[0]?.focus(), [])

  const setFrom = (index: number, raw: string) => {
    const digits = toEnDigits(raw).replace(/\D/g, '')
    if (!digits) return
    const next = (value.slice(0, index) + digits).slice(0, CODE_LENGTH)
    onChange(next)
    inputs.current[Math.min(next.length, CODE_LENGTH - 1)]?.focus()
  }

  return (
    // Codes are typed left to right even in RTL.
    <motion.div dir="ltr" className="flex justify-center gap-2 sm:gap-3" animate={error ? { x: [0, -10, 10, -6, 6, 0] } : {}} transition={{ duration: 0.35 }}>
      {Array.from({ length: CODE_LENGTH }, (_, i) => (
        <input
          key={i}
          ref={(node) => { inputs.current[i] = node }}
          inputMode="numeric"
          autoComplete={i === 0 ? 'one-time-code' : 'off'}
          aria-label={`رقم ${faNumber(i + 1)}`}
          disabled={disabled}
          value={value[i] ? toFaDigits(value[i]) : ''}
          onChange={(e) => setFrom(i, e.target.value)}
          onPaste={(e) => {
            e.preventDefault()
            setFrom(0, e.clipboardData.getData('text'))
          }}
          onKeyDown={(e) => {
            if (e.key === 'Backspace') {
              e.preventDefault()
              onChange(value.slice(0, value[i] ? i : Math.max(0, i - 1)))
              inputs.current[Math.max(0, value[i] ? i : i - 1)]?.focus()
            }
          }}
          className={cn(
            'size-13 rounded-brutal-sm border-brutal bg-surface text-center font-display text-2xl shadow-brutal-sm transition-all focus:-translate-y-0.5 focus:bg-yellow focus:text-[#0a0a0a] focus:shadow-brutal focus:outline-none sm:size-15',
            value[i] && 'bg-yellow/60 text-[#0a0a0a]',
            error && 'border-red',
          )}
        />
      ))}
    </motion.div>
  )
}

export function LoginPage() {
  const [params] = useSearchParams()
  const next = params.get('next') || '/profile'
  // Only someone already logged in when the page opens is sent on; after a login here we navigate ourselves
  // (the page stays mounted briefly during its exit animation and must not redirect again).
  const [alreadyLoggedIn] = useState(() => !!useAuth.getState().access)
  const navigate = useNavigate()
  const client = useQueryClient()
  const [step, setStep] = useState<'mobile' | 'code'>('mobile')
  const [mobile, setMobile] = useState('')
  const [code, setCode] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [wait, setWait] = useState(0)

  useEffect(() => {
    if (wait <= 0) return
    const id = setTimeout(() => setWait((w) => w - 1), 1000)
    return () => clearTimeout(id)
  }, [wait])

  const requestCode = async () => {
    setBusy(true)
    setError('')
    try {
      await api.post('/auth/otp/request/', { mobile: toEnDigits(mobile) })
      setStep('code')
      setCode('')
      setWait(RESEND_SECONDS)
      toast.success('کد ورود پیامک شد')
    } catch (e) {
      if (axios.isAxiosError(e) && e.response?.status === 429) {
        const retry = Number((e.response.data as { retry_after?: number }).retry_after ?? 0)
        if (retry) {
          setStep('code')
          setWait(retry)
        }
      }
      setError(errorMessage(e))
    } finally {
      setBusy(false)
    }
  }

  const verify = async (value: string) => {
    setBusy(true)
    setError('')
    try {
      const cartToken = useCartStore.getState().token
      const { data } = await api.post<{ access: string; refresh: string; is_new_user: boolean; user: User }>(
        '/auth/otp/verify/', { mobile: toEnDigits(mobile), code: value, ...(cartToken ? { cart_token: cartToken } : {}) },
      )
      useAuth.getState().setTokens(data.access, data.refresh)
      useAuth.getState().setUser(data.user)
      useCartStore.getState().setToken(null)
      await client.invalidateQueries()
      toast.success(data.is_new_user ? 'خوش آمدید! حساب شما ساخته شد.' : 'خوش برگشتید!')
      navigate(data.is_new_user && next === '/profile' ? '/profile' : next, { replace: true })
    } catch (e) {
      setError(errorMessage(e))
      setCode('')
    } finally {
      setBusy(false)
    }
  }

  if (alreadyLoggedIn) return <Navigate to={next} replace />

  return (
    <Container className="grid min-h-[70dvh] grid-cols-1 place-items-center py-10">
      <div className="relative w-full max-w-md">
        <Sticker tone="pink" tilt={8} className="absolute -top-4 left-2 z-10 text-sm sm:-left-3">بدون رمز عبور!</Sticker>
        <Card className="overflow-hidden p-0">
          <div className="border-b-[length:var(--bw)] border-line bg-yellow px-6 py-5 text-[#0a0a0a]">
            <span className="grid size-12 place-items-center rounded-lg border-brutal bg-surface text-ink shadow-brutal-sm">
              {step === 'mobile' ? <Smartphone className="size-6" /> : <MessageSquareCode className="size-6" />}
            </span>
            <h1 className="mt-3 font-display text-2xl">{step === 'mobile' ? 'ورود یا ثبت‌نام' : 'کد تأیید را وارد کنید'}</h1>
            <p className="mt-1 text-sm font-medium">
              {step === 'mobile'
                ? 'شماره موبایلتان را وارد کنید؛ اگر حساب نداشته باشید، خودکار ساخته می‌شود.'
                : <>کد {faNumber(CODE_LENGTH)} رقمی به <bdi className="font-black">{toFaDigits(toEnDigits(mobile))}</bdi> پیامک شد.</>}
            </p>
          </div>
          <div className="p-6">
            <AnimatePresence mode="wait" initial={false}>
              {step === 'mobile' ? (
                <motion.form
                  key="mobile"
                  initial={{ x: -30, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 30, opacity: 0 }} transition={{ duration: 0.18 }}
                  onSubmit={(e) => {
                    e.preventDefault()
                    requestCode()
                  }}
                  className="flex flex-col gap-4"
                >
                  <label className="flex flex-col gap-2">
                    <span className="text-sm font-bold">شماره موبایل</span>
                    <input
                      autoFocus inputMode="tel" autoComplete="tel" dir="ltr" placeholder="۰۹۱۲ ۱۲۳ ۴۵۶۷"
                      value={mobile} onChange={(e) => setMobile(toFaDigits(e.target.value))}
                      className="h-14 w-full min-w-0 rounded-brutal-sm border-brutal bg-surface px-4 text-center font-display text-2xl tracking-[0.15em] shadow-brutal-sm placeholder:text-muted/40 focus:shadow-brutal focus:outline-none"
                    />
                  </label>
                  {error && <p className="text-sm font-bold text-red-ink" role="alert">{error}</p>}
                  <Button size="lg" type="submit" loading={busy} disabled={toEnDigits(mobile).replace(/\D/g, '').length < 10}>دریافت کد</Button>
                </motion.form>
              ) : (
                <motion.div
                  key="code"
                  initial={{ x: -30, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 30, opacity: 0 }} transition={{ duration: 0.18 }}
                  className="flex flex-col gap-5"
                >
                  <OtpInput
                    value={code}
                    disabled={busy}
                    error={!!error}
                    onChange={(value) => {
                      setCode(value)
                      if (value.length === CODE_LENGTH) verify(value)
                    }}
                  />
                  {error && <p className="text-center text-sm font-bold text-red-ink" role="alert">{error}</p>}
                  <Button size="lg" variant="blue" loading={busy} disabled={code.length < CODE_LENGTH} onClick={() => verify(code)}>ورود</Button>
                  <div className="flex items-center justify-between text-sm">
                    <button className="flex items-center gap-1 font-bold text-muted hover:text-ink" onClick={() => { setStep('mobile'); setError('') }}>
                      <ArrowRight className="size-4" /> تغییر شماره
                    </button>
                    {wait > 0 ? (
                      <span className="font-bold tabular-nums text-muted">ارسال دوباره تا {faNumber(Math.floor(wait / 60))}:{toFaDigits(String(wait % 60).padStart(2, '0'))}</span>
                    ) : (
                      <button className="font-black text-blue-ink underline underline-offset-4" onClick={requestCode} disabled={busy}>ارسال دوباره‌ی کد</button>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </Card>
      </div>
    </Container>
  )
}
