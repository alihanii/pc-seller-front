import { Loader2, Search } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router'

import { useDebounce } from '@/hooks/use-debounce'
import { toman } from '@/lib/format'
import { useProducts } from '@/lib/queries'
import { cn } from '@/lib/utils'

export function SearchBox({ className, onDone }: { className?: string; onDone?: () => void }) {
  const [params] = useSearchParams()
  const [query, setQuery] = useState(params.get('q') ?? '')
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(-1)
  const debounced = useDebounce(query.trim(), 250)
  const navigate = useNavigate()
  const box = useRef<HTMLDivElement>(null)
  const { data, isFetching } = useProducts({ q: debounced }, debounced.length >= 2)
  const suggestions = debounced.length >= 2 ? (data?.results ?? []).slice(0, 6) : []

  useEffect(() => {
    const close = (event: MouseEvent) => {
      if (!box.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [])

  const submit = () => {
    const chosen = suggestions[active]
    setOpen(false)
    onDone?.()
    if (chosen) navigate(`/product/${chosen.slug}`)
    else if (query.trim()) navigate(`/search?q=${encodeURIComponent(query.trim())}`)
  }

  return (
    <div ref={box} className={cn('relative', className)}>
      <form
        role="search"
        onSubmit={(e) => {
          e.preventDefault()
          submit()
        }}
        className="flex h-12 items-center gap-2 rounded-brutal-sm border-brutal bg-surface ps-4 pe-1.5 shadow-brutal-sm transition-shadow focus-within:shadow-brutal"
      >
        <Search className="size-5 shrink-0 text-muted" aria-hidden />
        <input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setOpen(true)
            setActive(-1)
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === 'ArrowDown') setActive((i) => Math.min(i + 1, suggestions.length - 1))
            else if (e.key === 'ArrowUp') setActive((i) => Math.max(i - 1, -1))
            else if (e.key === 'Escape') setOpen(false)
          }}
          placeholder="جستجوی کارت گرافیک، رم، SSD…"
          aria-label="جستجو"
          aria-expanded={open && suggestions.length > 0}
          aria-controls="search-suggestions"
          className="h-full min-w-0 flex-1 bg-transparent text-[15px] font-medium outline-none placeholder:text-muted/70"
        />
        {isFetching && debounced.length >= 2 && <Loader2 className="size-4 animate-spin text-muted" />}
        <button type="submit" className="h-10 rounded-md border-brutal-soft bg-yellow px-3.5 text-sm font-black text-[#0a0a0a] transition-transform active:translate-y-0.5">
          بگرد
        </button>
      </form>
      <AnimatePresence>
        {open && debounced.length >= 2 && (
          <motion.div
            id="search-suggestions"
            initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-x-0 top-full z-40 mt-2 overflow-hidden rounded-brutal-sm border-brutal bg-surface shadow-brutal"
          >
            {suggestions.length === 0 && !isFetching && (
              <p className="px-4 py-5 text-center text-sm text-muted">نتیجه‌ای برای «{debounced}» پیدا نشد.</p>
            )}
            <ul role="listbox">
              {suggestions.map((product, index) => (
                <li key={product.id} role="option" aria-selected={index === active}>
                  <Link
                    to={`/product/${product.slug}`}
                    onClick={() => {
                      setOpen(false)
                      onDone?.()
                    }}
                    className={cn('flex items-center gap-3 px-3 py-2.5 transition-colors hover:bg-yellow/40', index === active && 'bg-yellow/40')}
                  >
                    {product.image && <img src={product.image} alt="" className="size-11 rounded-md border-hairline object-cover" />}
                    <span className="flex-1 text-sm font-bold leading-6">{product.name}</span>
                    {product.price != null && <span className="text-xs font-black tabular-nums">{toman(product.price)} ت</span>}
                  </Link>
                </li>
              ))}
            </ul>
            {(data?.count ?? 0) > suggestions.length && (
              <button onClick={submit} className="w-full border-t-[length:var(--bw-soft)] border-line bg-surface-2 py-2.5 text-sm font-black hover:bg-yellow">
                دیدن همه‌ی {data?.count} نتیجه
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
