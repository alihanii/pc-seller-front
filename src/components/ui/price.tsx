import { animate, useReducedMotion } from 'motion/react'
import { useEffect, useRef } from 'react'

import { faNumber, rialToToman } from '@/lib/format'
import { cn } from '@/lib/utils'

/** Animates from the previous value to the new one (e.g. when a variant changes). */
export function NumberTicker({ value, className }: { value: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const previous = useRef(value)
  const reduce = useReducedMotion()

  useEffect(() => {
    const node = ref.current
    if (!node) return
    if (reduce || previous.current === value) {
      node.textContent = faNumber(value)
      previous.current = value
      return
    }
    const controls = animate(previous.current, value, {
      duration: 0.3,
      ease: 'easeOut',
      onUpdate: (latest) => {
        node.textContent = faNumber(Math.round(latest))
      },
    })
    previous.current = value
    return () => controls.stop()
  }, [value, reduce])

  return <span ref={ref} className={className}>{faNumber(value)}</span>
}

export function Price({ rial, original, size = 'md', animated = false, className }: {
  rial: number; original?: number | null; size?: 'sm' | 'md' | 'lg'; animated?: boolean; className?: string
}) {
  const toman = rialToToman(rial)
  const sizes = { sm: 'text-base', md: 'text-lg', lg: 'text-3xl' }
  return (
    <div className={cn('flex flex-col items-start', className)}>
      {original != null && original > rial && (
        <span className="text-xs font-bold text-muted line-through decoration-red decoration-2">{faNumber(rialToToman(original))}</span>
      )}
      <span className={cn('font-display tabular-nums', sizes[size])}>
        {animated ? <NumberTicker value={toman} /> : faNumber(toman)}
        <span className="ms-1 text-xs font-bold text-muted">تومان</span>
      </span>
    </div>
  )
}
