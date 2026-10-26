export interface Paginated<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

export interface Brand { id: number; name: string; slug: string; logo: string | null }
export interface CategoryBrief { id: number; name: string; slug: string }
export interface CategoryNode extends CategoryBrief { children: CategoryNode[] }
export interface CategoryDetail extends CategoryBrief { breadcrumb: CategoryBrief[]; children: CategoryBrief[] }

export interface ProductCard {
  id: number
  name: string
  slug: string
  brand: Brand | null
  category: CategoryBrief
  image: string | null
  price: number | null
  original_price: number | null
  discount_percent: number
  in_stock: boolean
  rating: number | null
  rating_count: number
}

export interface VariantOptionValue {
  id: number
  type_id: number
  type: string
  display: 'color_swatch' | 'button'
  value: string
  color_hex: string
}

export type Availability = 'in_stock' | 'low_stock' | 'out_of_stock'

export interface ProductVariant {
  id: number
  sku: string
  options: VariantOptionValue[]
  price: number
  current_price: number
  discount_percent: number
  discount_ends_at: string | null
  availability: Availability
}

export interface VariantType {
  id: number
  name: string
  display: 'color_swatch' | 'button'
  options: { id: number; value: string; color_hex: string }[]
}

export interface ProductImage { id: number; image: string; alt: string; variant: number | null }

export interface ProductDetail extends ProductCard {
  description: string
  warranty: string
  breadcrumb: CategoryBrief[]
  images: ProductImage[]
  specifications: { group: string; items: { name: string; value: string }[] }[]
  variant_types: VariantType[]
  variants: ProductVariant[]
  similar: ProductCard[]
}

export interface FacetOption { id?: number; value: string; count: number }
export interface Facet {
  id: number
  name: string
  unit: string
  group: string | null
  data_type: 'text' | 'number' | 'choice' | 'multichoice' | 'boolean'
  param: string
  options?: FacetOption[]
  min?: string | null
  max?: string | null
  params?: string[]
  true_count?: number
  false_count?: number
}
export interface CategoryFacets {
  price: { min: number | null; max: number | null }
  brands: (Brand & { count: number })[]
  attributes: Facet[]
}

export interface Banner {
  id: number
  title: string
  subtitle: string
  image: string
  mobile_image: string | null
  link: string
  position: 'hero' | 'below_hero' | 'middle' | 'sidebar'
}

export interface Review {
  id: number
  author: string
  rating: number
  title: string
  body: string
  is_verified_buyer: boolean
  created_at: string
}

export interface User {
  id: number
  mobile: string
  first_name: string
  last_name: string
  email: string
  date_joined: string
}

export interface City { id: number; name: string }
export interface Province { id: number; name: string; cities: City[] }

export interface Address {
  id: number
  title: string
  recipient_name: string
  recipient_mobile: string
  province: number
  province_name: string
  city: number
  city_name: string
  address: string
  plaque: string
  unit: string
  postal_code: string
  is_default: boolean
  full_address: string
}

export interface CartItem {
  id: number
  variant: number
  sku: string
  product: { id: number; name: string; slug: string; image: string | null }
  options: string
  quantity: number
  unit_price: number
  current_price: number
  line_total: number
  warning: string | null
}

export interface Cart {
  token: string | null
  items: CartItem[]
  items_count: number
  subtotal: number
  items_discount: number
  discount: { code: string; amount: number; error: string | null } | null
  total: number
  has_problems: boolean
}

export interface ShippingOption {
  id: number
  name: string
  kind: 'post' | 'tipax' | 'courier' | 'pickup'
  description: string
  estimated_delivery: string
  cost: number
  requires_address: boolean
}

export type OrderStatus =
  | 'awaiting_payment' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned'

export interface OrderSummary {
  number: string
  status: OrderStatus
  status_display: string
  total: number
  items_count: number
  created_at: string
  paid_at: string | null
}

export interface OrderItem {
  id: number
  product: number | null
  product_slug: string | null
  variant: number | null
  product_name: string
  sku: string
  variant_label: string
  unit_price: number
  unit_discount: number
  final_unit_price: number
  quantity: number
  line_total: number
}

export interface OrderDetail {
  number: string
  status: OrderStatus
  status_display: string
  created_at: string
  items: OrderItem[]
  subtotal: number
  items_discount: number
  discount_code_text: string
  discount_amount: number
  shipping: { method: string; kind: string | null; cost: number; tracking_code: string }
  total: number
  address: {
    recipient_name: string; recipient_mobile: string; province: string; city: string; address: string; postal_code: string
  } | null
  note: string
  is_payable: boolean
  reservation_expires_at: string | null
  paid_at: string | null
  payment: {
    gateway: string; gateway_display: string; tracking_code: string; reference_number: string; paid_at: string | null
  } | null
  history: { status: OrderStatus; status_display: string; note: string; created_at: string }[]
}

export interface Gateway { bank_type: string; title: string }

export interface PaymentInfo {
  id: number
  gateway: string
  gateway_display: string
  amount: number
  status: 'initiated' | 'success' | 'failed' | 'needs_refund'
  status_display: string
  tracking_code: string
  reference_number: string
  created_at: string
  verified_at: string | null
}

export interface PaymentStatus {
  order: string
  order_status: OrderStatus
  order_status_display: string
  total: number
  is_paid: boolean
  can_retry: boolean
  reservation_expires_at: string | null
  last_payment: PaymentInfo | null
  gateways: Gateway[]
}

export interface StartPaymentResponse {
  payment: PaymentInfo
  gateway: { url: string; method: string; params: Record<string, string>; redirect_url: string }
}
