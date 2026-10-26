import type { CSSProperties, ReactNode } from 'react'

import { cn } from '@/lib/utils'

const tones = {
  yellow: 'bg-yellow text-[#0a0a0a]',
  red: 'bg-red text-[#0a0a0a]',
  blue: 'bg-blue text-on-blue',
  pink: 'bg-pink text-[#0a0a0a]',
  green: 'bg-green text-[#0a0a0a]',
  cyan: 'bg-cyan text-[#0a0a0a]',
  dark: 'bg-ink text-bg',
}

/** A rotated, slightly wobbling badge. */
export function Sticker({
  children, tone = 'yellow', tilt = -6, wobble = true, className,
}: { children: ReactNode; tone?: keyof typeof tones; tilt?: number; wobble?: boolean; className?: string }) {
  return (
    <span
      style={{ '--tilt': `${tilt}deg`, transform: `rotate(${tilt}deg)` } as CSSProperties}
      className={cn(
        'inline-flex items-center gap-1 rounded-md border-brutal-soft px-2 py-0.5 text-xs font-black shadow-brutal-sm',
        wobble && 'animate-wobble',
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  )
}

export function Chip({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-1 rounded-full border-hairline bg-surface-2 px-2.5 py-0.5 text-xs font-bold', className)}>
      {children}
    </span>
  )
}
