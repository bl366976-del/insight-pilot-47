import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowUpRight,
  ArrowDownRight,
  Bell,
  CheckCircle2,
  Clapperboard,
  MessageSquareText,
  Youtube,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from "recharts";
import { AppShell } from "@/components/AppShell";
import { WhyChip } from "@/components/WhyChip";
import {
  alerts,
  channel,
  growth,
  opportunities,
  scores,
  todayTasks,
  trends,
} from "@/lib/channel-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Painel do canal | Órbita — copiloto estratégico de YouTube" },
      {
        name: "description",
        content:
          "Saúde do canal, oportunidades priorizadas, alertas e tarefas do dia em um só painel data-driven para criadores do YouTube.",
      },
      { property: "og:title", content: "Painel do canal | Órbita" },
      {
        property: "og:description",
        content:
          "Transforme métricas do YouTube em decisões: oportunidades, tendências e a próxima ação recomendada.",
      },
    ],
  }),
  component: Dashboard,
});

function Metric({
  label,
  value,
  delta,
  suffix = "%",
}: {
  label: string;
  value: string;
  delta: number;
  suffix?: string;
}) {
  const up = delta >= 0;
  return (
    <div className="panel p-4">
      <p className="text-xs uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className="num mt-2 text-2xl font-bold">{value}</p>
      <p
        className={`mt-1 inline-flex items-center gap-1 text-xs ${up ? "text-success" : "text-primary"}`}
      >
        {up ? <ArrowUpRight className="size-3" /> : <ArrowDownRight className="size-3" />}
        {up ? "+" : ""}
        {delta}
        {suffix} · 28 dias
      </p>
    </div>
  );
}

function Dashboard() {
  return (
    <AppShell>
      <section className="grid-noise panel p-6 sm:p-8">
        <p className="text-xs uppercase tracking-[0.2em] text-accent">Seu YouTube em 60 segundos</p>
        <h1 className="mt-3 max-w-2xl text-2xl font-bold sm:text-3xl">
          O canal cresceu {channel.subsDelta}% esta semana e dois vídeos estão acima da média — mas o
          CTR caiu 0,7 ponto.
        </h1>
        <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
          A audiência respondeu melhor a vídeos de comparação e uma tendência do seu nicho entrou em
          estado <span className="text-accent">Explodindo</span>. Recomendação principal: produzir um
          vídeo de 9–11 minutos comparando agentes de IA locais.
        </p>
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <Link
            to="/conectar"
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface-2 px-4 py-2.5 text-sm font-medium transition-colors hover:border-accent hover:text-accent"
          >
            <Youtube className="size-4" /> Conectar meu canal
          </Link>
          <Link
            to="/assistente"
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface-2 px-4 py-2.5 text-sm font-medium transition-colors hover:border-accent hover:text-accent"
          >
            <MessageSquareText className="size-4" /> Falar com a IA
          </Link>
          <Link
            to="/proximo-video"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            <Clapperboard className="size-4" /> Ver meu próximo vídeo
          </Link>
          <WhyChip
            confidence="alta"
            data={[
              "Comparações: 9,4 inscritos/1k views vs 4,1 da média do canal",
              "Tendência “agentes de IA locais”: +42% em 60 dias",
              "Melhor faixa de retenção do canal: 8–12 minutos",
            ]}
          />
        </div>
      </section>

      <section className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Metric label="Inscritos" value={channel.subscribers.toLocaleString("pt-BR")} delta={channel.subsDelta} />
        <Metric label="Views (30d)" value={`${(channel.views30d / 1000).toFixed(0)}k`} delta={channel.viewsDelta} />
        <Metric label="CTR" value={`${channel.ctr}%`} delta={channel.ctrDelta} suffix=" pt" />
        <Metric label="Retenção" value={`${channel.retention}%`} delta={channel.retentionDelta} suffix=" pt" />
      </section>

      <section className="mt-6 grid gap-4 lg:grid-cols-3">
        <div className="panel p-5 lg:col-span-2">
          <h2 className="text-base font-semibold">Crescimento das últimas 8 semanas</h2>
          <p className="text-xs text-muted-foreground">Views (mil) por semana</p>
          <div className="mt-4 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={growth} margin={{ left: 0, right: 8, top: 8 }}>
                <defs>
                  <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-accent)" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="var(--color-accent)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="var(--color-border)" vertical={false} />
                <XAxis
                  dataKey="label"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "var(--color-muted-foreground)", fontSize: 11 }}
                />
                <Tooltip
                  contentStyle={{
                    background: "var(--color-popover)",
                    border: "1px solid var(--color-border)",
                    borderRadius: 12,
                    fontSize: 12,
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="views"
                  stroke="var(--color-accent)"
                  strokeWidth={2}
                  fill="url(#g)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="panel p-5">
          <h2 className="text-base font-semibold">Score do canal</h2>
          <p className="text-xs text-muted-foreground">Indicadores independentes, sem nota única</p>
          <ul className="mt-4 space-y-3">
            {scores.map((s) => (
              <li key={s.label}>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">{s.label}</span>
                  <span className="num">{s.value}</span>
                </div>
                <div className="mt-1 h-1.5 rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-accent"
                    style={{ width: `${s.value}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mt-6 grid gap-4 lg:grid-cols-3">
        <div className="panel p-5 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold">O que eu deveria fazer hoje?</h2>
            <span className="text-[11px] text-muted-foreground">Impacto × Urgência × Esforço</span>
          </div>
          <ul className="mt-4 space-y-3">
            {todayTasks.map((t) => (
              <li key={t.task} className="flex gap-3 rounded-lg bg-surface-2 p-3">
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-accent" />
                <div>
                  <p className="text-sm font-medium">{t.task}</p>
                  <p className="text-xs text-muted-foreground">
                    {t.why} · Impacto {t.impact} · Esforço {t.effort}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="panel p-5">
          <h2 className="flex items-center gap-2 text-base font-semibold">
            <Bell className="size-4 text-primary" /> Alertas
          </h2>
          <ul className="mt-4 space-y-3">
            {alerts.map((a) => (
              <li key={a.text} className="text-sm text-foreground/90">
                <span
                  className={`mr-2 inline-block size-1.5 rounded-full align-middle ${
                    a.level === "positivo"
                      ? "bg-success"
                      : a.level === "atencao"
                        ? "bg-primary"
                        : "bg-warning"
                  }`}
                />
                {a.text}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="panel p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold">Principais oportunidades</h2>
            <Link to="/oportunidades" className="text-xs text-accent hover:underline">
              Ver todas
            </Link>
          </div>
          <ul className="mt-4 space-y-3">
            {opportunities.slice(0, 3).map((o) => (
              <li key={o.id} className="rounded-lg bg-surface-2 p-3">
                <p className="text-sm font-medium">{o.title}</p>
                <p className="mt-1 text-xs text-muted-foreground">{o.why}</p>
                <p className="num mt-2 text-xs text-accent">Impacto {o.impact}/100</p>
              </li>
            ))}
          </ul>
        </div>

        <div className="panel p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold">Tendências do nicho</h2>
            <Link to="/tendencias" className="text-xs text-accent hover:underline">
              Central de tendências
            </Link>
          </div>
          <ul className="mt-4 space-y-3">
            {trends.slice(0, 4).map((t) => (
              <li key={t.topic} className="flex items-center justify-between gap-3 rounded-lg bg-surface-2 p-3">
                <div>
                  <p className="text-sm font-medium">{t.topic}</p>
                  <p className="text-xs text-muted-foreground">{t.status}</p>
                </div>
                <span className="num text-sm text-accent">{t.score}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <p className="mt-8 text-center text-[11px] text-muted-foreground">
        Projeções são estimativas com nível de confiança — nunca promessas de resultado. Dados de
        demonstração até conectar seu canal do YouTube.
      </p>
    </AppShell>
  );
}
