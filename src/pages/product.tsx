import {
  BadgeCheck, Check, ChevronLeft, Clock, Heart, MessageSquareText, Minus, PackageCheck, PackageX, Plus, ShieldCheck,
  ShoppingCart, Truck,
} from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { toast } from 'sonner'

import { Container } from '@/components/layout/app-layout'
import { ProductCarousel } from '@/components/product/product-grid'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Field, Input, Textarea } from '@/components/ui/input'
import { EmptyState, SectionTitle, Stars } from '@/components/ui/misc'
import { Price } from '@/components/ui/price'
import { Skeleton } from '@/components/ui/skeleton'
import { Chip, Sticker } from '@/components/ui/sticker'
import { useWishlistToggle } from '@/hooks/use-wishlist-toggle'
import { errorMessage } from '@/lib/api'
import { flyToCart } from '@/lib/fly-to-cart'
import { faNumber, jalaliDate } from '@/lib/format'
import { useAddToCart, useProduct, useReviews, useSubmitReview } from '@/lib/queries'
import type { ProductDetail, ProductVariant } from '@/lib/types'
import { cn } from '@/lib/utils'
import { useAuth } from '@/stores/auth'

type Selection = Record<number, number> // variant type id -> option id

function selectionOf(variant: ProductVariant): Selection {
  return Object.fromEntries(variant.options.map((o) => [o.type_id, o.id]))
}

function matches(variant: ProductVariant, selection: Selection) {
  return Object.entries(selection).every(([type, option]) => variant.options.some((o) => o.type_id === Number(type) && o.id === option))
}

const sellable = (v: ProductVariant) => v.availability !== 'out_of_stock'

/** Variant picking: an option is enabled when some in-stock variant has it together with the
    other current choices; choosing an option that breaks the combination jumps to the best variant with it. */
function useVariantPicker(product: ProductDetail | undefined) {
  // The picked options belong to one product; another product starts from its first sellable variant.
  const [picked, setPicked] = useState<{ slug: string; selection: Selection } | null>(null)
  const initial = product?.variants.find(sellable) ?? product?.variants[0]
  const selection: Selection = picked && picked.slug === product?.slug ? picked.selection : initial ? selectionOf(initial) : {}
  const setSelection = (next: Selection) => product && setPicked({ slug: product.slug, selection: next })

  const variant = product?.variants.find((v) => matches(v, selection) && v.options.length === Object.keys(selection).length)
    ?? (product?.variants.length === 1 ? product.variants[0] : undefined)

  const optionState = (typeId: number, optionId: number) => {
    const candidate = { ...selection, [typeId]: optionId }
    const exact = product?.variants.filter((v) => matches(v, candidate)) ?? []
    if (exact.some(sellable)) return 'available'
    if (exact.length) return 'out_of_stock'
    return product?.variants.some((v) => v.options.some((o) => o.id === optionId)) ? 'other_combination' : 'missing'
  }

  const choose = (typeId: number, optionId: number) => {
    const candidate = { ...selection, [typeId]: optionId }
    if (product?.variants.some((v) => matches(v, candidate))) {
      setSelection(candidate)
      return
    }
    const withOption = product?.variants.filter((v) => v.options.some((o) => o.id === optionId)) ?? []
    const best = withOption.find(sellable) ?? withOption[0]
    if (best) setSelection(selectionOf(best))
  }

  return { selection, variant, optionState, choose }
}

function Gallery({ product, variant }: { product: ProductDetail; variant?: ProductVariant }) {
  const images = useMemo(() => {
    const own = product.images.filter((i) => variant && i.variant === variant.id)
    const general = product.images.filter((i) => i.variant === null)
    return own.length ? [...own, ...general] : general.length ? general : product.images
  }, [product.images, variant])
  const imagesKey = images.map((i) => i.id).join()
  const [shown, setShown] = useState({ key: imagesKey, index: 0 })
  const index = shown.key === imagesKey ? shown.index : 0
  const setIndex = (i: number) => setShown({ key: imagesKey, index: i })
  const current = images[index]

  return (
    <div className="flex flex-col gap-3">
      <div className="relative aspect-square overflow-hidden rounded-brutal border-brutal bg-surface-2 shadow-brutal">
        <AnimatePresence mode="wait" initial={false}>
          {current && (
            <motion.img
              key={current.id}
              src={current.image}
              alt={current.alt || product.name}
              initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="size-full object-cover"
            />
          )}
        </AnimatePresence>
        {product.discount_percent > 0 && (
          <Sticker tone="red" tilt={-10} className="absolute top-4 right-4 text-base">{faNumber(product.discount_percent)}٪ تخفیف</Sticker>
        )}
      </div>
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="تصاویر">
          {images.map((image, i) => (
            <button
              key={image.id}
              role="tab"
              aria-selected={i === index}
              onClick={() => setIndex(i)}
              className={cn(
                'size-18 shrink-0 overflow-hidden rounded-brutal-sm border-brutal-soft transition-all',
                i === index ? 'shadow-brutal-sm ring-2 ring-yellow ring-offset-2 ring-offset-bg' : 'opacity-70 hover:opacity-100',
              )}
            >
              <img src={image.image} alt="" className="size-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function Countdown({ until }: { until: string }) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])
  const left = Math.max(0, new Date(until).getTime() - now)
  const days = Math.floor(left / 86_400_000)
  const parts = [Math.floor(left / 3_600_000) % 24, Math.floor(left / 60_000) % 60, Math.floor(left / 1000) % 60]
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md border-2 border-line bg-ink px-2 py-1 text-xs font-black text-yellow tabular-nums">
      <Clock className="size-3.5" />
      {days > 0 && `${faNumber(days)} روز و `}
      {parts.map((n) => faNumber(String(n).padStart(2, '0'))).join(':')}
    </span>
  )
}

function Purchase({ product, picker }: { product: ProductDetail; picker: ReturnType<typeof useVariantPicker> }) {
  const { variant, selection, optionState, choose } = picker
  const navigate = useNavigate()
  const [chosenQuantity, setChosenQuantity] = useState({ variant: 0, quantity: 1 })
  const quantity = chosenQuantity.variant === variant?.id ? chosenQuantity.quantity : 1
  const setQuantity = (update: (q: number) => number) => setChosenQuantity({ variant: variant?.id ?? 0, quantity: update(quantity) })
  const addToCart = useAddToCart()
  const button = useRef<HTMLButtonElement>(null)
  const wishlist = useWishlistToggle()
  const liked = wishlist.isLiked(product.id)
  const available = variant && variant.availability !== 'out_of_stock'

  const add = () => {
    if (!variant) return
    addToCart.mutate({ variant: variant.id, quantity }, {
      onSuccess: () => {
        flyToCart(button.current, product.images[0]?.image)
        toast.success('به سبد خرید اضافه شد', { action: { label: 'مشاهده‌ی سبد', onClick: () => navigate('/cart') } })
      },
      onError: (error) => toast.error(errorMessage(error)),
    })
  }

  return (
    <div className="flex flex-col gap-5">
      {product.variant_types.map((type) => {
        const chosen = type.options.find((o) => o.id === selection[type.id])
        return (
          <div key={type.id}>
            <p className="mb-2 text-sm font-bold">
              {type.name}: <span className="font-black text-blue-ink">{chosen?.value ?? 'انتخاب کنید'}</span>
            </p>
            <div className="flex flex-wrap gap-2.5">
              {type.options.map((option) => {
                const state = optionState(type.id, option.id)
                const active = selection[type.id] === option.id
                const unavailable = state !== 'available'
                return type.display === 'color_swatch' ? (
                  <button
                    key={option.id}
                    onClick={() => choose(type.id, option.id)}
                    title={`${option.value}${state === 'out_of_stock' ? ' (ناموجود)' : ''}`}
                    aria-label={option.value}
                    aria-pressed={active}
                    className={cn(
                      'relative size-11 rounded-full border-brutal transition-all duration-150 hover:scale-110',
                      active ? 'shadow-brutal-sm ring-[3px] ring-yellow ring-offset-2 ring-offset-bg' : '',
                      unavailable && 'opacity-40',
                    )}
                    style={{ backgroundColor: option.color_hex || '#ccc' }}
                  >
                    {active && <Check className="absolute inset-0 m-auto size-5 stroke-[3.5] text-white mix-blend-difference" />}
                    {state === 'out_of_stock' && <span className="absolute inset-0 m-auto h-[3px] w-[120%] -translate-x-[10%] rotate-45 bg-line" />}
                  </button>
                ) : (
                  <button
                    key={option.id}
                    onClick={() => choose(type.id, option.id)}
                    aria-pressed={active}
                    className={cn(
                      'min-h-11 min-w-16 rounded-brutal-sm border-brutal-soft px-4 py-2 text-sm font-black transition-all duration-150',
                      active ? 'bg-yellow text-[#0a0a0a] shadow-brutal-sm' : 'bg-surface hover:bg-surface-2',
                      unavailable && 'text-muted line-through decoration-2',
                    )}
                    dir="auto"
                  >
                    {option.value}
                  </button>
                )
              })}
            </div>
          </div>
        )
      })}

      <Card className="flex flex-col gap-4 bg-surface p-5">
        {variant ? (
          <>
            <div className="flex flex-wrap items-end justify-between gap-3">
              <Price rial={variant.current_price} original={variant.discount_percent ? variant.price : null} size="lg" animated />
              {variant.discount_percent > 0 && <Sticker tone="red" tilt={4}>{faNumber(variant.discount_percent)}٪ تخفیف</Sticker>}
            </div>
            {variant.discount_ends_at && (
              <p className="flex items-center gap-2 text-sm font-bold">پایان تخفیف: <Countdown until={variant.discount_ends_at} /></p>
            )}
            <p className={cn('flex items-center gap-2 text-sm font-black', {
              'text-green-ink': variant.availability === 'in_stock',
              'text-[#c2410c] dark:text-[#fb923c]': variant.availability === 'low_stock',
              'text-red-ink': variant.availability === 'out_of_stock',
            })}>
              {variant.availability === 'out_of_stock' ? <PackageX className="size-5" /> : <PackageCheck className="size-5" />}
              {{ in_stock: 'موجود در انبار', low_stock: 'تعداد محدود؛ زود تمام می‌شود', out_of_stock: 'ناموجود' }[variant.availability]}
            </p>
          </>
        ) : (
          <p className="font-bold text-muted">ترکیب انتخاب‌شده موجود نیست؛ گزینه‌ی دیگری را انتخاب کنید.</p>
        )}
        <div className="flex flex-wrap gap-3">
          <div className="flex h-14 items-center rounded-brutal-sm border-brutal-soft bg-surface" aria-label="تعداد">
            <button className="grid h-full w-11 place-items-center hover:bg-surface-2 disabled:opacity-40" onClick={() => setQuantity((q) => q + 1)} disabled={!available} aria-label="افزایش">
              <Plus className="size-4" />
            </button>
            <span className="w-8 text-center text-lg font-black tabular-nums">{faNumber(quantity)}</span>
            <button className="grid h-full w-11 place-items-center hover:bg-surface-2 disabled:opacity-40" onClick={() => setQuantity((q) => Math.max(1, q - 1))} disabled={quantity <= 1} aria-label="کاهش">
              <Minus className="size-4" />
            </button>
          </div>
          <Button ref={button} size="lg" className="order-last w-full min-[420px]:order-none min-[420px]:w-auto min-[420px]:flex-1" onClick={add} disabled={!available} loading={addToCart.isPending}>
            <ShoppingCart className="size-5" /> {available ? 'افزودن به سبد' : 'ناموجود'}
          </Button>
          <Button variant="outline" size="icon" className="size-14" onClick={() => wishlist.toggle(product.id)} aria-pressed={liked} aria-label="علاقه‌مندی">
            <Heart className={cn('size-6', liked && 'fill-red text-red-ink')} />
          </Button>
        </div>
      </Card>
      <ul className="grid grid-cols-3 gap-2 text-center text-xs font-bold">
        {[[Truck, 'ارسال سریع'], [ShieldCheck, product.warranty || 'ضمانت اصالت'], [BadgeCheck, 'کالای اصل']].map(([Icon, label]) => {
          const I = Icon as typeof Truck
          return (
            <li key={label as string} className="flex flex-col items-center gap-1.5 rounded-brutal-sm border-hairline bg-surface p-2.5">
              <I className="size-5 text-blue-ink" />{label as string}
            </li>
          )
        })}
      </ul>
    </div>
  )
}

function Reviews({ product }: { product: ProductDetail }) {
  const { data, refetch } = useReviews(product.slug)
  const submit = useSubmitReview(product.slug)
  const access = useAuth((s) => s.access)
  const [rating, setRating] = useState(5)
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')

  return (
    <section className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
      <div>
        <SectionTitle title="نظر خریداران" kicker="REVIEWS" />
        {product.rating != null && (
          <div className="mb-5 flex items-center gap-4">
            <span className="font-display text-5xl">{faNumber(product.rating)}</span>
            <div>
              <Stars value={product.rating} size={20} />
              <p className="text-sm text-muted">از {faNumber(product.rating_count)} نظر</p>
            </div>
          </div>
        )}
        {data?.results.length ? (
          <ul className="flex flex-col gap-3">
            {data.results.map((review) => (
              <li key={review.id}>
                <Card tone="calm" className="p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <Stars value={review.rating} />
                    {review.title && <strong className="font-black">{review.title}</strong>}
                    {review.is_verified_buyer && <Chip className="bg-green/20"><BadgeCheck className="size-3.5 text-green-ink" /> خریدار</Chip>}
                  </div>
                  <p className="mt-2 text-[15px] leading-7">{review.body}</p>
                  <p className="mt-2 text-xs text-muted">{review.author} · {jalaliDate(review.created_at)}</p>
                </Card>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState icon={<MessageSquareText />} title="هنوز نظری ثبت نشده" text="اولین نفری باشید که درباره‌ی این کالا می‌نویسد." />
        )}
      </div>
      <Card tone="calm" className="h-fit p-5">
        <h3 className="mb-4 font-display text-lg">نظر شما</h3>
        {access ? (
          <form
            className="flex flex-col gap-3"
            onSubmit={(e) => {
              e.preventDefault()
              submit.mutate({ rating, title, body }, {
                onSuccess: (result) => {
                  toast.success(result.detail)
                  setTitle('')
                  setBody('')
                  refetch()
                },
                onError: (error) => toast.error(errorMessage(error)),
              })
            }}
          >
            <div className="flex gap-1" role="radiogroup" aria-label="امتیاز">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  type="button" key={n} role="radio" aria-checked={rating === n} onClick={() => setRating(n)}
                  className={cn('grid size-11 place-items-center rounded-md border-2 border-line font-black transition-transform hover:-translate-y-0.5', n <= rating ? 'bg-yellow text-[#0a0a0a]' : 'bg-surface')}
                >
                  {faNumber(n)}
                </button>
              ))}
            </div>
            <Field label="عنوان"><Input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={150} /></Field>
            <Field label="متن نظر"><Textarea value={body} onChange={(e) => setBody(e.target.value)} required /></Field>
            <Button type="submit" variant="blue" loading={submit.isPending}>ثبت نظر</Button>
          </form>
        ) : (
          <p className="text-sm text-muted">برای ثبت نظر <Link to={`/login?next=/product/${product.slug}`} className="font-black text-blue-ink underline">وارد شوید</Link>.</p>
        )}
      </Card>
    </section>
  )
}

export function ProductPage() {
  const { slug } = useParams()
  const { data: product, isLoading, isError } = useProduct(slug)
  const picker = useVariantPicker(product)

  if (isError) {
    return (
      <Container className="pt-10">
        <EmptyState icon={<PackageX />} title="این محصول پیدا نشد" action={<Link to="/" className="font-black text-blue-ink underline">بازگشت به فروشگاه</Link>} />
      </Container>
    )
  }
  if (isLoading || !product) {
    return (
      <Container className="grid gap-8 pt-8 lg:grid-cols-2">
        <Skeleton className="aspect-square rounded-brutal" />
        <div className="space-y-4"><Skeleton className="h-6 w-24" /><Skeleton className="h-10 w-full" /><Skeleton className="h-40 w-full" /></div>
      </Container>
    )
  }

  return (
    <Container className="space-y-14 pt-6">
      <div>
        <nav className="mb-5 flex flex-wrap items-center gap-1.5 text-sm text-muted" aria-label="مسیر">
          <Link to="/" className="inline-flex min-h-11 min-w-11 items-center justify-center hover:text-ink">خانه</Link>
          {product.breadcrumb.map((c) => (
            <span key={c.id} className="flex items-center gap-1.5"><ChevronLeft className="size-3.5" /><Link to={`/category/${c.slug}`} className="inline-flex min-h-11 items-center hover:text-ink">{c.name}</Link></span>
          ))}
        </nav>
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-12">
          <Gallery product={product} variant={picker.variant} />
          <div className="flex flex-col gap-5">
            <div>
              {product.brand && (
                <Link to={`/search?brand=${product.brand.slug}`} className="text-sm font-black tracking-wide text-blue-ink uppercase" dir="ltr">{product.brand.name}</Link>
              )}
              <h1 className="mt-1 font-display text-2xl leading-snug sm:text-3xl">{product.name}</h1>
              {product.rating != null && (
                <a href="#reviews" className="mt-2 inline-flex items-center gap-2 text-sm text-muted hover:text-ink">
                  <Stars value={product.rating} /> {faNumber(product.rating)} از {faNumber(product.rating_count)} نظر
                </a>
              )}
            </div>
            <Purchase product={product} picker={picker} />
          </div>
        </div>
      </div>

      <section className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <div>
          <SectionTitle title="مشخصات فنی" kicker="SPECS" />
          <Card tone="calm" className="overflow-hidden">
            {product.specifications.map((group) => (
              <div key={group.group}>
                <h3 className="border-b-[length:var(--bw-soft)] border-line bg-surface-2 px-4 py-2.5 text-sm font-black">{group.group}</h3>
                <dl>
                  {group.items.map((item) => (
                    <div key={item.name} className="grid grid-cols-[minmax(0,2fr)_minmax(0,3fr)] gap-4 border-b border-line-soft px-4 py-3 text-sm last:border-0">
                      <dt className="text-muted">{item.name}</dt>
                      <dd className="font-bold"><bdi>{item.value}</bdi></dd>
                    </div>
                  ))}
                </dl>
              </div>
            ))}
          </Card>
        </div>
        <div>
          <SectionTitle title="معرفی" kicker="ABOUT" />
          <p className="leading-8 text-[15px]">{product.description}</p>
        </div>
      </section>

      <div id="reviews"><Reviews product={product} /></div>

      {product.similar.length > 0 && (
        <section>
          <SectionTitle title="محصولات مشابه" kicker="YOU MAY ALSO LIKE" />
          <ProductCarousel products={product.similar} />
        </section>
      )}
    </Container>
  )
}
