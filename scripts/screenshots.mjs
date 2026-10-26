// Screenshots of the running storefront using the locally installed Google Chrome.
// Usage: node scripts/screenshots.mjs [outDir] [page names...]
// Needs both servers running (Vite on 5173, Django on 8000) and demo data (seed_demo).
import { mkdirSync } from 'node:fs'
import { chromium } from 'playwright-core'

const BASE = process.env.BASE_URL ?? 'http://127.0.0.1:5173'
const out = process.argv[2] ?? '../docs/screenshots'
const only = process.argv.slice(3)
mkdirSync(out, { recursive: true })

const pages = [
  ['home', '/'],
  ['listing', '/category/ram'],
  ['product', '/product/corsair-vengeance-rgb-ddr5'],
  ['cart', '/cart', 'cart'],
  ['checkout', '/checkout', 'auth'],
  ['profile', '/profile/orders', 'auth'],
]

const browser = await chromium.launch({ channel: 'chrome' })
for (const [name, viewport] of [['desktop', { width: 1440, height: 900 }], ['mobile', { width: 390, height: 844 }]]) {
  const context = await browser.newContext({ viewport, deviceScaleFactor: 2, locale: 'fa-IR', reducedMotion: 'reduce' })
  if (process.env.ACCESS && process.env.REFRESH) {
    await context.addInitScript(([access, refresh]) => {
      localStorage.setItem('pcs-auth', JSON.stringify({ state: { access, refresh, user: null }, version: 0 }))
    }, [process.env.ACCESS, process.env.REFRESH])
  }
  const page = await context.newPage()
  for (const [title, path] of pages) {
    if (only.length && !only.includes(title)) continue
    await page.goto(BASE + path, { waitUntil: 'load' })
    await page.waitForLoadState('networkidle', { timeout: 8000 }).catch(() => {})
    await page.waitForTimeout(800)
    await page.screenshot({ path: `${out}/${title}-${name}.png`, fullPage: process.env.FULL === '1' })
    console.log(`${title}-${name}.png`)
  }
  await context.close()
}
await browser.close()
