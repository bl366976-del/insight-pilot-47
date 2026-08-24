import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { WhyChip } from "@/components/WhyChip";
import { StrategyBar } from "@/components/StrategyBar";
import { catalog as demoCatalog, opportunities as demoOpportunities } from "@/lib/channel-data";
import { useStrategy } from "@/lib/use-strategy";

export const Route = createFileRoute("/oportunidades")({
  head: () => ({
    meta: [
      { title: "Radar de oportunidades | Órbita para criadores" },
      {
        name: "description",
        content:
          "Oportunidades específicas do seu canal: formato, retenção, lacunas de conteúdo e demanda da audiência, com dados e nível de confiança.",
      },
      { property: "og:title", content: "Radar de oportunidades | Órbita" },
      {
        property: "og:description",
        content: "Oportunidades priorizadas por impacto, esforço e confiança para o seu canal.",
      },
    ],
  }),
  component: Page,
});

function Page() {
  const { plan, loading, error, createdAt, generate, snapshot } = useStrategy();
  const opportunities = plan?.opportunities?.length ? plan.opportunities : demoOpportunities;
  const catalog = plan?.catalog?.length ? plan.catalog : demoCatalog;

  return (
    <AppShell>
      <header>
        <p className="text-xs uppercase tracking-[0.2em] text-accent">Radar</p>
        <h1 className="mt-2 text-2xl font-bold sm:text-3xl">Oportunidades para você</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Cada oportunidade é encontrada cruzando o histórico do canal, comportamento da audiência,
          concorrentes e tendências — nunca recomendações genéricas.
        </p>
      </header>

      <StrategyBar
        connected={Boolean(snapshot)}
        loading={loading}
        error={error}
        createdAt={plan ? createdAt : null}
        onGenerate={generate}
      />

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        {opportunities.map((o, i) => (
          <article key={`${o.title}-${i}`} className="panel flex flex-col p-5">
            <div className="flex items-center justify-between">
              <span className="rounded-full bg-accent/15 px-2.5 py-1 text-[11px] font-medium text-accent">
                {o.tag}
              </span>
              <span className="num text-sm text-muted-foreground">Impacto {o.impact}/100</span>
            </div>
            <h2 className="mt-3 text-base font-semibold">{o.title}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{o.why}</p>
            <ul className="mt-3 space-y-1.5 text-xs text-foreground/85">
              {(o.data ?? []).map((d) => (
                <li key={d} className="flex gap-2">
                  <span className="mt-1.5 size-1 shrink-0 rounded-full bg-primary" />
                  {d}
                </li>
              ))}
            </ul>
            <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border pt-4 text-[11px] text-muted-foreground">
              <span>
                Confiança: <span className="text-accent">{o.confidence}</span>
              </span>
              <span>· Esforço: {o.effort}</span>
              <span className="ml-auto">
                <WhyChip data={o.data ?? []} confidence={o.confidence} />
              </span>
            </div>
          </article>
        ))}
      </div>

      <section className="panel mt-6 p-5">
        <h2 className="text-base font-semibold">Inteligência de catálogo</h2>
        <p className="text-xs text-muted-foreground">
          Explorar · Repetir · Atualizar · Abandonar · Transformar
        </p>
        <div className="mt-4 divide-y divide-border">
          {catalog.map((c, i) => (
            <div key={`${c.title}-${i}`} className="flex flex-wrap items-center gap-3 py-3">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{c.title}</p>
                <p className="text-xs text-muted-foreground">{c.note}</p>
              </div>
              <span className="num text-xs text-muted-foreground">{c.views}</span>
              <span className="rounded-full border border-border px-2.5 py-1 text-[11px] text-accent">
                {c.verdict}
              </span>
            </div>
          ))}
        </div>
      </section>
    </AppShell>
  );
}
