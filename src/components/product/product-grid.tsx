import { ChevronLeft, ChevronRight } from 'lucide-react'
import { motion } from 'motion/react'
import { useRef } from 'react'

import { Button } from '@/components/ui/button'
import type { ProductCard as Product } from '@/lib/types'
import { cn } from '@/lib/utils'

import { ProductCard, ProductCardSkeleton } from './product-card'

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.045 } } }

export function ProductGrid({ products, loading, skeletons = 8, className }: {
  products?: Product[]; loading?: boolean; skeletons?: number; className?: string
}) {
  const grid = cn('grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 xl:grid-cols-4', className)
  if (loading && !products) {
    return <div className={grid}>{Array.from({ length: skeletons }, (_, i) => <ProductCardSkeleton key={i} />)}</div>
  }
  return (
    <motion.div key={products?.map((p) => p.id).join()} variants={stagger} initial="hidden" animate="show" className={grid}>
      {products?.map((product) => <ProductCard key={product.id} product={product} />)}
    </motion.div>
  )
}

export function ProductCarousel({ products, loading }: { products?: Product[]; loading?: boolean }) {
  const track = useRef<HTMLDivElement>(null)
  const scroll = (direction: 1 | -1) => {
    const node = track.current
    if (node) node.scrollBy({ left: direction * node.clientWidth * 0.8, behavior: 'smooth' })
  }
  return (
    <div className="relative">
      <motion.div
        ref={track}
        variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }}
        className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth px-4 pt-1 pb-5 [scrollbar-width:none]"
      >
        {loading && !products
          ? Array.from({ length: 5 }, (_, i) => <div key={i} className="w-[46%] shrink-0 sm:w-[30%] lg:w-[23%]"><ProductCardSkeleton /></div>)
          : products?.map((product) => (
            <ProductCard key={product.id} product={product} className="w-[46%] shrink-0 snap-start sm:w-[30%] lg:w-[23%]" />
          ))}
      </motion.div>
      <div className="pointer-events-none absolute inset-y-0 -inset-x-3 hidden items-center justify-between md:flex">
        <Button variant="outline" size="icon" className="pointer-events-auto rounded-full" onClick={() => scroll(1)} aria-label="قبلی">
          <ChevronRight className="size-5" />
        </Button>
        <Button variant="outline" size="icon" className="pointer-events-auto rounded-full" onClick={() => scroll(-1)} aria-label="بعدی">
          <ChevronLeft className="size-5" />
        </Button>
      </div>
    </div>
  )
}
