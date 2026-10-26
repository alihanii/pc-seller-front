import type { HTMLAttributes } from 'react'

import { cn } from '@/lib/utils'

/** `loud` is the full Neo-Brutalist card; `calm` is the toned-down one for forms, tables and the cart. */
export function Card({ className, tone = 'loud', ...props }: HTMLAttributes<HTMLDivElement> & { tone?: 'loud' | 'calm' }) {
  return (
    <div
      className={cn(
        'rounded-brutal bg-surface',
        tone === 'loud' ? 'border-brutal shadow-brutal' : 'border-brutal-soft shadow-brutal-sm',
        className,
      )}
      {...props}
    />
  )
}
