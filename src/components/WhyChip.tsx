import { Info } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export function WhyChip({ data, confidence }: { data: string[]; confidence: string }) {
  return (
    <Popover>
      <PopoverTrigger className="inline-flex items-center gap-1.5 rounded-full border border-border px-2.5 py-1 text-[11px] text-muted-foreground transition-colors hover:border-accent hover:text-accent">
        <Info className="size-3" />
        Por que estou vendo isso?
      </PopoverTrigger>
      <PopoverContent className="w-80 border-border bg-popover text-sm">
        <p className="font-display text-xs uppercase tracking-widest text-muted-foreground">
          Dados utilizados
        </p>
        <ul className="mt-2 space-y-1.5 text-xs text-foreground/90">
          {data.map((d) => (
            <li key={d} className="flex gap-2">
              <span className="mt-1.5 size-1 shrink-0 rounded-full bg-accent" />
              {d}
            </li>
          ))}
        </ul>
        <p className="mt-3 text-[11px] text-muted-foreground">
          Nível de confiança: <span className="text-accent">{confidence}</span> · estimativa, não promessa de resultado.
        </p>
      </PopoverContent>
    </Popover>
  );
}
