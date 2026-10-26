import { MapPin, Pencil, Plus, Star, Trash2 } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useState } from 'react'
import { toast } from 'sonner'

import { AddressForm } from '@/components/address-form'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Dialog } from '@/components/ui/dialog'
import { EmptyState } from '@/components/ui/misc'
import { Skeleton } from '@/components/ui/skeleton'
import { Sticker } from '@/components/ui/sticker'
import { toFaDigits } from '@/lib/format'
import { useAddresses, useDeleteAddress, useSetDefaultAddress } from '@/lib/queries'
import type { Address } from '@/lib/types'

export function AddressesPage() {
  const { data: addresses, isLoading } = useAddresses()
  const remove = useDeleteAddress()
  const setDefault = useSetDefaultAddress()
  const [editing, setEditing] = useState<Address | 'new' | null>(null)

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <h1 className="font-display text-2xl">آدرس‌ها</h1>
        <Button size="sm" onClick={() => setEditing('new')}><Plus className="size-4" /> آدرس جدید</Button>
      </div>
      {isLoading && <Skeleton className="h-32 rounded-brutal" />}
      {addresses?.length === 0 && (
        <EmptyState icon={<MapPin />} title="هنوز آدرسی ندارید" text="یک آدرس اضافه کنید تا خرید بعدی سریع‌تر شود." action={<Button onClick={() => setEditing('new')}>افزودن آدرس</Button>} />
      )}
      <ul className="grid gap-4 md:grid-cols-2">
        <AnimatePresence initial={false}>
          {addresses?.map((address) => (
            <motion.li key={address.id} layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}>
              <Card tone="calm" className="relative flex h-full flex-col gap-2 p-4">
                {address.is_default && <Sticker tone="yellow" tilt={6} wobble={false} className="absolute -top-3 left-4">پیش‌فرض</Sticker>}
                <p className="flex items-center gap-2 font-black"><MapPin className="size-4 text-blue-ink" />{address.title || 'آدرس'}</p>
                <p className="text-sm leading-6">{address.full_address}</p>
                <p className="text-xs text-muted">
                  {address.recipient_name} · <bdi>{toFaDigits(address.recipient_mobile)}</bdi> · کد پستی <bdi>{toFaDigits(address.postal_code)}</bdi>
                </p>
                <div className="mt-auto flex flex-wrap gap-2 pt-2">
                  <Button size="sm" variant="outline" onClick={() => setEditing(address)}><Pencil className="size-3.5" /> ویرایش</Button>
                  {!address.is_default && (
                    <Button size="sm" variant="outline" onClick={() => setDefault.mutate(address.id)}><Star className="size-3.5" /> پیش‌فرض</Button>
                  )}
                  <Button
                    size="sm" variant="ghost" className="text-red-ink"
                    onClick={() => remove.mutate(address.id, { onSuccess: () => toast('آدرس حذف شد') })}
                  >
                    <Trash2 className="size-3.5" /> حذف
                  </Button>
                </div>
              </Card>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
      <Dialog open={editing !== null} onOpenChange={(open) => !open && setEditing(null)} title={editing === 'new' ? 'آدرس جدید' : 'ویرایش آدرس'} className="w-[min(94vw,640px)]">
        {editing !== null && (
          <AddressForm key={editing === 'new' ? 'new' : editing.id} address={editing === 'new' ? undefined : editing} onSaved={() => setEditing(null)} />
        )}
      </Dialog>
    </div>
  )
}
