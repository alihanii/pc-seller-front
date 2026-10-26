import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface CartState {
  /** Guest cart token from the API (sent as X-Cart-Token). */
  token: string | null
  /** Bumped on every add so the header cart icon can bounce. */
  pulse: number
  setToken: (token: string | null) => void
  bump: () => void
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      token: null,
      pulse: 0,
      setToken: (token) => set({ token }),
      bump: () => set((state) => ({ pulse: state.pulse + 1 })),
    }),
    { name: 'pcs-cart', partialize: (state) => ({ token: state.token }) },
  ),
)
