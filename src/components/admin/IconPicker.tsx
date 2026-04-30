import { EVENT_ICONS, EVENT_ICON_NAMES } from "@/lib/event-icons";
import { cn } from "@/lib/utils";

interface IconPickerProps {
  value: string;
  onChange: (name: string) => void;
}

export default function IconPicker({ value, onChange }: IconPickerProps) {
  return (
    <div className="grid grid-cols-8 gap-2 p-2 rounded-lg border border-primary/10 bg-muted/30">
      {EVENT_ICON_NAMES.map((name) => {
        const Icon = EVENT_ICONS[name];
        const selected = value === name;
        return (
          <button
            key={name}
            type="button"
            title={name}
            onClick={() => onChange(name)}
            className={cn(
              "flex items-center justify-center aspect-square rounded-md border transition-all",
              selected
                ? "bg-primary/10 border-primary text-primary ring-2 ring-primary/40"
                : "bg-card border-transparent hover:border-primary/30 text-foreground/70 hover:text-foreground"
            )}
          >
            <Icon className="h-4 w-4" />
          </button>
        );
      })}
    </div>
  );
}
