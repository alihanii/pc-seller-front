import { ChevronLeft, ChevronRight, SearchX, SlidersHorizontal, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router'

import { Container } from '@/components/layout/app-layout'
import { CategoryIcon } from '@/components/product/category-icon'
import { FilterPanel } from '@/components/product/filters'
import { ProductGrid } from '@/components/product/product-grid'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Dialog } from '@/components/ui/dialog'
import { EmptyState } from '@/components/ui/misc'
import { faNumber, rialToToman } from '@/lib/format'
import { useCategory, useFacets, useProducts } from '@/lib/queries'
import { cn } from '@/lib/utils'

const PAGE_SIZE = 24
const SORTS = [
  ['newest', 'جدیدترین'],
  ['bestselling', 'پرفروش‌ترین'],
  ['price', 'ارزان‌ترین'],
  ['-price', 'گران‌ترین'],
  ['discount', 'بیشترین تخفیف'],
  ['top_rated', 'محبوب‌ترین'],
] as const

export function ListingPage() {
  const { slug } = useParams()
  const [params, setParams] = useSearchParams()
  const [filtersOpen, setFiltersOpen] = useState(false)
  const category = useCategory(slug)

  const apiParams = useMemo(() => {
    const all = Object.fromEntries(params.entries())
    return slug ? { ...all, category: slug } : all
  }, [params, slug])
  const facetParams = useMemo(() => {
    const { page: _page, ordering: _ordering, category: _category, ...rest } = apiParams
    return rest
  }, [apiParams])

  const products = useProducts(apiParams)
  const facets = useFacets(slug, facetParams)
  const usableFacets = slug ? facets.data : undefined

  const update = (changes: Record<string, string | null>) => {
    const next = new URLSearchParams(params)
    for (const [key, value] of Object.entries(changes)) {
      if (value == null || value === '') next.delete(key)
      else next.set(key, value)
    }
    if (!('page' in changes)) next.delete('page')
    setParams(next, { preventScrollReset: 'page' in changes ? false : true })
  }

  const page = Number(params.get('page') ?? 1)
  const pages = Math.max(1, Math.ceil((products.data?.count ?? 0) / PAGE_SIZE))
  const query = params.get('q')
  const title = slug ? category.data?.name ?? '…' : query ? `نتایج «${query}»` : 'همه‌ی محصولات'
  const activeChips = chips(params, usableFacets)

  return (
    <Container className="pt-6">
      <nav className="mb-3 flex flex-wrap items-center gap-1.5 text-sm text-muted" aria-label="مسیر">
        <Link to="/" className="hover:text-ink">خانه</Link>
        {category.data?.breadcrumb.map((c) => (
          <span key={c.id} className="flex items-center gap-1.5"><ChevronLeft className="size-3.5" /><Link to={`/category/${c.slug}`} className="hover:text-ink">{c.name}</Link></span>
        ))}
        <ChevronLeft className="size-3.5" /><span className="font-bold text-ink">{title}</span>
      </nav>

      <div className="mb-6 flex flex-wrap items-center gap-4">
        {slug && (
          <span className="grid size-14 rotate-[-5deg] place-items-center rounded-xl border-brutal bg-yellow text-[#0a0a0a] shadow-brutal">
            <CategoryIcon slug={slug} className="size-7" />
          </span>
        )}
        <div>
          <h1 className="font-display text-3xl sm:text-4xl">{title}</h1>
          <p className="mt-1 text-sm font-bold text-muted">{products.data ? `${faNumber(products.data.count)} کالا` : 'در حال بارگذاری…'}</p>
        </div>
        {!!category.data?.children.length && (
          <div className="flex flex-wrap gap-2 sm:ms-6">
            {category.data.children.map((child) => (
              <Link key={child.id} to={`/category/${child.slug}`} className="flex items-center gap-1.5 rounded-full border-brutal-soft bg-surface px-3 py-1.5 text-sm font-bold shadow-brutal-sm transition-colors hover:bg-cyan hover:text-[#0a0a0a]">
                <CategoryIcon slug={child.slug} className="size-4" />{child.name}
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-[270px_minmax(0,1fr)]">
        <aside className="hidden lg:block">
          <Card tone="calm" className="sticky top-44 max-h-[calc(100dvh-12rem)] overflow-y-auto px-4 py-1">
            <FilterPanel facets={usableFacets} params={params} update={update} showSpecs={!!slug} />
          </Card>
        </aside>

        <div className="min-w-0">
          <div className="mb-4 flex items-center gap-2">
            <Button variant="outline" size="sm" className="shrink-0 lg:hidden" onClick={() => setFiltersOpen(true)}>
              <SlidersHorizontal className="size-4" /> فیلترها {activeChips.length > 0 && `(${faNumber(activeChips.length)})`}
            </Button>
            <div className="-mx-1 flex min-w-0 max-w-full flex-1 gap-1.5 overflow-x-auto px-1 py-1 [scrollbar-width:none]" role="radiogroup" aria-label="مرتب‌سازی">
              {SORTS.map(([value, label]) => {
                const active = (params.get('ordering') ?? 'newest') === value
                return (
                  <button
                    key={value} role="radio" aria-checked={active}
                    onClick={() => update({ ordering: value === 'newest' ? null : value })}
                    className={cn(
                      'shrink-0 rounded-md border-2 px-3 py-1.5 text-sm font-bold transition-all',
                      active ? 'border-line bg-ink text-bg shadow-brutal-sm' : 'border-transparent hover:border-line-soft hover:bg-surface',
                    )}
                  >
                    {label}
                  </button>
                )
              })}
            </div>
          </div>

          {activeChips.length > 0 && (
            <div className="mb-4 flex flex-wrap items-center gap-2">
              {activeChips.map((chip) => (
                <button key={chip.label} onClick={() => update(chip.clear)} className="flex items-center gap-1 rounded-full border-2 border-line bg-yellow px-3 py-1 text-xs font-black text-[#0a0a0a] transition-transform hover:scale-105">
                  {chip.label} <X className="size-3.5" />
                </button>
              ))}
              <button onClick={() => setParams(query ? { q: query } : {})} className="text-xs font-bold text-red underline underline-offset-4">حذف همه</button>
            </div>
          )}

          <div className={cn('transition-opacity duration-150', products.isPlaceholderData && 'opacity-60')}>
            {products.data?.count === 0 ? (
              <EmptyState
                icon={<SearchX />}
                title="چیزی پیدا نشد"
                text="فیلترها را کمتر کنید یا عبارت دیگری را جستجو کنید."
                action={<Button variant="outline" onClick={() => setParams({})}>پاک کردن فیلترها</Button>}
              />
            ) : (
              <ProductGrid products={products.data?.results} loading={products.isLoading} skeletons={9} className="xl:grid-cols-3" />
            )}
          </div>

          {pages > 1 && (
            <nav className="mt-10 flex items-center justify-center gap-2" aria-label="صفحه‌بندی">
              <Button variant="outline" size="icon-sm" disabled={page <= 1} onClick={() => update({ page: String(page - 1) })} aria-label="صفحه‌ی قبل">
                <ChevronRight className="size-4" />
              </Button>
              {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
                <Button key={n} variant={n === page ? 'primary' : 'outline'} size="icon-sm" onClick={() => update({ page: String(n) })} aria-current={n === page ? 'page' : undefined}>
                  {faNumber(n)}
                </Button>
              ))}
              <Button variant="outline" size="icon-sm" disabled={page >= pages} onClick={() => update({ page: String(page + 1) })} aria-label="صفحه‌ی بعد">
                <ChevronLeft className="size-4" />
              </Button>
            </nav>
          )}
        </div>
      </div>

      <Dialog open={filtersOpen} onOpenChange={setFiltersOpen} title="فیلترها" variant="drawer">
        <FilterPanel facets={usableFacets} params={params} update={update} showSpecs={!!slug} />
        <Button className="sticky bottom-0 mt-4 w-full" onClick={() => setFiltersOpen(false)}>
          نمایش {faNumber(products.data?.count ?? 0)} کالا
        </Button>
      </Dialog>
    </Container>
  )
}

function chips(params: URLSearchParams, facets: ReturnType<typeof useFacets>['data']) {
  const result: { label: string; clear: Record<string, string | null> }[] = []
  if (params.get('in_stock')) result.push({ label: 'فقط موجود', clear: { in_stock: null } })
  if (params.get('discounted')) result.push({ label: 'تخفیف‌دار', clear: { discounted: null } })
  if (params.get('min_price') || params.get('max_price')) {
    const low = params.get('min_price'), high = params.get('max_price')
    result.push({
      label: `قیمت ${low ? `از ${faNumber(rialToToman(Number(low)))}` : ''} ${high ? `تا ${faNumber(rialToToman(Number(high)))}` : ''}`.trim(),
      clear: { min_price: null, max_price: null },
    })
  }
  for (const slug of (params.get('brand') ?? '').split(',').filter(Boolean)) {
    const rest = (params.get('brand') ?? '').split(',').filter((s) => s && s !== slug).join(',')
    const name = facets?.brands.find((b) => b.slug === slug)?.name ?? slug
    result.push({ label: name, clear: { brand: rest || null } })
  }
  for (const facet of facets?.attributes ?? []) {
    const raw = params.get(facet.param)
    if (raw) {
      const names = raw.split(',').map((v) => facet.options?.find((o) => String(o.id ?? o.value) === v)?.value ?? (v === 'true' ? 'دارد' : v))
      result.push({ label: `${facet.name}: ${names.join('، ')}`, clear: { [facet.param]: null } })
    }
    const [minKey, maxKey] = facet.params ?? []
    if (minKey && (params.get(minKey) || params.get(maxKey))) {
      result.push({ label: `${facet.name}: ${faNumber(params.get(minKey) ?? facet.min ?? '')}–${faNumber(params.get(maxKey) ?? facet.max ?? '')}`, clear: { [minKey]: null, [maxKey]: null } })
    }
  }
  return result
}
