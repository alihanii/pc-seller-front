import { Box, Cpu, Gamepad2, Gpu, HardDrive, Headphones, Keyboard, MemoryStick, Monitor, Mouse, PcCase, Zap } from 'lucide-react'
import type { LucideProps } from 'lucide-react'

const ICONS: Record<string, typeof Cpu> = {
  cpu: Cpu, gpu: Gpu, ram: MemoryStick, ssd: HardDrive, psu: Zap, case: PcCase, monitor: Monitor,
  peripherals: Gamepad2, keyboard: Keyboard, mouse: Mouse, headset: Headphones,
}

export function CategoryIcon({ slug, ...props }: { slug: string } & LucideProps) {
  const Icon = ICONS[slug] ?? Box
  return <Icon {...props} />
}
