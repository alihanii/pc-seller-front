import type { OrderStatus } from './types'

export const ORDER_STATUS_TONE: Record<OrderStatus, string> = {
  awaiting_payment: 'bg-yellow text-[#0a0a0a]',
  paid: 'bg-cyan text-[#0a0a0a]',
  processing: 'bg-blue text-on-blue',
  shipped: 'bg-pink text-[#0a0a0a]',
  delivered: 'bg-green text-[#0a0a0a]',
  cancelled: 'bg-surface-2 text-muted',
  returned: 'bg-red text-[#0a0a0a]',
}

export const ORDER_FILTERS: [string, string][] = [
  ['', 'همه'],
  ['awaiting_payment', 'در انتظار پرداخت'],
  ['paid', 'پرداخت شده'],
  ['processing', 'در حال پردازش'],
  ['shipped', 'ارسال شده'],
  ['delivered', 'تحویل شده'],
  ['cancelled', 'لغو شده'],
]

/** The normal path an order travels, for the progress tracker. */
export const ORDER_FLOW: OrderStatus[] = ['awaiting_payment', 'paid', 'processing', 'shipped', 'delivered']
