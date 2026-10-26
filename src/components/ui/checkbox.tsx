import * as RadixCheckbox from '@radix-ui/react-checkbox'
import { Check } from 'lucide-react'
import type { ReactNode } from 'react'

export function Checkbox({ checked, onChange, children, aside }: {
  checked: boolean; onChange: (checked: boolean) => void; children: ReactNode; aside?: ReactNode
}) {
  return (
    <label className="flex items-center gap-2.5 rounded-md px-1 py-1.5 text-sm hover:bg-surface-2">
      <RadixCheckbox.Root
        checked={checked}
        onCheckedChange={(value) => onChange(value === true)}
        className="grid size-5 shrink-0 place-items-center rounded-[5px] border-brutal-soft bg-surface transition-colors data-[state=checked]:bg-yellow"
      >
        <RadixCheckbox.Indicator><Check className="size-3.5 stroke-[3.5] text-[#0a0a0a]" /></RadixCheckbox.Indicator>
      </RadixCheckbox.Root>
      <span className="flex-1 font-medium">{children}</span>
      {aside && <span className="text-xs text-muted">{aside}</span>}
    </label>
  )
}
