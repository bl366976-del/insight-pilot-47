import { Link } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Radar,
  TrendingUp,
  Clapperboard,
  MessageSquareText,
  Youtube,
  Dna,
  ShieldCheck,
  FlaskConical,
  BarChart3,
  Menu,
  X,
  Play,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { useChannel } from "@/lib/use-channel";
import { useCreatorDna, dnaCompleteness } from "@/lib/creator-dna";
import { cn } from "@/lib/utils";

const groups = [
  {
    label: "Estratégia",
    items: [
      { to: "/", label: "Início", icon: LayoutDashboard },
      { to: "/oportunidades", label: "Oportunidades", icon: Radar },
      { to: "/tendencias", label: "Tendências", icon: TrendingUp },
    ],
  },
  {
    label: "Produção",
    items: [
      { to: "/proximo-video", label: "Conteúdo", icon: Clapperboard },
      { to: "/laboratorio", label: "Laboratório", icon: FlaskConical },
      { to: "/analytics", label: "Analytics", icon: BarChart3 },
    ],
  },
  {
    label: "Inteligência",
    items: [
      { to: "/creator-dna", label: "Creator DNA", icon: Dna },
      { to: "/seguranca", label: "Segurança", icon: ShieldCheck },
      { to: "/assistente", label: "IA Assistente", icon: MessageSquareText },
    ],
  },
  {
    label: "Conta",
    items: [{ to: "/conectar", label: "Configurações", icon: Youtube }],
  },
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
  const { dna } = useCreatorDna();
  const dnaPct = dnaCompleteness(dna);

  return (
    <div className="min-h-screen bg-background lg:flex">
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-[15.5rem] flex-col overflow-y-auto border-r border-sidebar-border bg-sidebar p-4 transition-transform lg:static lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center justify-between px-1">
          <Link to="/" className="flex items-center gap-2.5" onClick={() => setOpen(false)}>
            <span className="brand-gradient grid size-9 place-items-center rounded-xl shadow-glow">
              <Play className="size-4 fill-white text-white" />
            </span>
            <span>
              <span className="brand-text block font-display text-base font-bold tracking-tight">
                ÓRBITA
              </span>
              <span className="block text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
                Studio
              </span>
            </span>
          </Link>
          <button
            className="text-muted-foreground lg:hidden"
            onClick={() => setOpen(false)}
            aria-label="Fechar menu"
          >
            <X className="size-5" />
          </button>
        </div>

        <nav className="mt-7 flex-1 space-y-6">
          {groups.map((group) => (
            <div key={group.label}>
              <p className="px-3 text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground/70">
                {group.label}
              </p>
              <div className="mt-2 space-y-0.5">
                {group.items.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setOpen(false)}
                    activeOptions={{ exact: item.to === "/" }}
                    activeProps={{
                      className:
                        "bg-sidebar-accent text-sidebar-accent-foreground [&_svg]:text-primary",
                    }}
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  >
                    <item.icon className="size-4" />
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </nav>

        <div className="mt-6 space-y-3">
          {snapshot ? (
            <div className="rounded-2xl border border-sidebar-border bg-surface-2 p-4">
              <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                Canal conectado
              </p>
              <p className="mt-1 truncate font-display text-sm font-semibold">{snapshot.title}</p>
              <p className="text-xs text-muted-foreground">
                {snapshot.subscribers.toLocaleString("pt-BR")} inscritos
              </p>
              <p className="mt-3 inline-flex rounded-full bg-primary/20 px-2.5 py-1 text-[11px] font-medium text-primary-foreground/90">
                {stageLabel(snapshot.subscribers)}
              </p>
            </div>
          ) : (
            <Link
              to="/conectar"
              onClick={() => setOpen(false)}
              className="block rounded-2xl border border-dashed border-sidebar-border bg-surface-2 p-4 transition-colors hover:border-primary"
            >
              <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Canal</p>
              <p className="mt-1 font-display text-sm font-semibold">Conectar YouTube</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Importe seus vídeos para recomendações reais.
              </p>
            </Link>
          )}

          <Link
            to="/creator-dna"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 rounded-2xl border border-sidebar-border bg-surface-2 p-3 transition-colors hover:border-primary"
          >
            <span className="relative grid size-10 shrink-0 place-items-center rounded-full bg-muted">
              <span
                className="absolute inset-0 rounded-full"
                style={{
                  background: `conic-gradient(var(--color-primary) ${dnaPct * 3.6}deg, transparent 0)`,
                }}
              />
              <span className="num relative grid size-8 place-items-center rounded-full bg-surface-2 text-[11px]">
                {dnaPct}
              </span>
            </span>
            <span className="min-w-0">
              <span className="block text-xs font-medium">Creator DNA</span>
              <span className="block truncate text-[11px] text-muted-foreground">
                Seu perfil criativo
              </span>
            </span>
          </Link>
        </div>
      </aside>

      {open && (
        <div className="fixed inset-0 z-30 bg-background/70 lg:hidden" onClick={() => setOpen(false)} />
      )}

      <div className="min-w-0 flex-1">
        <header className="flex items-center gap-3 border-b border-border px-4 py-3 lg:hidden">
          <button onClick={() => setOpen(true)} aria-label="Abrir menu" className="text-muted-foreground">
            <Menu className="size-5" />
          </button>
          <span className="brand-gradient grid size-7 place-items-center rounded-lg">
            <Play className="size-3.5 fill-white text-white" />
          </span>
          <p className="brand-text font-display font-bold">ÓRBITA</p>
        </header>
        <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-10">{children}</main>
      </div>
    </div>
  );
}
