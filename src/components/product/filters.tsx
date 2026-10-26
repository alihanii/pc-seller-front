import { useEffect, useState } from 'react'

import { Checkbox } from '@/components/ui/checkbox'
import { RangeSlider } from '@/components/ui/slider'
import { faNumber, rialToToman } from '@/lib/format'
import type { CategoryFacets, Facet } from '@/lib/types'
import { cn } from '@/lib/utils'

type Params = URLSearchParams
type Update = (changes: Record<string, string | null>) => void

function Section({ title, children, defaultOpen = true }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  return (
    <details open={defaultOpen} className="group border-b-[length:var(--bw-soft)] border-line-soft py-3 last:border-0">
      <summary className="flex list-none items-center justify-between font-black [&::-webkit-details-marker]:hidden">
        {title}
        <span className="grid size-6 place-items-center rounded-md border-2 border-line text-sm transition-transform group-open:rotate-45">+</span>
      </summary>
      <div className="mt-2">{children}</div>
    </details>
  )
}

function listValue(params: Params, key: string) {
  return (params.get(key) ?? '').split(',').filter(Boolean)
}

function toggleInList(params: Params, key: string, value: string) {
  const values = new Set(listValue(params, key))
  if (values.has(value)) values.delete(value)
  else values.add(value)
  return values.size ? [...values].join(',') : null
}

function Range({ min, max, low, high, step, format, onCommit }: {
  min: number; max: number; low: number; high: number; step: number; format: (n: number) => string
  onCommit: (low: number, high: number) => void
}) {
  const [value, setValue] = useState<[number, number]>([low, high])
  useEffect(() => setValue([low, high]), [low, high])
  return (
    <div className="px-1 pt-2">
      <RangeSlider min={min} max={max} step={step} value={value} onValueChange={setValue} onValueCommit={([a, b]) => onCommit(a, b)} />
      <div className="mt-3 flex justify-between text-xs font-bold tabular-nums">
        <span className="rounded-md border-hairline bg-surface-2 px-2 py-1">از {format(value[0])}</span>
        <span className="rounded-md border-hairline bg-surface-2 px-2 py-1">تا {format(value[1])}</span>
      </div>
    </div>
  )
}

function SpecFacet({ facet, params, update }: { facet: Facet; params: Params; update: Update }) {
  const title = facet.unit && facet.data_type !== 'number' ? `${facet.name} (${facet.unit})` : facet.name
  if (facet.data_type === 'boolean') {
    if (!facet.true_count) return null
    return (
      <Section title={title}>
        <Checkbox
          checked={params.get(facet.param) === 'true'}
          onChange={(on) => update({ [facet.param]: on ? 'true' : null })}
          aside={faNumber(facet.true_count)}
        >
          دارد
        </Checkbox>
      </Section>
    )
  }
  if (facet.data_type === 'number') {
    const min = Number(facet.min ?? 0)
    const max = Number(facet.max ?? 0)
    if (!(max > min)) return null
    const [minKey, maxKey] = facet.params ?? [`${facet.param}_min`, `${facet.param}_max`]
    return (
      <Section title={title}>
        <Range
          min={min} max={max} step={max - min > 100 ? Math.round((max - min) / 50) : (max - min) / 50}
          low={Number(params.get(minKey) ?? min)} high={Number(params.get(maxKey) ?? max)}
          format={(n) => `${faNumber(Math.round(n * 10) / 10)} ${facet.unit}`}
          onCommit={(a, b) => update({ [minKey]: a > min ? String(a) : null, [maxKey]: b < max ? String(b) : null })}
        />
      </Section>
    )
  }
  const options = facet.options ?? []
  if (!options.length) return null
  const selected = listValue(params, facet.param)
  return (
    <Section title={title}>
      <div className="flex flex-col">
        {options.map((option) => {
          const value = String(option.id ?? option.value)
          const checked = selected.includes(value)
          return (
            <div key={value} className={cn(!option.count && !checked && 'opacity-45')}>
              <Checkbox
                checked={checked}
                onChange={() => update({
                  [facet.param]: facet.data_type === 'text' ? (checked ? null : value) : toggleInList(params, facet.param, value),
                })}
                aside={faNumber(option.count)}
              >
                <span dir="auto">{option.value}</span>
              </Checkbox>
            </div>
          )
        })}
      </div>
    </Section>
  )
}

export function FilterPanel({ facets, params, update, showSpecs }: {
  facets?: CategoryFacets; params: Params; update: Update; showSpecs: boolean
}) {
  const priceMin = facets?.price.min ?? 0
  const priceMax = facets?.price.max ?? 0
  return (
    <div>
      <Section title="وضعیت کالا">
        <Checkbox checked={params.get('in_stock') === 'true'} onChange={(on) => update({ in_stock: on ? 'true' : null })}>فقط کالاهای موجود</Checkbox>
        <Checkbox checked={params.get('discounted') === 'true'} onChange={(on) => update({ discounted: on ? 'true' : null })}>فقط تخفیف‌دارها</Checkbox>
      </Section>
      {priceMax > priceMin && (
        <Section title="محدوده‌ی قیمت">
          <Range
            min={priceMin} max={priceMax} step={Math.max(10_000, Math.round((priceMax - priceMin) / 100 / 10_000) * 10_000)}
            low={Number(params.get('min_price') ?? priceMin)} high={Number(params.get('max_price') ?? priceMax)}
            format={(n) => `${faNumber(rialToToman(n))} ت`}
            onCommit={(a, b) => update({ min_price: a > priceMin ? String(a) : null, max_price: b < priceMax ? String(b) : null })}
          />
        </Section>
      )}
      {!!facets?.brands.length && (
        <Section title="برند">
          {facets.brands.map((brand) => (
            <Checkbox
              key={brand.id}
              checked={listValue(params, 'brand').includes(brand.slug)}
              onChange={() => update({ brand: toggleInList(params, 'brand', brand.slug) })}
              aside={faNumber(brand.count)}
            >
              <span dir="ltr">{brand.name}</span>
            </Checkbox>
          ))}
        </Section>
      )}
      {showSpecs && facets?.attributes.map((facet) => <SpecFacet key={facet.id} facet={facet} params={params} update={update} />)}
    </div>
  )
}
