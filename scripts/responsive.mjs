// Responsive check: every route at several widths, using the locally installed Google Chrome.
//
//   npm run test:responsive            # fails if any page scrolls horizontally
//   npm run test:responsive -- --report # also lists small touch targets and overflowing elements
//
// Needs both dev servers (Vite on 5173, Django on 8000) and demo data (seed_demo). Logged-in pages
// use a JWT minted by the local Django in DEBUG mode for the demo customer.
import { chromium } from 'playwright-core'

import { demoTokens } from './dev-auth.mjs'

const BASE = process.env.BASE_URL ?? 'http://127.0.0.1:5173'
const WIDTHS = [360, 390, 768, 1024, 1280, 1440]
const REPORT = process.argv.includes('--report')
const MIN_TARGET = 44

const tokens = demoTokens()
const routes = [
  { name: 'home', path: '/' },
  { name: 'home + search dropdown', path: '/', action: async (page) => {
    await page.locator('input[aria-label="جستجو"]:visible').first().fill('رم')
    await page.locator('#search-suggestions').waitFor({ timeout: 5000 }).catch(() => {})
  } },
  { name: 'home + menu drawer', path: '/', mobileOnly: true, action: async (page) => {
    await page.getByRole('button', { name: 'منو' }).click()
    await page.getByRole('dialog').waitFor()
  } },
  { name: 'category', path: '/category/gpu' },
  { name: 'category + filter drawer', path: '/category/ram', mobileOnly: true, action: async (page) => {
    await page.getByRole('button', { name: /فیلترها/ }).click()
    await page.getByRole('dialog').waitFor()
  } },
  { name: 'search', path: '/search?q=Samsung' },
  { name: 'product', path: '/product/corsair-vengeance-rgb-ddr5' },
  { name: 'product (variants)', path: '/product/logitech-g733' },
  { name: 'login', path: '/login', guest: true },
  { name: 'cart', path: '/cart' },
  { name: 'checkout', path: '/checkout' },
  { name: 'payment result', path: tokens.order ? `/payment/result?order=${tokens.order}&status=failed` : '/payment/result?status=failed' },
  { name: 'profile', path: '/profile' },
  { name: 'orders', path: '/profile/orders' },
  ...(tokens.order ? [{ name: 'order detail', path: `/profile/orders/${tokens.order}` }] : []),
  { name: 'addresses', path: '/profile/addresses' },
  { name: 'wishlist', path: '/profile/wishlist' },
  { name: 'about', path: '/about' },
  { name: 'contact', path: '/contact' },
  { name: 'terms', path: '/terms' },
  { name: '404', path: '/no-such-page' },
]

const browser = await chromium.launch({ channel: 'chrome' })
const failures = []
let checks = 0

for (const width of WIDTHS) {
  const mobile = width < 1024
  for (const route of routes) {
    if (route.mobileOnly && !mobile) continue
    const context = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: 'reduce', hasTouch: width < 768 })
    if (!route.guest) {
      await context.addInitScript(([access, refresh]) => {
        localStorage.setItem('pcs-auth', JSON.stringify({ state: { access, refresh, user: null }, version: 0 }))
      }, [tokens.access, tokens.refresh])
    }
    const page = await context.newPage()
    await page.goto(BASE + route.path, { waitUntil: 'load' })
    await page.waitForLoadState('networkidle', { timeout: 8000 }).catch(() => {})
    if (route.action) await route.action(page)
    await page.waitForTimeout(400)

    const result = await page.evaluate((minTarget) => {
      const viewport = window.innerWidth
      const scrollWidth = document.scrollingElement.scrollWidth
      const clipped = (el) => {
        for (let node = el.parentElement; node && node !== document.body; node = node.parentElement) {
          const style = getComputedStyle(node)
          if (/(auto|scroll|hidden|clip)/.test(style.overflowX)) return true
        }
        return false
      }
      const describe = (el) => {
        const cls = typeof el.className === 'string' ? el.className.split(' ').slice(0, 4).join('.') : ''
        return `${el.tagName.toLowerCase()}${cls ? '.' + cls : ''} «${(el.textContent || el.getAttribute('aria-label') || '').trim().slice(0, 30)}»`
      }
      const overflowing = []
      for (const el of document.querySelectorAll('body *')) {
        const rect = el.getBoundingClientRect()
        if (!rect.width || getComputedStyle(el).visibility === 'hidden') continue
        if ((rect.right > viewport + 1 || rect.left < -1) && !clipped(el)) overflowing.push(`${describe(el)} [${Math.round(rect.left)}..${Math.round(rect.right)}]`)
      }
      const small = []
      for (const el of document.querySelectorAll('button, a[href], input:not([type=hidden]), select, [role=button], [role=radio], [role=tab]')) {
        const rect = el.getBoundingClientRect()
        const style = getComputedStyle(el)
        // Skip hidden elements and visually hidden ones (sr-only skip link: 1×1).
        if (rect.width <= 1 || style.visibility === 'hidden' || el.closest('[aria-hidden=true]')) continue
        // Links inside running text are exempt (WCAG 2.5.8 inline exception).
        if (el.tagName === 'A' && style.display === 'inline') continue
        if (rect.width < minTarget || rect.height < minTarget) small.push(`${describe(el)} ${Math.round(rect.width)}×${Math.round(rect.height)}`)
      }
      return { viewport, scrollWidth, overflowing: overflowing.slice(0, 8), small }
    }, MIN_TARGET)

    checks++
    const label = `${String(width).padStart(4)}px  ${route.name}`
    if (result.scrollWidth > result.viewport + 1) {
      failures.push(label)
      console.log(`✗ ${label}: page is ${result.scrollWidth}px wide in a ${result.viewport}px viewport`)
      for (const line of result.overflowing) console.log(`      ${line}`)
    } else {
      console.log(`✓ ${label}`)
    }
    if (REPORT && result.small.length) {
      console.log(`      ${result.small.length} touch target(s) under ${MIN_TARGET}px:`)
      for (const line of [...new Set(result.small)].slice(0, 12)) console.log(`        ${line}`)
    }
    await context.close()
  }
}

await browser.close()
console.log(`\n${checks - failures.length}/${checks} page checks without horizontal overflow.`)
if (failures.length) {
  console.log(`Horizontal overflow on:\n  ${failures.join('\n  ')}`)
  process.exit(1)
}
