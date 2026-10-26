import { Box, Cpu, Gamepad2, Gpu, HardDrive, Headphones, Keyboard, MemoryStick, Monitor, Mouse, PcCase, Zap } from 'lucide-react'
import type { LucideProps } from 'lucide-react'

const ICONS: Record<string, typeof Cpu> = {
  cpu: Cpu, gpu: Gpu, ram: MemoryStick, ssd: HardDrive, psu: Zap, case: PcCase, monitor: Monitor,
  peripherals: Gamepad2, keyboard: Keyboard, mouse: Mouse, headset: Headphones,
}

/** Tile colours for the category grid, cycled by position. */
export const CATEGORY_TONES = [
  'bg-yellow text-[#0a0a0a]', 'bg-cyan text-[#0a0a0a]', 'bg-pink text-[#0a0a0a]', 'bg-blue text-white', 'bg-green text-[#0a0a0a]', 'bg-surface text-ink',
]

export function CategoryIcon({ slug, ...props }: { slug: string } & LucideProps) {
  const Icon = ICONS[slug] ?? Box
  return <Icon {...props} />
}
