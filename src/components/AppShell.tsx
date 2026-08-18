import { Link } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Radar,
  TrendingUp,
  Clapperboard,
  MessageSquareText,
  Youtube,
  Menu,
  X,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { useChannel } from "@/lib/use-channel";
import { cn } from "@/lib/utils";

const nav = [
  { to: "/", label: "Painel", icon: LayoutDashboard },
  { to: "/oportunidades", label: "Oportunidades", icon: Radar },
  { to: "/tendencias", label: "Tendências", icon: TrendingUp },
  { to: "/proximo-video", label: "Meu próximo vídeo", icon: Clapperboard },
  { to: "/assistente", label: "Assistente IA", icon: MessageSquareText },
  { to: "/conectar", label: "Conectar canal", icon: Youtube },
] as const;

function stageLabel(subs: number) {
  if (subs < 1000) return "Nível 1 — Iniciante";
  if (subs < 100000) return "Nível 2 — Crescimento";
  if (subs < 1000000) return "Nível 3 — Consolidado";
  return "Nível 4 — Profissional";
}

export function AppShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const { snapshot } = useChannel();


  return (
    <div className="min-h-screen bg-background lg:flex">
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 border-r border-sidebar-border bg-sidebar p-5 transition-transform lg:static lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="font-display text-lg font-bold tracking-tight">Órbita<span className="text-accent">.</span></p>
            <p className="text-xs text-muted-foreground">Copiloto estratégico</p>
          </div>
          <button className="lg:hidden text-muted-foreground" onClick={() => setOpen(false)} aria-label="Fechar menu">
            <X className="size-5" />
          </button>
        </div>

        <nav className="mt-8 space-y-1">
          {nav.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setOpen(false)}
              activeOptions={{ exact: item.to === "/" }}
              activeProps={{ className: "bg-sidebar-accent text-sidebar-accent-foreground" }}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            >
              <item.icon className="size-4" />
              {item.label}
            </Link>
          ))}
        </nav>

        {snapshot ? (
          <div className="mt-8 rounded-xl border border-sidebar-border bg-surface-2 p-4">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Canal conectado</p>
            <p className="mt-1 truncate font-display text-sm font-semibold">{snapshot.title}</p>
            <p className="text-xs text-muted-foreground">
              {snapshot.subscribers.toLocaleString("pt-BR")} inscritos
            </p>
            <p className="mt-3 inline-flex rounded-full bg-accent/15 px-2.5 py-1 text-[11px] font-medium text-accent">
              {stageLabel(snapshot.subscribers)}
            </p>
          </div>
        ) : (
          <Link
            to="/conectar"
            onClick={() => setOpen(false)}
            className="mt-8 block rounded-xl border border-dashed border-sidebar-border bg-surface-2 p-4 transition-colors hover:border-accent"
          >
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Canal</p>
            <p className="mt-1 font-display text-sm font-semibold">Conectar YouTube</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Importe seus vídeos para recomendações reais.
            </p>
          </Link>
        )}

      </aside>

      {open && (
        <div className="fixed inset-0 z-30 bg-background/70 lg:hidden" onClick={() => setOpen(false)} />
      )}

      <div className="flex-1">
        <header className="flex items-center gap-3 border-b border-border px-4 py-3 lg:hidden">
          <button onClick={() => setOpen(true)} aria-label="Abrir menu" className="text-muted-foreground">
            <Menu className="size-5" />
          </button>
          <p className="font-display font-bold">Órbita<span className="text-accent">.</span></p>
        </header>
        <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-10">{children}</main>
      </div>
    </div>
  );
}
