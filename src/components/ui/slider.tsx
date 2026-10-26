import * as RadixSlider from '@radix-ui/react-slider'

export function RangeSlider({ min, max, step, value, onValueChange, onValueCommit }: {
  min: number; max: number; step: number; value: [number, number]
  onValueChange: (value: [number, number]) => void; onValueCommit?: (value: [number, number]) => void
}) {
  return (
    <RadixSlider.Root
      dir="rtl"
      min={min} max={max} step={step} value={value} minStepsBetweenThumbs={1}
      onValueChange={(v) => onValueChange([v[0], v[1]])}
      onValueCommit={(v) => onValueCommit?.([v[0], v[1]])}
      className="relative flex h-6 w-full touch-none select-none items-center"
    >
      <RadixSlider.Track className="relative h-2.5 grow rounded-full border-brutal-soft bg-surface-2">
        <RadixSlider.Range className="absolute h-full rounded-full bg-blue" />
      </RadixSlider.Track>
      {[0, 1].map((i) => (
        <RadixSlider.Thumb
          key={i}
          aria-label={i === 0 ? 'حداقل قیمت' : 'حداکثر قیمت'}
          className="block size-5 rounded-md border-brutal-soft bg-yellow shadow-brutal-sm transition-transform hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue"
        />
      ))}
    </RadixSlider.Root>
  )
}
