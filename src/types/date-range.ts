export type DateRangePreset = "weekly" | "monthly" | "90d" | "custom";

export interface DateRange {
  preset: DateRangePreset;
  from: Date;
  to: Date;
}

const DAY_MS = 86_400_000;

export function getPresetRange(
  preset: Exclude<DateRangePreset, "custom">,
): { from: Date; to: Date } {
  const to = new Date();
  const days = preset === "weekly" ? 7 : preset === "90d" ? 90 : 30;
  const from = new Date(to.getTime() - days * DAY_MS);
  return { from, to };
}

export function makeDefaultRange(): DateRange {
  return { preset: "monthly", ...getPresetRange("monthly") };
}

export const PRESET_LABELS: Record<DateRangePreset, string> = {
  weekly: "Semanal",
  monthly: "Mensual",
  "90d": "Últimos 90 días",
  custom: "Personalizado",
};
