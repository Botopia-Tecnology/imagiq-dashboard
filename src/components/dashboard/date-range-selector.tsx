"use client";

import { useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  DateRange,
  DateRangePreset,
  PRESET_LABELS,
  getPresetRange,
} from "@/types/date-range";

interface Props {
  value: DateRange;
  onChange: (range: DateRange) => void;
}

function formatRangeLabel(from: Date, to: Date): string {
  return `${format(from, "d MMM yy", { locale: es })} – ${format(to, "d MMM yy", { locale: es })}`;
}

export function DateRangeSelector({ value, onChange }: Props) {
  const [popoverOpen, setPopoverOpen] = useState(false);

  const handlePresetChange = (preset: DateRangePreset) => {
    if (preset === "custom") {
      // Mantener el rango actual y abrir el picker
      onChange({ ...value, preset: "custom" });
      setPopoverOpen(true);
      return;
    }
    const range = getPresetRange(preset);
    onChange({ preset, ...range });
  };

  const handleCustomSelect = (selected: { from?: Date; to?: Date } | undefined) => {
    if (!selected?.from || !selected?.to) return;
    onChange({ preset: "custom", from: selected.from, to: selected.to });
  };

  return (
    <div className="flex items-center gap-2">
      <Select value={value.preset} onValueChange={handlePresetChange}>
        <SelectTrigger className="w-[150px] h-9">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {(Object.keys(PRESET_LABELS) as DateRangePreset[]).map((key) => (
            <SelectItem key={key} value={key}>
              {PRESET_LABELS[key]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="h-9 font-normal"
            disabled={value.preset !== "custom" && !popoverOpen}
          >
            <CalendarIcon className="h-4 w-4 mr-2 text-muted-foreground" />
            {formatRangeLabel(value.from, value.to)}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="end">
          <Calendar
            mode="range"
            defaultMonth={value.from}
            selected={{ from: value.from, to: value.to }}
            onSelect={handleCustomSelect}
            numberOfMonths={2}
            disabled={(date) => date > new Date()}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
