import { useState } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Field, Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { errorMessage, fieldErrors } from '@/lib/api'
import { jalaliDate, toFaDigits } from '@/lib/format'
import { useMe, useUpdateMe } from '@/lib/queries'
import type { User } from '@/lib/types'

function ProfileForm({ me }: { me: User }) {
  const update = useUpdateMe()
  const [form, setForm] = useState({ first_name: me.first_name, last_name: me.last_name, email: me.email })
  const [errors, setErrors] = useState<Record<string, string>>({})
  return (
    <form
      className="grid gap-4 sm:grid-cols-2"
      onSubmit={(e) => {
        e.preventDefault()
        update.mutate(form, {
          onSuccess: () => {
            setErrors({})
            toast.success('اطلاعات ذخیره شد')
          },
          onError: (error) => {
            setErrors(fieldErrors(error))
            toast.error(errorMessage(error))
          },
        })
      }}
    >
      <Field label="نام" error={errors.first_name}><Input value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} /></Field>
      <Field label="نام خانوادگی" error={errors.last_name}><Input value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} /></Field>
      <Field label="ایمیل" error={errors.email} hint="برای دریافت اطلاع‌رسانی سفارش‌ها (اختیاری)">
        <Input type="email" dir="ltr" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
      </Field>
      <Field label="شماره موبایل" hint="شماره‌ی ورود قابل تغییر نیست">
        <Input value={toFaDigits(me.mobile)} disabled dir="ltr" />
      </Field>
      <div className="flex items-center justify-between gap-3 sm:col-span-2">
        <span className="text-xs text-muted">عضو از {jalaliDate(me.date_joined)}</span>
        <Button type="submit" variant="blue" loading={update.isPending}>ذخیره‌ی تغییرات</Button>
      </div>
    </form>
  )
}

export function ProfileInfoPage() {
  const { data: me } = useMe()
  return (
    <Card tone="calm" className="p-5 sm:p-6">
      <h1 className="mb-5 font-display text-2xl">اطلاعات حساب</h1>
      {me ? <ProfileForm key={me.id} me={me} /> : <Skeleton className="h-48" />}
    </Card>
  )
}
