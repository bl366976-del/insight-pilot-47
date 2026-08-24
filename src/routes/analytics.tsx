import { createFileRoute, Link } from "@tanstack/react-router";
import { BarChart3, ArrowUpRight, ArrowDownRight } from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from "recharts";
import { AppShell } from "@/components/AppShell";
import { channel, growth as demoGrowth, scores as demoScores, catalog as demoCatalog } from "@/lib/channel-data";
import { compact, realMetrics } from "@/lib/channel-metrics";
import { StrategyBar } from "@/components/StrategyBar";
import { useStrategy } from "@/lib/use-strategy";

export const Route = createFileRoute("/analytics")({
  head: () => ({
    meta: [
      { title: "Analytics do canal | Órbita" },
      {
        name: "description",
        content:
          "Desempenho do canal em uma leitura simples: crescimento, CTR, retenção, catálogo e o que cada número pede como decisão.",
      },
      { property: "og:title", content: "Analytics do canal | Órbita" },
      {
        property: "og:description",
        content: "Números com interpretação: o que aconteceu, por que importa e o que fazer.",
      },
    ],
  }),
  component: Page,
});

const verdictColor: Record<string, string> = {
  Repetir: "text-success",
  Atualizar: "text-warning",
  Transformar: "text-info",
  Abandonar: "text-danger",
  Explorar: "text-opportunity",
};

function Metric({ label, value, delta, suffix = "%", period = "28 dias" }: { label: string; value: string; delta: number; suffix?: string; period?: string }) {
  const up = delta >= 0;
  return (
    <div className="panel panel-hover p-4">
      <p className="text-[11px] uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className="num mt-2 text-2xl font-bold">{value}</p>
      <p className={`mt-1 inline-flex items-center gap-1 text-xs ${up ? "text-success" : "text-danger"}`}>
        {up ? <ArrowUpRight className="size-3" /> : <ArrowDownRight className="size-3" />}
        {up ? "+" : ""}
        {delta}
        {suffix} · {period}
      </p>
    </div>
  );
}

function Page() {
  const { plan, loading, error, createdAt, generate, snapshot } = useStrategy();
  const m = snapshot ? realMetrics(snapshot) : null;
  const growth = m?.growth.length ? m.growth : demoGrowth;
  const scores = m?.scores ?? demoScores;
  const catalog = plan?.catalog?.length ? plan.catalog : (m?.catalog ?? demoCatalog);

  return (
    <AppShell>
      <header className="grid-noise panel p-6 sm:p-8">
        <p className="text-xs uppercase tracking-[0.2em] text-info">Desempenho</p>
        <h1 className="mt-2 flex items-center gap-2 text-2xl font-bold sm:text-3xl">
          <BarChart3 className="size-6 text-info" /> Analytics
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          {snapshot
            ? `Dados públicos importados de ${snapshot.title}, combinados com leituras estratégicas do Órbita.`
            : "Dados de demonstração. Conecte seu canal para ver os seus números reais."}
        </p>
        {!snapshot && (
          <Link to="/conectar" className="mt-4 inline-flex text-sm text-primary hover:underline">
            Conectar meu canal →
          </Link>
        )}
      </header>

      <StrategyBar
        connected={Boolean(snapshot)}
        loading={loading}
        error={error}
        createdAt={plan ? createdAt : null}
        onGenerate={generate}
      />

      <section className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {snapshot && m ? (
          <>
            <Metric label="Inscritos" value={compact(snapshot.subscribers)} delta={0} suffix="" period="total" />
            <Metric label="Views totais" value={compact(snapshot.views)} delta={0} suffix="" period="histórico" />
            <Metric label="Média de views" value={compact(snapshot.contentProfile.avgViews)} delta={m.viewsDelta} period="vídeos recentes" />
            <Metric label="Engajamento" value={`${m.engAvg.toFixed(2)}%`} delta={m.engDelta} suffix=" pt" period="vídeos recentes" />
          </>
        ) : (
          <>
            <Metric label="Inscritos" value={channel.subscribers.toLocaleString("pt-BR")} delta={channel.subsDelta} />
            <Metric label="Views (30d)" value={`${(channel.views30d / 1000).toFixed(0)}k`} delta={channel.viewsDelta} />
            <Metric label="CTR" value={`${channel.ctr}%`} delta={channel.ctrDelta} suffix=" pt" />
            <Metric label="Retenção" value={`${channel.retention}%`} delta={channel.retentionDelta} suffix=" pt" />
          </>
        )}
      </section>

      <section className="mt-4 grid gap-4 lg:grid-cols-3">
        <div className="panel p-5 lg:col-span-2">
          <h2 className="text-base font-semibold">{snapshot ? "Views por vídeo publicado" : "Views por semana"}</h2>
          <p className="text-xs text-muted-foreground">mil views</p>
          <div className="mt-4 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={growth} margin={{ left: 0, right: 8, top: 8 }}>
                <defs>
                  <linearGradient id="an" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.55} />
                    <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: "var(--color-muted-foreground)", fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    background: "var(--color-popover)",
                    border: "1px solid var(--color-border)",
                    borderRadius: 12,
                    fontSize: 12,
                  }}
                />
                <Area type="monotone" dataKey="views" stroke="var(--color-primary)" strokeWidth={2} fill="url(#an)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="panel p-5">
          <h2 className="text-base font-semibold">Diagnóstico por área</h2>
          <div className="mt-4 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={scores} layout="vertical" margin={{ left: 8, right: 8 }}>
                <Tooltip
                  cursor={{ fill: "var(--color-muted)" }}
                  contentStyle={{
                    background: "var(--color-popover)",
                    border: "1px solid var(--color-border)",
                    borderRadius: 12,
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="value" fill="var(--color-trend)" radius={6} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <ul className="mt-2 grid grid-cols-2 gap-1 text-[11px] text-muted-foreground">
            {scores.map((s) => (
              <li key={s.label} className="flex justify-between gap-2">
                <span className="truncate">{s.label}</span>
                <span className="num text-foreground">{s.value}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="panel mt-4 p-5">
        <h2 className="text-base font-semibold">Inteligência de catálogo</h2>
        <p className="text-xs text-muted-foreground">
          O que fazer com cada vídeo antigo — repetir, atualizar, transformar, explorar ou abandonar.
        </p>
        <div className="mt-3 divide-y divide-border">
          {catalog.map((c, i) => (
            <div key={`${c.title}-${i}`} className="flex flex-wrap items-center gap-3 py-3">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm">{c.title}</p>
                <p className="text-xs text-muted-foreground">{c.note}</p>
              </div>
              <span className="num text-xs text-muted-foreground">{c.views}</span>
              <span className={`text-xs font-medium ${verdictColor[c.verdict] ?? "text-foreground"}`}>
                {c.verdict}
              </span>
            </div>
          ))}
        </div>
      </section>
    </AppShell>
  );
}
