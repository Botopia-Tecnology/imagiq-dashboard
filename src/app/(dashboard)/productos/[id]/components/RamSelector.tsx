interface RamSelectorProps {
  rams: string[]
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
            key={ram}
            onClick={() => onRamChange(ram)}
            className={`px-4 py-2 rounded-md border-2 text-sm font-medium transition-all cursor-pointer hover:border-primary/50 ${
              selectedRam === ram
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border"
            }`}
          >
            {ram}
          </button>
        ))}
      </div>
    </div>
  )
}
