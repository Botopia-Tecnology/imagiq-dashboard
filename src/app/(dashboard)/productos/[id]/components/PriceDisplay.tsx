interface PriceDisplayProps {
  currentPrice?: string
  currentOriginalPrice?: string
}

export function PriceDisplay({
  currentPrice,
  currentOriginalPrice,
}: PriceDisplayProps) {
  return (
    <div className="flex items-baseline gap-3">
      <span className="text-3xl font-bold">{currentPrice}</span>
      {currentOriginalPrice && (
        <span className="text-xl text-muted-foreground line-through">
          {currentOriginalPrice}
        </span>
      )}
    </div>
  )
}
