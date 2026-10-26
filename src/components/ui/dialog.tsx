import * as RadixDialog from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

import { Button } from './button'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  children: ReactNode
  /** `drawer` slides in from the side (right in RTL), `modal` pops in the centre. */
  variant?: 'modal' | 'drawer'
  className?: string
}

export function Dialog({ open, onOpenChange, title, children, variant = 'modal', className }: Props) {
  return (
    <RadixDialog.Root open={open} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {open && (
          <RadixDialog.Portal forceMount>
            <RadixDialog.Overlay asChild>
              <motion.div
                className="fixed inset-0 z-50 bg-black/45"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}
              />
            </RadixDialog.Overlay>
            <RadixDialog.Content asChild aria-describedby={undefined}>
              <motion.div
                dir="rtl"
                className={cn(
                  'fixed z-50 flex flex-col bg-surface border-brutal shadow-brutal-lg focus:outline-none',
                  variant === 'drawer'
                    ? 'inset-y-0 right-0 w-[min(88vw,380px)] rounded-s-brutal border-e-0'
                    : 'left-1/2 top-1/2 max-h-[90dvh] w-[min(94vw,520px)] -translate-x-1/2 -translate-y-1/2 rounded-brutal',
                  className,
                )}
                initial={variant === 'drawer' ? { x: '100%' } : { opacity: 0, scale: 0.92, y: 12 }}
                animate={variant === 'drawer' ? { x: 0 } : { opacity: 1, scale: 1, y: 0 }}
                exit={variant === 'drawer' ? { x: '100%' } : { opacity: 0, scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 520, damping: 38 }}
              >
                <div className="flex items-center justify-between gap-3 border-b-[length:var(--bw-soft)] border-line px-5 py-3.5">
                  <RadixDialog.Title className="font-display text-lg">{title}</RadixDialog.Title>
                  <RadixDialog.Close asChild>
                    <Button variant="ghost" size="icon-sm" aria-label="بستن"><X className="size-5" /></Button>
                  </RadixDialog.Close>
                </div>
                <div className="flex-1 overflow-y-auto p-5">{children}</div>
              </motion.div>
            </RadixDialog.Content>
          </RadixDialog.Portal>
        )}
      </AnimatePresence>
    </RadixDialog.Root>
  )
}
