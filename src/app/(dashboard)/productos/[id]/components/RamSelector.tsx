interface RamSelectorProps {
  rams: Array<{ value: string; missingImages: boolean }>
  selectedRam?: string
  onRamChange: (ram: string) => void
}

export function RamSelector({
  rams,
  selectedRam,
  onRamChange,
}: RamSelectorProps) {
  if (rams.length === 0) return null

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium">
        RAM: {selectedRam || 'Selecciona la RAM'}
      </label>
      <div className="flex flex-wrap gap-2">
        {rams.map((ram) => (
          <button
            key={ram.value}
            onClick={() => onRamChange(ram.value)}
            className={`relative px-4 py-2 rounded-md border-2 text-sm font-medium transition-all cursor-pointer hover:border-primary/50 ${
              selectedRam === ram.value
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border"
            }`}
          >
            {ram.value}
            {ram.missingImages && (
              <span
                className="absolute -top-1.5 -right-1.5 h-3 w-3 rounded-full bg-amber-500 border-2 border-background"
                title="Sin imágenes"
                aria-label="Sin imágenes"
              />
            )}
          </button>
        ))}
      </div>
    </div>
  )
}
