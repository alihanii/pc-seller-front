# PC Seller — storefront

React 19 + TypeScript + Vite, Tailwind CSS v4, React Router, TanStack Query, Zustand, axios, Motion, Radix primitives,
lucide icons and the Vazirmatn font. Right-to-left Persian UI, Persian digits, prices in toman (the API stores rial),
Jalali dates.

```bash
npm install
cp .env.example .env   # VITE_API_URL, defaults to http://127.0.0.1:8000/api
npm run dev            # http://127.0.0.1:5173 (the backend must be running)
npm run build          # type-check and production build
npm run lint
```

For a populated store run `python manage.py seed_demo` in `backend/`.

## Design system

The look is Neo-Brutalist: thick outlines, hard offset shadows, heavy type and sticker badges, toned down on forms,
tables, cart and checkout. Every colour, outline width, shadow, radius and font is a token in `src/index.css`
(`:root` and `.dark`); components only use those tokens, so restyling the store means editing that file.

| Token | Light | Dark |
| --- | --- | --- |
| background `--c-bg` | `#FAF7F0` | `#121210` |
| surface `--c-surface` | `#FFFFFF` | `#1C1C19` |
| ink / outline `--c-ink`, `--c-line` | `#0A0A0A` | `#F5F2EA` |
| yellow (primary) `--c-yellow` | `#FFE600` | `#FFE600` |
| electric blue `--c-blue` | `#2D5BFF` | `#5A7CFF` |
| pink / cyan / green accents | `#FF5CA8` / `#2EE6D6` / `#00B86B` | same |
| red (discounts, errors) `--c-red` | `#FF4D2E` | same |

Motion is short (150–300 ms) and respects `prefers-reduced-motion`.

## Layout

- `src/lib` — API client (JWT refresh, guest cart token), query hooks, types, formatting
- `src/stores` — auth, cart token, theme
- `src/components/ui` — design-system primitives; `layout` — header, footer, shell; `product` — cards, grid, filters
- `src/pages` — routes (secondary pages are loaded on demand)

`scripts/screenshots.mjs` captures pages with the locally installed Google Chrome; the screenshots in
`../docs/screenshots` were taken with demo data.
