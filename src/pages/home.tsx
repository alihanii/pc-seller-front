import { ArrowLeft, Flame, Sparkles, TrendingUp } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router'

import { Container } from '@/components/layout/app-layout'
import { CATEGORY_TONES, CategoryIcon } from '@/components/product/category-icon'
import { ProductCarousel, ProductGrid } from '@/components/product/product-grid'
import { buttonVariants } from '@/components/ui/button'
import { Marquee, SectionTitle } from '@/components/ui/misc'
import { Skeleton } from '@/components/ui/skeleton'
import { Sticker } from '@/components/ui/sticker'
import { useBanners, useBrands, useCategories, useProducts } from '@/lib/queries'
import type { Banner } from '@/lib/types'
import { cn } from '@/lib/utils'

const HERO_INTERVAL = 6000

function HeroSlider({ banners }: { banners: Banner[] }) {
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    if (paused || banners.length < 2) return
    const id = setInterval(() => setIndex((i) => (i + 1) % banners.length), HERO_INTERVAL)
    return () => clearInterval(id)
  }, [paused, banners.length])

  const banner = banners[index]
  return (
    <div
      className="relative h-[340px] overflow-hidden rounded-brutal border-brutal bg-ink shadow-brutal-lg sm:h-[420px]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <AnimatePresence initial={false} mode="popLayout">
        <motion.div
          key={banner.id}
          className="absolute inset-0"
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        >
          <picture>
            {banner.mobile_image && <source media="(max-width: 640px)" srcSet={banner.mobile_image} />}
            <img src={banner.image} alt="" className="size-full object-cover object-left" />
          </picture>
          <div className="absolute inset-0 bg-gradient-to-l from-black/70 via-black/30 to-transparent" />
          <div className="absolute inset-y-0 right-0 flex w-full max-w-xl flex-col justify-center gap-4 p-6 text-white sm:p-10">
            <motion.div initial={{ x: 30, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.08, type: 'spring', stiffness: 400, damping: 28 }}>
              <Sticker tone="yellow" tilt={-4} className="mb-4 text-sm"><Flame className="size-4" /> پیشنهاد ویژه</Sticker>
              <h1 className="font-display text-3xl leading-tight sm:text-5xl">{banner.title}</h1>
            </motion.div>
            <motion.p
              className="max-w-md text-base font-medium text-white/85 sm:text-lg"
              initial={{ x: 30, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.14, type: 'spring', stiffness: 400, damping: 28 }}
            >
              {banner.subtitle}
            </motion.p>
            {banner.link && (
              <motion.div initial={{ y: 12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
                <Link to={banner.link} className={cn(buttonVariants({ size: 'lg' }), 'shadow-[var(--sx)_var(--sy)_0_0_#000]')}>
                  همین حالا ببینید <ArrowLeft className="size-5" />
                </Link>
              </motion.div>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
      <div className="absolute bottom-4 left-4 flex gap-2" role="tablist" aria-label="بنرها">
        {banners.map((b, i) => (
          <button
            key={b.id}
            role="tab"
            aria-selected={i === index}
            aria-label={b.title}
            onClick={() => setIndex(i)}
            className={cn('h-3 rounded-sm border-2 border-black transition-all duration-200', i === index ? 'w-9 bg-yellow' : 'w-3 bg-white/80 hover:bg-white')}
          />
        ))}
      </div>
    </div>
  )
}

function Hero() {
  const { data: hero, isLoading } = useBanners('hero')
  const { data: side } = useBanners('below_hero')
  if (isLoading) return <Skeleton className="h-[340px] w-full rounded-brutal sm:h-[420px]" />
  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_300px]">
      {hero && hero.length > 0 && <HeroSlider banners={hero} />}
      <div className="grid grid-cols-2 gap-5 lg:grid-cols-1">
        {side?.slice(0, 2).map((banner, i) => (
          <Link
            key={banner.id}
            to={banner.link || '/'}
            className="group relative min-h-36 overflow-hidden rounded-brutal border-brutal bg-ink shadow-brutal transition-[transform,box-shadow] duration-200 hover:translate-x-[3px] hover:-translate-y-[3px] hover:shadow-brutal-lg"
          >
            <img src={banner.image} alt="" className="absolute inset-0 size-full object-cover object-left transition-transform duration-300 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-l from-black/75 to-transparent" />
            <div className="relative flex h-full flex-col justify-end gap-1 p-4 text-white">
              <Sticker tone={i ? 'pink' : 'yellow'} tilt={i ? 5 : -5} wobble={false} className="mb-1 self-start">جدید</Sticker>
              <strong className="font-display text-lg leading-tight sm:text-xl">{banner.title}</strong>
              <span className="text-xs text-white/80 sm:text-sm">{banner.subtitle}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

function CategoryTiles() {
  const { data: categories, isLoading } = useCategories()
  const all = categories?.flatMap((c) => [c, ...c.children]).filter((c) => c.slug !== 'peripherals') ?? []
  return (
    <section>
      <SectionTitle kicker="SHOP BY CATEGORY" title="دسته‌بندی‌ها" />
      <motion.ul
        className="grid grid-cols-3 gap-3 sm:grid-cols-5 lg:grid-cols-10"
        initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.3 }}
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.04 } } }}
      >
        {isLoading && Array.from({ length: 10 }, (_, i) => <Skeleton key={i} className="aspect-square rounded-brutal" />)}
        {all.map((category, i) => (
          <motion.li key={category.id} variants={{ hidden: { opacity: 0, scale: 0.8 }, show: { opacity: 1, scale: 1 } }}>
            <Link
              to={`/category/${category.slug}`}
              className={cn(
                'group flex aspect-square flex-col items-center justify-center gap-2 rounded-brutal border-brutal p-2 text-center shadow-brutal transition-[transform,box-shadow] duration-200 hover:-translate-y-1 hover:rotate-[-3deg] hover:shadow-brutal-lg',
                CATEGORY_TONES[i % CATEGORY_TONES.length],
              )}
            >
              <CategoryIcon slug={category.slug} className="size-8 stroke-[1.75] transition-transform duration-200 group-hover:scale-110 sm:size-9" />
              <span className="text-xs font-black sm:text-sm">{category.name}</span>
            </Link>
          </motion.li>
        ))}
      </motion.ul>
    </section>
  )
}

function BrandStrip() {
  const { data: brands } = useBrands()
  if (!brands?.length) return null
  return (
    <section className="-mx-4 rotate-[-1.2deg] border-y-[length:var(--bw)] border-line bg-yellow py-4 text-[#0a0a0a]">
      <Marquee>
        {brands.map((brand) => (
          <Link key={brand.id} to={`/search?brand=${brand.slug}`} className="whitespace-nowrap text-2xl font-black tracking-tight uppercase hover:text-blue" dir="ltr">
            {brand.name} <span aria-hidden>✦</span>
          </Link>
        ))}
      </Marquee>
    </section>
  )
}

export function HomePage() {
  const discounted = useProducts({ discounted: 'true', ordering: 'discount', in_stock: 'true' })
  const newest = useProducts({ ordering: 'newest' })
  const bestselling = useProducts({ ordering: 'bestselling', in_stock: 'true' })

  return (
    <div className="overflow-x-clip">
      <Container className="space-y-14 pt-6">
        <Hero />
        <CategoryTiles />

        <section className="rounded-brutal border-brutal bg-red/10 p-4 shadow-brutal sm:p-6 dark:bg-red/15">
          <SectionTitle
            kicker="HOT DEALS"
            title="تخفیف‌های داغ"
            action={<Link to="/search?discounted=true&ordering=discount" className={buttonVariants({ variant: 'outline', size: 'sm' })}>همه <ArrowLeft className="size-4" /></Link>}
          />
          <ProductCarousel products={discounted.data?.results} loading={discounted.isLoading} />
        </section>

        <BrandStrip />

        <section>
          <SectionTitle
            kicker="BEST SELLERS"
            title="پرفروش‌ترین‌ها"
            action={<Link to="/search?ordering=bestselling" className={buttonVariants({ variant: 'outline', size: 'sm' })}><TrendingUp className="size-4" /> همه</Link>}
          />
          <ProductCarousel products={bestselling.data?.results} loading={bestselling.isLoading} />
        </section>

        <section>
          <SectionTitle
            kicker="NEW ARRIVALS"
            title="تازه‌ترین محصولات"
            action={<Link to="/search?ordering=newest" className={buttonVariants({ variant: 'outline', size: 'sm' })}><Sparkles className="size-4" /> همه</Link>}
          />
          <ProductGrid products={newest.data?.results.slice(0, 8)} loading={newest.isLoading} />
        </section>
      </Container>
    </div>
  )
}
