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
import { StrategyBar } from "@/components/StrategyBar";
import {
  alerts as demoAlerts,
  channel,
  growth as demoGrowth,
  opportunities as demoOpportunities,
  scores as demoScores,
  todayTasks as demoTasks,
  trends as demoTrends,
} from "@/lib/channel-data";
import { useStrategy } from "@/lib/use-strategy";
import { compact, realMetrics } from "@/lib/channel-metrics";

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
  period = "28 dias",
}: {
  label: string;
  value: string;
  delta: number;
  suffix?: string;
  period?: string;
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
        {suffix} · {period}
      </p>
    </div>
  );
}

function Dashboard() {
  const { plan, loading, error, createdAt, generate, snapshot } = useStrategy();
  const m = snapshot ? realMetrics(snapshot) : null;

  const growth = m?.growth.length ? m.growth : demoGrowth;
  const scores = m?.scores ?? demoScores;
  const tasks = plan?.tasks?.length ? plan.tasks : demoTasks;
  const alerts = plan?.alerts?.length ? plan.alerts : demoAlerts;
  const opportunities = plan?.opportunities?.length ? plan.opportunities : demoOpportunities;
  const trends = plan?.trends?.length ? plan.trends : demoTrends;

  return (
    <AppShell>
      <section className="grid-noise panel p-6 sm:p-8">
        <p className="text-xs uppercase tracking-[0.2em] text-accent">Seu YouTube em 60 segundos</p>
        <h1 className="mt-3 max-w-2xl text-2xl font-bold sm:text-3xl">
          {snapshot
            ? `${snapshot.title}: ${compact(snapshot.subscribers)} inscritos e média de ${compact(
                snapshot.contentProfile.avgViews,
              )} views nos últimos vídeos.`
            : "Conecte seu canal e transforme os seus números em decisões de conteúdo."}
        </h1>
        <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
          {plan?.summary ??
            (snapshot
              ? "Gerando a leitura estratégica do seu canal com base nos vídeos importados…"
              : "O Órbita importa seus vídeos públicos, entende o tipo de conteúdo que você faz e recomenda a próxima ação — sem conselhos genéricos.")}
        </p>
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <Link
            to="/conectar"
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface-2 px-4 py-2.5 text-sm font-medium transition-colors hover:border-accent hover:text-accent"
          >
            <Youtube className="size-4" /> {snapshot ? "Gerenciar canal" : "Conectar meu canal"}
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
          {snapshot && (
            <WhyChip
              confidence="alta"
              data={snapshot.insights.slice(0, 3)}
            />
          )}
        </div>
      </section>

      <StrategyBar
        connected={Boolean(snapshot)}
        loading={loading}
        error={error}
        createdAt={plan ? createdAt : null}
        onGenerate={generate}
      />

      <section className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {snapshot && m ? (
          <>
            <Metric
              label="Inscritos"
              value={compact(snapshot.subscribers)}
              delta={0}
              suffix=""
              period="total"
            />
            <Metric
              label="Média de views"
              value={compact(snapshot.contentProfile.avgViews)}
              delta={m.viewsDelta}
              period="vídeos recentes"
            />
            <Metric
              label="Engajamento"
              value={`${m.engAvg.toFixed(2)}%`}
              delta={m.engDelta}
              suffix=" pt"
              period="vídeos recentes"
            />
            <Metric
              label="Frequência"
              value={`${snapshot.contentProfile.postsPerWeek}/sem`}
              delta={0}
              suffix=""
              period="últimos vídeos"
            />
          </>
        ) : (
          <>
            <Metric
              label="Inscritos"
              value={channel.subscribers.toLocaleString("pt-BR")}
              delta={channel.subsDelta}
            />
            <Metric
              label="Views (30d)"
              value={`${(channel.views30d / 1000).toFixed(0)}k`}
              delta={channel.viewsDelta}
            />
            <Metric label="CTR" value={`${channel.ctr}%`} delta={channel.ctrDelta} suffix=" pt" />
            <Metric
              label="Retenção"
              value={`${channel.retention}%`}
              delta={channel.retentionDelta}
              suffix=" pt"
            />
          </>
        )}
      </section>

      <section className="mt-6 grid gap-4 lg:grid-cols-3">
        <div className="panel p-5 lg:col-span-2">
          <h2 className="text-base font-semibold">
            {snapshot ? "Views por vídeo publicado" : "Crescimento das últimas 8 semanas"}
          </h2>
          <p className="text-xs text-muted-foreground">Views (mil)</p>
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
                  <div className="h-full rounded-full bg-accent" style={{ width: `${s.value}%` }} />
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
            {tasks.map((t) => (
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
            {opportunities.slice(0, 3).map((o, i) => (
              <li key={`${o.title}-${i}`} className="rounded-lg bg-surface-2 p-3">
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
            {trends.slice(0, 4).map((t, i) => (
              <li
                key={`${t.topic}-${i}`}
                className="flex items-center justify-between gap-3 rounded-lg bg-surface-2 p-3"
              >
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
        Projeções são estimativas com nível de confiança — nunca promessas de resultado.
        {snapshot ? "" : " Dados de demonstração até conectar seu canal do YouTube."}
      </p>
    </AppShell>
  );
}
