import { useState } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Field, Input, Select, Textarea } from '@/components/ui/input'
import { errorMessage, fieldErrors } from '@/lib/api'
import { toEnDigits, toFaDigits } from '@/lib/format'
import { useProvinces, useSaveAddress } from '@/lib/queries'
import type { Address } from '@/lib/types'

export function AddressForm({ address, onSaved }: { address?: Address; onSaved: (address: Address) => void }) {
  const { data: provinces } = useProvinces()
  const save = useSaveAddress()
  const [form, setForm] = useState({
    title: address?.title ?? '',
    recipient_name: address?.recipient_name ?? '',
    recipient_mobile: toFaDigits(address?.recipient_mobile ?? ''),
    province: address?.province ?? 0,
    city: address?.city ?? 0,
    address: address?.address ?? '',
    plaque: address?.plaque ?? '',
    unit: address?.unit ?? '',
    postal_code: toFaDigits(address?.postal_code ?? ''),
    is_default: address?.is_default ?? false,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const cities = provinces?.find((p) => p.id === Number(form.province))?.cities ?? []
  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }))

  return (
    <form
      className="grid gap-4 sm:grid-cols-2"
      onSubmit={(e) => {
        e.preventDefault()
        save.mutate(
          {
            ...form, id: address?.id, province: Number(form.province), city: Number(form.city),
            recipient_mobile: toEnDigits(form.recipient_mobile), postal_code: toEnDigits(form.postal_code),
          },
          {
            onSuccess: (saved) => {
              toast.success('آدرس ذخیره شد')
              onSaved(saved)
            },
            onError: (error) => {
              setErrors(fieldErrors(error))
              toast.error(errorMessage(error, 'اطلاعات آدرس را بررسی کنید.'))
            },
          },
        )
      }}
    >
      <Field label="عنوان (مثلاً خانه)" error={errors.title}><Input value={form.title} onChange={set('title')} /></Field>
      <Field label="نام گیرنده" error={errors.recipient_name}><Input required value={form.recipient_name} onChange={set('recipient_name')} /></Field>
      <Field label="موبایل گیرنده" error={errors.recipient_mobile}>
        <Input required dir="ltr" inputMode="tel" value={form.recipient_mobile} onChange={(e) => setForm((f) => ({ ...f, recipient_mobile: toFaDigits(e.target.value) }))} />
      </Field>
      <Field label="کد پستی" error={errors.postal_code} hint="۱۰ رقم، بدون خط تیره">
        <Input required dir="ltr" inputMode="numeric" value={form.postal_code} onChange={(e) => setForm((f) => ({ ...f, postal_code: toFaDigits(e.target.value) }))} />
      </Field>
      <Field label="استان" error={errors.province}>
        <Select required value={form.province} onChange={(e) => setForm((f) => ({ ...f, province: Number(e.target.value), city: 0 }))}>
          <option value={0} disabled>انتخاب استان</option>
          {provinces?.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </Select>
      </Field>
      <Field label="شهر" error={errors.city}>
        <Select required value={form.city} onChange={(e) => setForm((f) => ({ ...f, city: Number(e.target.value) }))} disabled={!cities.length}>
          <option value={0} disabled>انتخاب شهر</option>
          {cities.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </Select>
      </Field>
      <Field label="نشانی" error={errors.address} className="sm:col-span-2"><Textarea required value={form.address} onChange={set('address')} /></Field>
      <Field label="پلاک" error={errors.plaque}><Input value={form.plaque} onChange={set('plaque')} /></Field>
      <Field label="واحد" error={errors.unit}><Input value={form.unit} onChange={set('unit')} /></Field>
      <label className="flex items-center gap-2 text-sm font-bold sm:col-span-2">
        <input type="checkbox" className="size-4 accent-[var(--c-blue)]" checked={form.is_default} onChange={(e) => setForm((f) => ({ ...f, is_default: e.target.checked }))} />
        آدرس پیش‌فرض باشد
      </label>
      <Button type="submit" variant="blue" loading={save.isPending} className="sm:col-span-2">ذخیره‌ی آدرس</Button>
    </form>
  )
}
