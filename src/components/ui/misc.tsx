import { Star } from 'lucide-react'
import type { ReactNode } from 'react'

import { faNumber } from '@/lib/format'
import { cn } from '@/lib/utils'

export function EmptyState({ icon, title, text, action, className }: {
  icon: ReactNode; title: string; text?: string; action?: ReactNode; className?: string
}) {
  return (
    <div className={cn('flex flex-col items-center gap-3 rounded-brutal border-[length:var(--bw-soft)] border-dashed border-line bg-surface/60 px-6 py-12 text-center', className)}>
      <div className="grid size-20 rotate-[-4deg] place-items-center rounded-2xl border-brutal bg-yellow text-[#0a0a0a] shadow-brutal [&_svg]:size-9">
        {icon}
      </div>
      <h3 className="mt-2 font-display text-xl">{title}</h3>
      {text && <p className="max-w-sm text-sm text-muted">{text}</p>}
      {action}
    </div>
  )
}

export function Stars({ value, size = 14, className }: { value: number; size?: number; className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-0.5', className)} aria-label={`امتیاز ${faNumber(value)} از ۵`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          style={{ width: size, height: size }}
          className={cn('stroke-[2.5]', i <= Math.round(value) ? 'fill-yellow text-ink' : 'text-line-soft')}
        />
      ))}
    </span>
  )
}

export function SectionTitle({ title, kicker, action, className }: {
  title: string; kicker?: string; action?: ReactNode; className?: string
}) {
  return (
    <div className={cn('mb-5 flex items-end justify-between gap-4', className)}>
      <div>
        {kicker && <span className="mb-1 block text-xs font-black tracking-widest text-blue-ink uppercase">{kicker}</span>}
        <h2 className="font-display text-2xl sm:text-3xl">
          <span className="bg-[linear-gradient(transparent_62%,var(--c-yellow)_62%)] px-1">{title}</span>
        </h2>
      </div>
      {action}
    </div>
  )
}

export function Marquee({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('group overflow-hidden', className)}>
      <div className="flex w-max animate-marquee gap-10 group-hover:[animation-play-state:paused]">
        <div className="flex shrink-0 items-center gap-10">{children}</div>
        <div className="flex shrink-0 items-center gap-10" aria-hidden>{children}</div>
      </div>
    </div>
  )
}
