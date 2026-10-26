import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { useAuth } from '@/stores/auth'
import { useCartStore } from '@/stores/cart'

import { api } from './api'
import type {
  Address, Banner, Brand, Cart, CategoryDetail, CategoryFacets, CategoryNode, Gateway, OrderDetail, OrderSummary,
  Paginated, PaymentStatus, ProductCard, ProductDetail, Province, Review, ShippingOption, StartPaymentResponse, User,
} from './types'

const get = <T>(url: string, params?: unknown) => api.get<T>(url, { params }).then((r) => r.data)

export const keys = {
  cart: ['cart'] as const,
  me: ['me'] as const,
  addresses: ['addresses'] as const,
  wishlist: ['wishlist'] as const,
  orders: ['orders'] as const,
}

// --- Catalog ---------------------------------------------------------------

export const useCategories = () =>
  useQuery({ queryKey: ['categories'], queryFn: () => get<CategoryNode[]>('/categories/'), staleTime: 5 * 60_000 })

export const useCategory = (slug: string | undefined) =>
  useQuery({ queryKey: ['category', slug], queryFn: () => get<CategoryDetail>(`/categories/${slug}/`), enabled: !!slug })

export const useBrands = () =>
  useQuery({ queryKey: ['brands'], queryFn: () => get<Brand[]>('/brands/'), staleTime: 5 * 60_000 })

export const useBanners = (position?: string) =>
  useQuery({ queryKey: ['banners', position], queryFn: () => get<Banner[]>('/banners/', { position }) })

export const useProducts = (params: Record<string, string>, enabled = true) =>
  useQuery({
    queryKey: ['products', params],
    queryFn: () => get<Paginated<ProductCard>>('/products/', params),
    placeholderData: keepPreviousData,
    enabled,
  })

export const useFacets = (slug: string | undefined, params: Record<string, string>) =>
  useQuery({
    queryKey: ['facets', slug, params],
    queryFn: () => get<CategoryFacets>(`/categories/${slug}/filters/`, params),
    enabled: !!slug,
    placeholderData: keepPreviousData,
  })

export const useProduct = (slug: string | undefined) =>
  useQuery({ queryKey: ['product', slug], queryFn: () => get<ProductDetail>(`/products/${slug}/`), enabled: !!slug })

export const useReviews = (slug: string) =>
  useQuery({ queryKey: ['reviews', slug], queryFn: () => get<Paginated<Review>>(`/products/${slug}/reviews/`) })

export const useSubmitReview = (slug: string) =>
  useMutation({
    mutationFn: (body: { rating: number; title: string; body: string }) =>
      api.post<Review & { detail: string }>(`/products/${slug}/reviews/`, body).then((r) => r.data),
  })

// --- Auth & profile --------------------------------------------------------

export const useMe = () => {
  const access = useAuth((s) => s.access)
  return useQuery({ queryKey: keys.me, queryFn: () => get<User>('/me/'), enabled: !!access })
}

export const useUpdateMe = () => {
  const client = useQueryClient()
  return useMutation({
    mutationFn: (body: Partial<User>) => api.patch<User>('/me/', body).then((r) => r.data),
    onSuccess: (user) => {
      client.setQueryData(keys.me, user)
      useAuth.getState().setUser(user)
    },
  })
}

export const useProvinces = () =>
  useQuery({ queryKey: ['provinces'], queryFn: () => get<Province[]>('/provinces/'), staleTime: Infinity })

export const useAddresses = () => {
  const access = useAuth((s) => s.access)
  return useQuery({ queryKey: keys.addresses, queryFn: () => get<Address[]>('/me/addresses/'), enabled: !!access })
}

export const useSaveAddress = () => {
  const client = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...body }: Partial<Address>) =>
      (id ? api.patch<Address>(`/me/addresses/${id}/`, body) : api.post<Address>('/me/addresses/', body)).then((r) => r.data),
    onSuccess: () => client.invalidateQueries({ queryKey: keys.addresses }),
  })
}

export const useDeleteAddress = () => {
  const client = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => api.delete(`/me/addresses/${id}/`),
    onSuccess: () => client.invalidateQueries({ queryKey: keys.addresses }),
  })
}

export const useSetDefaultAddress = () => {
  const client = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => api.post(`/me/addresses/${id}/set-default/`),
    onSuccess: () => client.invalidateQueries({ queryKey: keys.addresses }),
  })
}

export const useWishlist = () => {
  const access = useAuth((s) => s.access)
  return useQuery({
    queryKey: keys.wishlist,
    queryFn: () => get<Paginated<ProductCard>>('/me/wishlist/'),
    enabled: !!access,
  })
}

export const useToggleWishlist = () => {
  const client = useQueryClient()
  return useMutation({
    mutationFn: ({ productId, liked }: { productId: number; liked: boolean }) =>
      liked ? api.delete(`/me/wishlist/${productId}/`) : api.post('/me/wishlist/', { product: productId }),
    onSuccess: () => client.invalidateQueries({ queryKey: keys.wishlist }),
  })
}

// --- Cart ------------------------------------------------------------------

export const useCart = () => {
  const access = useAuth((s) => s.access)
  const token = useCartStore((s) => s.token)
  return useQuery({ queryKey: [...keys.cart, !!access, token && !access], queryFn: () => get<Cart>('/cart/') })
}

function useCartMutation<V>(fn: (vars: V) => Promise<{ data: Cart }>) {
  const client = useQueryClient()
  return useMutation({
    mutationFn: (vars: V) => fn(vars).then((r) => r.data),
    onSuccess: (cart) => {
      client.setQueriesData({ queryKey: keys.cart }, cart)
      client.invalidateQueries({ queryKey: keys.cart })
    },
  })
}

export const useAddToCart = () =>
  useCartMutation(({ variant, quantity = 1 }: { variant: number; quantity?: number }) =>
    api.post<Cart>('/cart/items/', { variant, quantity }),
  )

export const useUpdateCartItem = () =>
  useCartMutation(({ id, quantity }: { id: number; quantity: number }) => api.patch<Cart>(`/cart/items/${id}/`, { quantity }))

export const useRemoveCartItem = () => useCartMutation((id: number) => api.delete<Cart>(`/cart/items/${id}/`))

export const useApplyDiscount = () => useCartMutation((code: string) => api.post<Cart>('/cart/discount/', { code }))

export const useRemoveDiscount = () => useCartMutation(() => api.delete<Cart>('/cart/discount/'))

// --- Checkout, orders, payments ------------------------------------------------

export const useShippingOptions = (addressId: number | null) =>
  useQuery({
    queryKey: ['shipping', addressId],
    queryFn: () => get<ShippingOption[]>('/shipping-methods/', addressId ? { address: addressId } : {}),
  })

export const useGateways = () => useQuery({ queryKey: ['gateways'], queryFn: () => get<Gateway[]>('/payments/gateways/') })

export const useCheckout = () => {
  const client = useQueryClient()
  return useMutation({
    mutationFn: (body: { shipping_method: number; address: number | null; note: string }) =>
      api.post<OrderDetail>('/checkout/', body).then((r) => r.data),
    onSuccess: () => {
      client.invalidateQueries({ queryKey: keys.cart })
      client.invalidateQueries({ queryKey: keys.orders })
    },
  })
}

export const useStartPayment = () =>
  useMutation({
    mutationFn: ({ number, gateway }: { number: string; gateway: string }) =>
      api.post<StartPaymentResponse>(`/orders/${number}/pay/`, { gateway }).then((r) => r.data),
  })

export const usePaymentStatus = (number: string | null) =>
  useQuery({
    queryKey: ['payment-status', number],
    queryFn: () => get<PaymentStatus>(`/orders/${number}/payment-status/`),
    enabled: !!number,
  })

export const useOrders = (status: string) => {
  const access = useAuth((s) => s.access)
  return useQuery({
    queryKey: [...keys.orders, status],
    queryFn: () => get<Paginated<OrderSummary>>('/orders/', status ? { status } : {}),
    enabled: !!access,
    placeholderData: keepPreviousData,
  })
}

export const useOrder = (number: string | undefined) =>
  useQuery({ queryKey: [...keys.orders, 'detail', number], queryFn: () => get<OrderDetail>(`/orders/${number}/`), enabled: !!number })

export const useCancelOrder = () => {
  const client = useQueryClient()
  return useMutation({
    mutationFn: (number: string) => api.post<OrderDetail>(`/orders/${number}/cancel/`).then((r) => r.data),
    onSuccess: () => client.invalidateQueries({ queryKey: keys.orders }),
  })
}

/** Send the browser to the bank: a form POST/GET with the gateway's parameters. */
export function redirectToGateway({ url, method, params }: StartPaymentResponse['gateway']) {
  const form = document.createElement('form')
  form.method = method.toUpperCase() === 'POST' ? 'POST' : 'GET'
  form.action = url
  for (const [name, value] of Object.entries(params ?? {})) {
    const input = document.createElement('input')
    input.type = 'hidden'
    input.name = name
    input.value = value
    form.appendChild(input)
  }
  document.body.appendChild(form)
  form.submit()
}
