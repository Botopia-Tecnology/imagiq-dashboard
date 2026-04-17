"use client";

import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronRight, Copy, Download } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface JsonViewerProps {
  data: unknown;
  title?: string;
  defaultOpen?: boolean;
  downloadName?: string;
}

export function JsonViewer({ data, title = "JSON", defaultOpen = false, downloadName }: JsonViewerProps) {
  const [open, setOpen] = useState(defaultOpen);
  const serialized = JSON.stringify(data, null, 2);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(serialized);
    toast.success("JSON copiado");
  };

  const handleDownload = () => {
    const blob = new Blob([serialized], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = downloadName || "response.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Collapsible open={open} onOpenChange={setOpen} className="border rounded-md">
      <div className="flex items-center justify-between px-3 py-2 border-b">
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="sm" className="h-7 gap-1 px-2">
            {open ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
            <span className="text-xs font-mono">{title}</span>
          </Button>
        </CollapsibleTrigger>
        <div className="flex gap-1">
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={handleCopy} aria-label="Copiar JSON">
            <Copy className="h-3 w-3" />
          </Button>
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={handleDownload} aria-label="Descargar JSON">
            <Download className="h-3 w-3" />
          </Button>
        </div>
      </div>
      <CollapsibleContent>
        <pre className="p-3 text-xs font-mono overflow-x-auto max-h-96 overflow-y-auto bg-muted/30">
          {serialized}
        </pre>
      </CollapsibleContent>
    </Collapsible>
  );
}
