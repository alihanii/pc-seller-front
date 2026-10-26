import { createBrowserRouter } from 'react-router'
import type { ComponentType } from 'react'

import { AppLayout, RequireAuth } from '@/components/layout/app-layout'
import { HomePage } from '@/pages/home'
import { ListingPage } from '@/pages/listing'
import { ProductPage } from '@/pages/product'

/** A route whose page module is loaded on first visit. */
function page<T>(load: () => Promise<T>, pick: (module: T) => ComponentType<object>) {
  return async () => ({ Component: pick(await load()) })
}

export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    // Shown while a lazily loaded page opened directly by URL is fetched.
    HydrateFallback: () => <div className="min-h-dvh" />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'category/:slug', element: <ListingPage /> },
      { path: 'search', element: <ListingPage /> },
      { path: 'product/:slug', element: <ProductPage /> },
      { path: 'cart', lazy: page(() => import('@/pages/cart'), (m) => m.CartPage) },
      { path: 'login', lazy: page(() => import('@/pages/login'), (m) => m.LoginPage) },
      { path: 'payment/result', lazy: page(() => import('@/pages/payment-result'), (m) => m.PaymentResultPage) },
      { path: 'about', lazy: page(() => import('@/pages/static'), (m) => () => m.StaticPage({ page: 'about' })) },
      { path: 'contact', lazy: page(() => import('@/pages/static'), (m) => () => m.StaticPage({ page: 'contact' })) },
      { path: 'terms', lazy: page(() => import('@/pages/static'), (m) => () => m.StaticPage({ page: 'terms' })) },
      {
        element: <RequireAuth />,
        children: [
          { path: 'checkout', lazy: page(() => import('@/pages/checkout'), (m) => m.CheckoutPage) },
          {
            path: 'profile',
            lazy: page(() => import('@/pages/profile/layout'), (m) => m.ProfileLayout),
            children: [
              { index: true, lazy: page(() => import('@/pages/profile/info'), (m) => m.ProfileInfoPage) },
              { path: 'orders', lazy: page(() => import('@/pages/profile/orders'), (m) => m.OrdersPage) },
              { path: 'orders/:number', lazy: page(() => import('@/pages/profile/order-detail'), (m) => m.OrderDetailPage) },
              { path: 'addresses', lazy: page(() => import('@/pages/profile/addresses'), (m) => m.AddressesPage) },
              { path: 'wishlist', lazy: page(() => import('@/pages/profile/wishlist'), (m) => m.WishlistPage) },
            ],
          },
        ],
      },
      { path: '*', lazy: page(() => import('@/pages/not-found'), (m) => m.NotFoundPage) },
    ],
  },
])
