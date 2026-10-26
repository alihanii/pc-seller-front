import { cn } from '@/lib/utils'

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        'animate-shimmer rounded-brutal-sm bg-[linear-gradient(90deg,var(--c-surface-2)_25%,var(--c-line-soft)_50%,var(--c-surface-2)_75%)] bg-[length:200%_100%]',
        className,
      )}
    />
  )
}
