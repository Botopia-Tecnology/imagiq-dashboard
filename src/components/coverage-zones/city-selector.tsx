"use client"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { City } from "@/types/coverage-zones"

interface CitySelectorProps {
  cities: City[]
  selectedCityId?: string
  onCityChange: (cityId: string) => void
}

export function CitySelector({ cities, selectedCityId, onCityChange }: CitySelectorProps) {
  return (
    <Select value={selectedCityId} onValueChange={onCityChange}>
      <SelectTrigger className="w-[250px]">
        <SelectValue placeholder="Selecciona una ciudad" />
      </SelectTrigger>
      <SelectContent>
        {cities.map((city) => (
          <SelectItem key={city.id} value={city.id}>
            {city.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
