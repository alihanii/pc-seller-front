import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios'

import { useAuth } from '@/stores/auth'
import { useCartStore } from '@/stores/cart'

export const API_URL = import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:8000/api'

export const api = axios.create({ baseURL: API_URL })

api.interceptors.request.use((config) => {
  const { access } = useAuth.getState()
  const { token } = useCartStore.getState()
  if (access) config.headers.Authorization = `Bearer ${access}`
  // Sent even when logged in: the API then merges the guest cart into the user's.
  if (token) config.headers['X-Cart-Token'] = token
  return config
})

api.interceptors.response.use((response) => {
  const data = response.data as { token?: unknown; items?: unknown } | undefined
  // Cart responses carry the cart token; a guest keeps it, a logged-in user no longer needs one.
  if (data && typeof data === 'object' && 'items' in data && 'token' in data) {
    useCartStore.getState().setToken(useAuth.getState().access ? null : (data.token as string | null))
  }
  return response
}, refreshOnUnauthorized)

let refreshing: Promise<string | null> | null = null

async function refreshAccess(): Promise<string | null> {
  const { refresh, setTokens, logout } = useAuth.getState()
  if (!refresh) return null
  try {
    const { data } = await axios.post(`${API_URL}/auth/token/refresh/`, { refresh })
    setTokens(data.access, data.refresh ?? refresh)
    return data.access as string
  } catch {
    logout()
    return null
  }
}

async function refreshOnUnauthorized(error: AxiosError) {
  const config = error.config as (InternalAxiosRequestConfig & { _retried?: boolean }) | undefined
  if (error.response?.status !== 401 || !config || config._retried || !useAuth.getState().refresh) {
    throw error
  }
  config._retried = true
  refreshing ??= refreshAccess().finally(() => {
    refreshing = null
  })
  const access = await refreshing
  if (!access) {
    delete config.headers.Authorization
    // A stale token on a public endpoint: retry anonymously.
    return api.request(config)
  }
  config.headers.Authorization = `Bearer ${access}`
  return api.request(config)
}

/** The Persian message from an API error response. */
export function errorMessage(error: unknown, fallback = 'خطایی رخ داد. دوباره تلاش کنید.') {
  if (axios.isAxiosError(error)) {
    if (!error.response) return 'ارتباط با سرور برقرار نشد.'
    const data = error.response.data as Record<string, unknown> | undefined
    if (data) {
      if (typeof data.detail === 'string') return data.detail
      const first = Object.values(data)[0]
      if (Array.isArray(first) && typeof first[0] === 'string') return first[0]
      if (typeof first === 'string') return first
    }
  }
  return fallback
}

/** Field errors from a DRF validation response. */
export function fieldErrors(error: unknown): Record<string, string> {
  if (!axios.isAxiosError(error) || error.response?.status !== 400) return {}
  const data = error.response.data as Record<string, unknown>
  return Object.fromEntries(
    Object.entries(data)
      .filter(([, value]) => Array.isArray(value) && typeof value[0] === 'string')
      .map(([key, value]) => [key, (value as string[])[0]]),
  )
}
