import { Headset, ShieldCheck, Truck, Undo2 } from 'lucide-react'
import { Link } from 'react-router'

import { Logo } from './header'

const PERKS = [
  { icon: Truck, title: 'ارسال سریع', text: 'پیک فوری در تهران' },
  { icon: ShieldCheck, title: 'ضمانت اصالت', text: 'همه‌ی کالاها اصل' },
  { icon: Undo2, title: '۷ روز بازگشت', text: 'بدون دردسر' },
  { icon: Headset, title: 'پشتیبانی واقعی', text: 'از ۹ تا ۲۱' },
]

export function Footer() {
  return (
    <footer className="mt-20 border-t-[length:var(--bw)] border-line bg-surface">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-4 px-4 py-8 md:grid-cols-4">
        {PERKS.map(({ icon: Icon, title, text }, i) => (
          <div key={title} className="flex items-center gap-3">
            <span className={`grid size-12 shrink-0 place-items-center rounded-lg border-brutal shadow-brutal-sm ${['bg-yellow', 'bg-cyan', 'bg-pink', 'bg-green'][i]} text-[#0a0a0a]`}>
              <Icon className="size-6" />
            </span>
            <span>
              <strong className="block font-black">{title}</strong>
              <span className="text-sm text-muted">{text}</span>
            </span>
          </div>
        ))}
      </div>
      <div className="border-t-[length:var(--bw-soft)] border-line-soft">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-8 md:flex-row md:items-start md:justify-between">
          <div className="max-w-sm">
            <Logo />
            <p className="mt-3 text-sm leading-7 text-muted">فروشگاه تخصصی قطعات کامپیوتر و تجهیزات گیمینگ. از انتخاب قطعه تا ارسال، کنارتان هستیم.</p>
          </div>
          <nav className="flex gap-10 text-sm font-bold" aria-label="پیوندهای فوتر">
            <ul className="space-y-2">
              <li><Link to="/about" className="hover:underline">درباره‌ی ما</Link></li>
              <li><Link to="/contact" className="hover:underline">تماس با ما</Link></li>
              <li><Link to="/terms" className="hover:underline">قوانین و مقررات</Link></li>
            </ul>
            <ul className="space-y-2">
              <li><Link to="/category/gpu" className="hover:underline">کارت گرافیک</Link></li>
              <li><Link to="/category/cpu" className="hover:underline">پردازنده</Link></li>
              <li><Link to="/category/ram" className="hover:underline">رم</Link></li>
            </ul>
          </nav>
        </div>
        <p className="border-t-[length:var(--bw-soft)] border-line-soft py-4 text-center text-xs text-muted">© پی‌سی‌سلر — همه‌ی قیمت‌ها به تومان است.</p>
      </div>
    </footer>
  )
}
