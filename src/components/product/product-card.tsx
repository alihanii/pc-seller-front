import { Heart, PackageX } from 'lucide-react'
import { motion } from 'motion/react'
import { Link, useNavigate } from 'react-router'
import { toast } from 'sonner'

import { Price } from '@/components/ui/price'
import { Skeleton } from '@/components/ui/skeleton'
import { Stars } from '@/components/ui/misc'
import { Sticker } from '@/components/ui/sticker'
import { faNumber } from '@/lib/format'
import { useToggleWishlist, useWishlist } from '@/lib/queries'
import type { ProductCard as Product } from '@/lib/types'
import { cn } from '@/lib/utils'
import { useAuth } from '@/stores/auth'

export const cardMotion = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 420, damping: 30 } },
}

export function useWishlistToggle() {
  const access = useAuth((s) => s.access)
  const { data } = useWishlist()
  const toggle = useToggleWishlist()
  const navigate = useNavigate()
  const liked = new Set(data?.results.map((p) => p.id))
  return {
    isLiked: (id: number) => liked.has(id),
    toggle: (id: number) => {
      if (!access) {
        toast('برای ذخیره‌ی علاقه‌مندی‌ها وارد شوید.')
        navigate('/login')
        return
      }
      toggle.mutate({ productId: id, liked: liked.has(id) }, {
        onSuccess: () => toast.success(liked.has(id) ? 'از علاقه‌مندی‌ها حذف شد' : 'به علاقه‌مندی‌ها اضافه شد'),
      })
    },
  }
}

export function ProductCard({ product, className }: { product: Product; className?: string }) {
  const wishlist = useWishlistToggle()
  const liked = wishlist.isLiked(product.id)
  return (
    <motion.article variants={cardMotion} className={cn('group relative h-full', className)}>
      <Link
        to={`/product/${product.slug}`}
        className="flex h-full flex-col rounded-brutal border-brutal bg-surface p-3 shadow-brutal transition-[transform,box-shadow] duration-200 hover:translate-x-[3px] hover:-translate-y-[3px] hover:shadow-brutal-lg"
      >
        <div className="relative aspect-square overflow-hidden rounded-brutal-sm border-brutal-soft bg-surface-2">
          {product.image ? (
            <img
              src={product.image} alt={product.name} loading="lazy"
              className={cn('size-full object-cover transition-transform duration-300 group-hover:scale-105', !product.in_stock && 'opacity-50 grayscale')}
            />
          ) : <div className="size-full" />}
          {!product.in_stock && (
            <span className="absolute inset-x-3 bottom-3 flex items-center justify-center gap-1.5 rounded-md border-brutal-soft bg-surface py-1 text-xs font-black">
              <PackageX className="size-4" /> ناموجود
            </span>
          )}
        </div>
        {product.discount_percent > 0 && product.in_stock && (
          <Sticker tone="red" tilt={-8} className="absolute top-1 right-1 text-sm">{faNumber(product.discount_percent)}٪</Sticker>
        )}
        <div className="mt-3 flex flex-1 flex-col gap-1.5">
          <div className="flex items-center justify-between gap-2 text-xs">
            {product.brand && <span className="font-black text-blue uppercase" dir="ltr">{product.brand.name}</span>}
            {product.rating != null && (
              <span className="flex items-center gap-1 text-muted"><Stars value={product.rating} size={12} />({faNumber(product.rating_count)})</span>
            )}
          </div>
          <h3 className="line-clamp-2 min-h-12 text-[15px] leading-6 font-bold">{product.name}</h3>
          <div className="mt-auto flex items-end justify-between pt-1">
            {product.price != null ? (
              <Price rial={product.price} original={product.discount_percent ? product.original_price : null} />
            ) : <span className="text-sm text-muted">به‌زودی</span>}
          </div>
        </div>
      </Link>
      <button
        type="button"
        onClick={() => wishlist.toggle(product.id)}
        aria-label={liked ? 'حذف از علاقه‌مندی‌ها' : 'افزودن به علاقه‌مندی‌ها'}
        aria-pressed={liked}
        className="absolute top-5 left-5 grid size-9 place-items-center rounded-full border-brutal-soft bg-surface shadow-brutal-sm transition-transform hover:scale-110 active:scale-90"
      >
        <Heart className={cn('size-4.5 transition-colors', liked ? 'fill-red text-red' : 'text-ink')} />
      </button>
    </motion.article>
  )
}

export function ProductCardSkeleton() {
  return (
    <div className="rounded-brutal border-brutal-soft bg-surface p-3">
      <Skeleton className="aspect-square w-full" />
      <Skeleton className="mt-3 h-3 w-16" />
      <Skeleton className="mt-2 h-4 w-full" />
      <Skeleton className="mt-1.5 h-4 w-2/3" />
      <Skeleton className="mt-4 h-6 w-24" />
    </div>
  )
}
