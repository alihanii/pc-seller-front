import { create } from 'zustand'

type Theme = 'light' | 'dark'

function initial(): Theme {
  return document.documentElement.classList.contains('dark') ? 'dark' : 'light'
}

export const useTheme = create<{ theme: Theme; toggle: () => void }>((set, get) => ({
  theme: initial(),
  toggle: () => {
    const theme = get().theme === 'dark' ? 'light' : 'dark'
    document.documentElement.classList.toggle('dark', theme === 'dark')
    try {
      localStorage.setItem('pcs-theme', theme)
    } catch {
      /* storage unavailable */
    }
    set({ theme })
  },
}))
