import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react'

import { cn } from '@/lib/utils'

const field =
  'w-full rounded-brutal-sm border-brutal-soft bg-surface px-3.5 text-[15px] text-ink placeholder:text-muted/70 transition-shadow focus:shadow-brutal-sm focus:outline-none disabled:opacity-60'

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(field, 'h-11', className)} {...props} />
}

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn(field, 'min-h-24 py-2.5', className)} {...props} />
}

export function Select({ className, children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={cn(field, 'h-11 appearance-none bg-[length:12px] pe-8', className)} {...props}>
      {children}
    </select>
  )
}

export function Field({ label, error, hint, children, className }: {
  label: string; error?: string; hint?: string; children: ReactNode; className?: string
}) {
  return (
    <label className={cn('flex flex-col gap-1.5', className)}>
      <span className="text-sm font-bold">{label}</span>
      {children}
      {error ? <span className="text-xs font-bold text-red">{error}</span> : hint && <span className="text-xs text-muted">{hint}</span>}
    </label>
  )
}
