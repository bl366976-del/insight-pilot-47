import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { trends } from "@/lib/channel-data";

export const Route = createFileRoute("/tendencias")({
  head: () => ({
    meta: [
      { title: "Central de tendências | Órbita para criadores" },
      {
        name: "description",
        content:
          "Tendências do seu nicho classificadas por status e Trend Opportunity Score, cruzando busca, comunidades e desempenho de vídeos.",
      },
      { property: "og:title", content: "Central de tendências | Órbita" },
      {
        property: "og:description",
        content: "Explodindo, crescendo, saturado ou oportunidade escondida — com score de oportunidade.",
      },
    ],
  }),
  component: Page,
});

const statusColor: Record<string, string> = {
  Explodindo: "text-primary border-primary/40 bg-primary/10",
  Crescendo: "text-success border-success/40 bg-success/10",
  "Oportunidade escondida": "text-accent border-accent/40 bg-accent/10",
  Estável: "text-muted-foreground border-border bg-surface-2",
  Saturado: "text-warning border-warning/40 bg-warning/10",
  "Em queda": "text-muted-foreground border-border bg-surface-2",
};

function Bar({ label, value, tone = "accent" }: { label: string; value: number; tone?: string }) {
  return (
    <div>
      <div className="flex justify-between text-[11px] text-muted-foreground">
        <span>{label}</span>
        <span className="num">{value}</span>
      </div>
      <div className="mt-1 h-1.5 rounded-full bg-muted">
        <div
          className={`h-full rounded-full ${tone === "accent" ? "bg-accent" : "bg-primary"}`}
          style={{ width: `${Math.min(Math.abs(value), 100)}%` }}
        />
      </div>
    </div>
  );
}

function Page() {
  return (
    <AppShell>
      <header>
        <p className="text-xs uppercase tracking-[0.2em] text-accent">Monitoramento contínuo</p>
        <h1 className="mt-2 text-2xl font-bold sm:text-3xl">Central de tendências</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Temas do seu nicho cruzando busca, comunidades e desempenho de vídeos comparáveis, com um
          Trend Opportunity Score que pondera interesse, crescimento e competição.
        </p>
      </header>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {trends.map((t) => (
          <article key={t.topic} className="panel p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold">{t.topic}</h2>
                <p className="mt-1 text-[11px] text-muted-foreground">{t.source}</p>
              </div>
              <span className={`shrink-0 rounded-full border px-2.5 py-1 text-[11px] ${statusColor[t.status]}`}>
                {t.status}
              </span>
            </div>

            <div className="mt-4 space-y-2.5">
              <Bar label="Interesse" value={t.interest} />
              <Bar label="Crescimento (%)" value={t.growth} tone="primary" />
              <Bar label="Competição" value={t.competition} tone="primary" />
            </div>

            <div className="mt-4 flex items-baseline justify-between border-t border-border pt-4">
              <span className="text-xs text-muted-foreground">Trend Opportunity Score</span>
              <span className="num text-2xl font-bold text-accent">{t.score}</span>
            </div>
          </article>
        ))}
      </div>
    </AppShell>
  );
}
