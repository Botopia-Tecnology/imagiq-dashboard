"use client";

import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface CopyFieldProps {
  label: string;
  value: string | number | null | undefined;
  mono?: boolean;
  className?: string;
}

export function CopyField({ label, value, mono, className }: CopyFieldProps) {
  const [copied, setCopied] = useState(false);
  const display = value === null || value === undefined || value === "" ? "—" : String(value);
  const canCopy = display !== "—";

  const handleCopy = async () => {
    if (!canCopy) return;
    await navigator.clipboard.writeText(display);
    setCopied(true);
    toast.success(`${label} copiado`);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className={`flex flex-col gap-1 min-w-0 ${className ?? ""}`}>
      <span className="text-xs text-muted-foreground">{label}</span>
      <div className="flex items-center gap-1 min-w-0">
        <span
          className={`text-sm truncate ${mono ? "font-mono" : ""} ${
            canCopy ? "" : "text-muted-foreground"
          }`}
          title={display}
        >
          {display}
        </span>
        {canCopy && (
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 shrink-0"
            onClick={handleCopy}
            aria-label={`Copiar ${label}`}
          >
            {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
          </Button>
        )}
      </div>
    </div>
  );
}
