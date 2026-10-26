import { Mail, MapPin, Phone } from 'lucide-react'

import { Container } from '@/components/layout/app-layout'
import { Card } from '@/components/ui/card'
import { Sticker } from '@/components/ui/sticker'

const PAGES = {
  about: {
    title: 'درباره‌ی ما',
    sticker: 'از ۱۴۰۳',
    body: [
      'پی‌سی‌سلر را چند علاقه‌مند به سخت‌افزار راه انداختند که از خرید قطعه با قیمت‌های مبهم و ارسال‌های طولانی خسته شده بودند.',
      'ما فقط کالای اصل با فاکتور رسمی می‌فروشیم، موجودی را لحظه‌ای نمایش می‌دهیم و در انتخاب قطعه‌ی مناسب سیستمتان کنارتان هستیم.',
    ],
  },
  contact: {
    title: 'تماس با ما',
    sticker: 'پاسخ سریع',
    body: ['پشتیبانی هر روز از ساعت ۹ تا ۲۱ پاسخگوی شماست. برای پیگیری سفارش، شماره‌ی سفارش را آماده داشته باشید.'],
  },
  terms: {
    title: 'قوانین و مقررات',
    sticker: 'شفاف',
    body: [
      'قیمت‌ها به تومان و شامل مالیات بر ارزش افزوده است. کالاهای سفارش تا پایان مهلت پرداخت برای شما رزرو می‌شوند.',
      'امکان بازگشت کالای سالم و بدون استفاده تا ۷ روز پس از تحویل وجود دارد. هزینه‌ی ارسال مرجوعی در صورت ایراد کالا با فروشگاه است.',
      'اطلاعات شما فقط برای پردازش سفارش استفاده می‌شود و در اختیار دیگران قرار نمی‌گیرد.',
    ],
  },
} as const

export function StaticPage({ page }: { page: keyof typeof PAGES }) {
  const content = PAGES[page]
  return (
    <Container className="max-w-3xl pt-10">
      <div className="relative">
        <Sticker tone="cyan" tilt={-7} className="absolute -top-3 left-6 z-10 text-sm">{content.sticker}</Sticker>
        <Card className="p-6 sm:p-10">
          <h1 className="mb-6 font-display text-4xl">{content.title}</h1>
          <div className="space-y-4 text-[15px] leading-8">{content.body.map((p) => <p key={p}>{p}</p>)}</div>
          {page === 'contact' && (
            <ul className="mt-8 grid gap-3 sm:grid-cols-3">
              {[[Phone, '۰۲۱-۱۲۳۴۵۶۷۸'], [Mail, 'support@pcseller.example'], [MapPin, 'تهران، خیابان جمهوری']].map(([Icon, text], i) => {
                const I = Icon as typeof Phone
                return (
                  <li key={i} className="flex items-center gap-2 rounded-brutal-sm border-brutal-soft bg-surface-2 p-3 text-sm font-bold">
                    <I className="size-5 shrink-0 text-blue-ink" /><span dir="auto">{text as string}</span>
                  </li>
                )
              })}
            </ul>
          )}
        </Card>
      </div>
    </Container>
  )
}
