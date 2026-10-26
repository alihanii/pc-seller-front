import { animate } from 'motion'

import { useCartStore } from '@/stores/cart'

/** Fly a small product thumbnail from `from` to the header cart button, then bounce the cart. */
export function flyToCart(from: HTMLElement | null, image?: string | null) {
  const target = document.getElementById('cart-button')
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
  if (!from || !target || reduce) {
    useCartStore.getState().bump()
    return
  }
  const start = from.getBoundingClientRect()
  const end = target.getBoundingClientRect()
  const dot = document.createElement('div')
  Object.assign(dot.style, {
    position: 'fixed', zIndex: '60', width: '56px', height: '56px', left: `${start.left + start.width / 2 - 28}px`,
    top: `${start.top + start.height / 2 - 28}px`, borderRadius: '10px', border: '3px solid var(--c-line)',
    background: image ? `center / cover url("${image}")` : 'var(--c-yellow)', boxShadow: '-3px 3px 0 var(--c-shadow)',
    pointerEvents: 'none',
  })
  document.body.appendChild(dot)
  const dx = end.left + end.width / 2 - (start.left + start.width / 2)
  const dy = end.top + end.height / 2 - (start.top + start.height / 2)
  animate(
    dot,
    { x: [0, dx * 0.4, dx], y: [0, dy - 120, dy], scale: [1, 1.1, 0.3], rotate: [0, -20, 10], opacity: [1, 1, 0.6] },
    { duration: 0.6, ease: 'easeInOut' },
  ).then(() => {
    dot.remove()
    useCartStore.getState().bump()
  })
}
