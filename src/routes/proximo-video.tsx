import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { WhyChip } from "@/components/WhyChip";
import { StrategyBar } from "@/components/StrategyBar";
import { nextVideo as demoNextVideo } from "@/lib/channel-data";
import { useStrategy } from "@/lib/use-strategy";

export const Route = createFileRoute("/proximo-video")({
  head: () => ({
    meta: [
      { title: "Meu próximo vídeo | Órbita para criadores" },
      {
        name: "description",
        content:
          "Qual vídeo fazer agora: recomendação principal com título, hook, estrutura, duração, thumbnail e janela de publicação, mais 3 alternativas.",
      },
      { property: "og:title", content: "Meu próximo vídeo | Órbita" },
      {
        property: "og:description",
        content: "A próxima decisão de conteúdo do canal, explicada com dados e nível de confiança.",
      },
    ],
  }),
  component: Page,
});

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-surface-2 p-3">
      <p className="text-[11px] uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm">{value}</p>
    </div>
  );
}

function Page() {
  const { plan, loading, error, createdAt, generate, snapshot } = useStrategy();
  const nextVideo = plan?.nextVideo?.title ? plan.nextVideo : demoNextVideo;

  return (
    <AppShell>
      <header>
        <p className="text-xs uppercase tracking-[0.2em] text-accent">Decisão</p>
        <h1 className="mt-2 text-2xl font-bold sm:text-3xl">Qual vídeo eu deveria fazer agora?</h1>
      </header>

      <StrategyBar
        connected={Boolean(snapshot)}
        loading={loading}
        error={error}
        createdAt={plan ? createdAt : null}
        onGenerate={generate}
      />

      <section className="grid-noise panel mt-6 p-6">
        <div className="flex flex-wrap items-center gap-3">
          <span className="rounded-full bg-primary/15 px-2.5 py-1 text-[11px] font-medium text-primary">
            Recomendação principal
          </span>
          <span className="num text-xs text-accent">Potencial {nextVideo.potential}/100</span>
          <WhyChip data={nextVideo.reasons ?? []} confidence="alta" />
        </div>
        <h2 className="mt-4 text-xl font-bold sm:text-2xl">{nextVideo.title}</h2>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <Field label="Hook" value={nextVideo.hook} />
          <Field label="Duração recomendada" value={nextVideo.duration} />
          <Field label="Público" value={nextVideo.audience} />
          <Field label="Thumbnail sugerida" value={nextVideo.thumbnail} />
          <Field label="Tendência" value={nextVideo.trend} />
          <Field label="Concorrência" value={nextVideo.competition} />
        </div>

        <div className="mt-5">
          <p className="text-[11px] uppercase tracking-widest text-muted-foreground">Estrutura</p>
          <ol className="mt-2 space-y-2">
            {(nextVideo.structure ?? []).map((s) => (
              <li key={s} className="flex gap-3 text-sm text-foreground/90">
                <span className="mt-2 size-1 shrink-0 rounded-full bg-accent" />
                {s}
              </li>
            ))}
          </ol>
        </div>

        <p className="mt-5 rounded-lg border border-border p-3 text-sm">
          <span className="text-muted-foreground">Melhor estratégia de publicação: </span>
          {nextVideo.publish}
        </p>
      </section>

      <section className="mt-6">
        <h2 className="text-base font-semibold">Alternativas</h2>
        <div className="mt-3 grid gap-3 md:grid-cols-3">
          {(nextVideo.alternatives ?? []).map((a) => (
            <article key={a.title} className="panel p-4">
              <p className="text-sm font-medium">{a.title}</p>
              <p className="mt-1 text-xs text-muted-foreground">{a.note}</p>
              <p className="num mt-3 text-sm text-accent">Potencial {a.potential}/100</p>
            </article>
          ))}
        </div>
      </section>

      <p className="mt-8 text-center text-[11px] text-muted-foreground">
        Recomendações aumentam racionalmente as chances de crescimento — não garantem viralização nem
        número de inscritos.
      </p>
    </AppShell>
  );
}
