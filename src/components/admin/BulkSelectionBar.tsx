import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import type { ReactNode } from "react";

interface BulkSelectionBarProps {
  count: number;
  onClear: () => void;
  children: ReactNode;
}

export default function BulkSelectionBar({ count, onClear, children }: BulkSelectionBarProps) {
  if (count === 0) return null;
  return (
    <div className="sticky top-0 z-10 flex flex-wrap items-center gap-2 rounded-md border border-primary/30 bg-primary/10 backdrop-blur px-3 py-2 shadow-soft">
      <span className="font-body text-sm text-foreground">
        <span className="font-semibold">{count}</span> selected
      </span>
      <div className="ml-auto flex flex-wrap items-center gap-2">
        {children}
        <Button variant="ghost" size="sm" onClick={onClear} className="gap-1 text-muted-foreground">
          <X className="h-3.5 w-3.5" /> Clear
        </Button>
      </div>
    </div>
  );
}
