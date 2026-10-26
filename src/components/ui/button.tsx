import { cva, type VariantProps } from 'class-variance-authority'
import { Loader2 } from 'lucide-react'
import type { ButtonHTMLAttributes, Ref } from 'react'

import { cn } from '@/lib/utils'

export const buttonVariants = cva(
  [
    'relative inline-flex select-none items-center justify-center gap-2 whitespace-nowrap rounded-brutal-sm font-extrabold',
    'border-brutal shadow-brutal transition-[transform,box-shadow,background-color] duration-150 ease-out',
    // hover: lift away from the shadow; press: sink into it and the shadow collapses
    'hover:translate-x-[2px] hover:-translate-y-[2px] hover:shadow-brutal-lg',
    'active:translate-x-(--sx) active:translate-y-(--sy) active:shadow-none active:duration-75',
    'disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none',
  ],
  {
    variants: {
      variant: {
        primary: 'bg-yellow text-[#0a0a0a]',
        blue: 'bg-blue text-white',
        dark: 'bg-ink text-bg',
        outline: 'bg-surface text-ink',
        danger: 'bg-red text-white',
        ghost: 'border-transparent bg-transparent shadow-none hover:translate-0 hover:bg-surface-2 hover:shadow-none active:translate-0',
      },
      size: {
        sm: 'h-9 px-3 text-sm',
        md: 'h-11 px-5 text-[15px]',
        lg: 'h-14 px-7 text-lg',
        icon: 'size-11 p-0',
        'icon-sm': 'size-9 p-0',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  },
)

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  loading?: boolean
  ref?: Ref<HTMLButtonElement>
}

export function Button({ className, variant, size, loading, disabled, children, ...props }: ButtonProps) {
  return (
    <button className={cn(buttonVariants({ variant, size }), className)} disabled={disabled || loading} {...props}>
      {loading && <Loader2 className="size-4 animate-spin" aria-hidden />}
      {children}
    </button>
  )
}
