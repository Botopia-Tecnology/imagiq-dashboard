"use client";

import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useTestFilter } from "@/contexts/TestFilterContext";
import { FlaskConical } from "lucide-react";

export function TestFilterToggle() {
  const { excludeTest, setExcludeTest } = useTestFilter();
  const showTest = !excludeTest;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2">
            <FlaskConical className="h-4 w-4 text-muted-foreground" />
            <Label
              htmlFor="test-filter-toggle"
              className="text-sm font-medium cursor-pointer select-none"
            >
              Test
            </Label>
            <Switch
              id="test-filter-toggle"
              checked={showTest}
              onCheckedChange={(v) => setExcludeTest(!v)}
            />
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p className="max-w-xs text-xs">
            {showTest
              ? "Mostrando órdenes reales y de prueba. Las de prueba son las que tienen 'TEST' como palabra en el nombre o apellido del cliente."
              : "Ocultando órdenes de prueba (clientes con la palabra 'TEST' en nombre o apellido). Activa para ver todo."}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
