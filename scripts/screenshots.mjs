// Screenshots of the running storefront (390px and 1440px) using the locally installed Google Chrome.
// Usage: node scripts/screenshots.mjs [outDir] [page names...]
// Needs both servers running (Vite on 5173, Django on 8000) and demo data (seed_demo).
import { mkdirSync } from 'node:fs'
import { chromium } from 'playwright-core'

import { demoTokens } from './dev-auth.mjs'

const BASE = process.env.BASE_URL ?? 'http://127.0.0.1:5173'
const out = process.argv[2] ?? 'docs/screenshots'
const only = process.argv.slice(3)
mkdirSync(out, { recursive: true })

const tokens = demoTokens()
const pages = [
  ['home', '/'],
  ['listing', '/category/gpu'],
  ['product', '/product/corsair-vengeance-rgb-ddr5'],
  ['search', '/search?q=Samsung'],
  ['cart', '/cart'],
  ['checkout', '/checkout'],
  ['profile-orders', '/profile/orders'],
  ...(tokens.order ? [['order-detail', `/profile/orders/${tokens.order}`]] : []),
  ['login', '/login', 'guest'],
  ['not-found', '/no-such-page', 'guest'],
]

const browser = await chromium.launch({ channel: 'chrome' })
for (const [name, viewport] of [['desktop', { width: 1440, height: 900 }], ['mobile', { width: 390, height: 844 }]]) {
  const context = await browser.newContext({ viewport, deviceScaleFactor: 2, locale: 'fa-IR', reducedMotion: 'reduce' })
  const page = await context.newPage()
  for (const [title, path, mode] of pages) {
    if (only.length && !only.includes(title)) continue
    await page.evaluate(() => localStorage.removeItem('pcs-auth')).catch(() => {})
    if (mode !== 'guest') {
      await page.goto(BASE + '/about')
      await page.evaluate(([access, refresh]) => {
        localStorage.setItem('pcs-auth', JSON.stringify({ state: { access, refresh, user: null }, version: 0 }))
      }, [tokens.access, tokens.refresh])
    }
    await page.goto(BASE + path, { waitUntil: 'load' })
    await page.waitForLoadState('networkidle', { timeout: 8000 }).catch(() => {})
    await page.evaluate(() => document.querySelectorAll('img[loading=lazy]').forEach((img) => { img.loading = 'eager' }))
    await page.waitForTimeout(900)
    await page.screenshot({ path: `${out}/${title}-${name}.png`, fullPage: process.env.FULL === '1' })
    console.log(`${title}-${name}.png`)
  }
  await context.close()
}
await browser.close()
