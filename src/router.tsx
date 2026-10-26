import { createBrowserRouter } from 'react-router'

import { AppLayout, RequireAuth } from '@/components/layout/app-layout'
import { CartPage } from '@/pages/cart'
import { CheckoutPage } from '@/pages/checkout'
import { HomePage } from '@/pages/home'
import { ListingPage } from '@/pages/listing'
import { LoginPage } from '@/pages/login'
import { NotFoundPage } from '@/pages/not-found'
import { PaymentResultPage } from '@/pages/payment-result'
import { ProductPage } from '@/pages/product'
import { AddressesPage } from '@/pages/profile/addresses'
import { OrderDetailPage } from '@/pages/profile/order-detail'
import { OrdersPage } from '@/pages/profile/orders'
import { ProfileInfoPage } from '@/pages/profile/info'
import { ProfileLayout } from '@/pages/profile/layout'
import { WishlistPage } from '@/pages/profile/wishlist'
import { StaticPage } from '@/pages/static'

export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'category/:slug', element: <ListingPage /> },
      { path: 'search', element: <ListingPage /> },
      { path: 'product/:slug', element: <ProductPage /> },
      { path: 'cart', element: <CartPage /> },
      { path: 'login', element: <LoginPage /> },
      { path: 'payment/result', element: <PaymentResultPage /> },
      { path: 'about', element: <StaticPage page="about" /> },
      { path: 'contact', element: <StaticPage page="contact" /> },
      { path: 'terms', element: <StaticPage page="terms" /> },
      {
        element: <RequireAuth />,
        children: [
          { path: 'checkout', element: <CheckoutPage /> },
          {
            path: 'profile',
            element: <ProfileLayout />,
            children: [
              { index: true, element: <ProfileInfoPage /> },
              { path: 'orders', element: <OrdersPage /> },
              { path: 'orders/:number', element: <OrderDetailPage /> },
              { path: 'addresses', element: <AddressesPage /> },
              { path: 'wishlist', element: <WishlistPage /> },
            ],
          },
        ],
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
