import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { Loader2, Youtube, Unplug, ArrowUpRight } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { connectChannel } from "@/lib/youtube.functions";
import { useChannel } from "@/lib/use-channel";

export const Route = createFileRoute("/conectar")({
  head: () => ({
    meta: [
      { title: "Conectar canal do YouTube | Órbita" },
      {
        name: "description",
        content:
          "Conecte seu canal do YouTube e receba um perfil estratégico automático: temas, duração ideal, Shorts, frequência e vídeos vencedores.",
      },
      { property: "og:title", content: "Conectar canal do YouTube | Órbita" },
      {
        property: "og:description",
        content: "Importe seus vídeos e deixe a IA entender que tipo de conteúdo você faz.",
      },
    ],
  }),
  component: Page,
});

function Page() {
  const { snapshot, save, clear } = useChannel();
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const run = useServerFn(connectChannel);

  async function handleConnect(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const data = await run({ data: { query: query.trim() } });
      save(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível conectar o canal.");
    } finally {
      setLoading(false);
    }
  }

  const missingKey = error?.includes("MISSING_KEY");

  return (
    <AppShell>
      <header>
        <p className="text-xs uppercase tracking-[0.2em] text-accent">Integração</p>
        <h1 className="mt-2 text-2xl font-bold sm:text-3xl">Conectar canal do YouTube</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Informe seu @handle ou a URL do canal. Importamos os vídeos públicos, calculamos seu perfil
          de conteúdo e alimentamos o assistente com esses dados reais.
        </p>
      </header>

      <form onSubmit={handleConnect} className="panel mt-6 flex flex-col gap-3 p-5 sm:flex-row">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="@seucanal ou https://youtube.com/@seucanal"
          className="h-11 bg-surface-2"
          aria-label="Canal do YouTube"
        />
        <Button type="submit" size="lg" disabled={loading} className="h-11 gap-2">
          {loading ? <Loader2 className="size-4 animate-spin" /> : <Youtube className="size-4" />}
          {loading ? "Analisando vídeos..." : "Conectar e analisar"}
        </Button>
      </form>

      {error && (
        <div className="panel mt-4 border-primary/40 p-4 text-sm">
          {missingKey ? (
            <>
              <p className="font-medium">Falta a chave da API do YouTube</p>
              <p className="mt-1 text-muted-foreground">
                Crie uma chave gratuita no Google Cloud (ative a “YouTube Data API v3” e gere uma API
                key) e me avise aqui no chat — eu abro o formulário seguro para você salvá-la. Nada
                da chave passa pelo código do app.
              </p>
            </>
          ) : (
            <p className="text-muted-foreground">{error}</p>
          )}
        </div>
      )}

      {snapshot && (
        <section className="mt-6 space-y-4">
          <div className="panel flex flex-wrap items-center gap-4 p-5">
            {snapshot.thumbnail && (
              <img
                src={snapshot.thumbnail}
                alt={`Avatar do canal ${snapshot.title}`}
                className="size-16 rounded-full"
              />
            )}
            <div className="min-w-0 flex-1">
              <h2 className="text-lg font-semibold">{snapshot.title}</h2>
              <p className="text-xs text-muted-foreground">
                {snapshot.subscribers.toLocaleString("pt-BR")} inscritos ·{" "}
                {snapshot.views.toLocaleString("pt-BR")} views · {snapshot.videoCount} vídeos
              </p>
            </div>
            <div className="flex gap-2">
              <Button asChild variant="secondary" size="sm">
                <Link to="/assistente">
                  Falar com a IA <ArrowUpRight className="size-3.5" />
                </Link>
              </Button>
              <Button variant="ghost" size="sm" onClick={clear} className="gap-1.5">
                <Unplug className="size-3.5" /> Desconectar
              </Button>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <div className="panel p-5 lg:col-span-2">
              <h3 className="text-base font-semibold">O que entendemos do seu conteúdo</h3>
              <ul className="mt-3 space-y-2 text-sm text-foreground/90">
                {snapshot.insights.map((i) => (
                  <li key={i} className="flex gap-2">
                    <span className="mt-2 size-1 shrink-0 rounded-full bg-accent" />
                    {i}
                  </li>
                ))}
              </ul>
              <div className="mt-4 flex flex-wrap gap-2">
                {snapshot.contentProfile.topTopics.map((t) => (
                  <span
                    key={t}
                    className="rounded-full border border-border px-2.5 py-1 text-[11px] text-muted-foreground"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>

            <div className="panel space-y-3 p-5 text-sm">
              <h3 className="text-base font-semibold">Perfil do canal</h3>
              <Row label="Média de views" value={snapshot.contentProfile.avgViews.toLocaleString("pt-BR")} />
              <Row label="Duração mediana" value={`${snapshot.contentProfile.medianDurationMin} min`} />
              <Row label="Shorts" value={`${snapshot.contentProfile.shortsShare}%`} />
              <Row label="Frequência" value={`${snapshot.contentProfile.postsPerWeek}/semana`} />
            </div>
          </div>

          <div className="panel p-5">
            <h3 className="text-base font-semibold">Últimos vídeos analisados</h3>
            <div className="mt-3 divide-y divide-border">
              {snapshot.videos.map((v) => (
                <div key={v.id} className="flex items-center gap-3 py-3">
                  {v.thumbnail && (
                    <img src={v.thumbnail} alt="" className="h-10 w-16 rounded object-cover" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm">{v.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {v.views.toLocaleString("pt-BR")} views · {v.engagementRate.toFixed(2)}% eng. ·{" "}
                      {v.isShort ? "Short" : `${v.durationMin.toFixed(0)} min`}
                    </p>
                  </div>
                  <span
                    className={`num text-xs ${v.vsAverage >= 0 ? "text-success" : "text-primary"}`}
                  >
                    {v.vsAverage > 0 ? "+" : ""}
                    {v.vsAverage}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </AppShell>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-t border-border pt-3 first:border-0 first:pt-0">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="num text-sm">{value}</span>
    </div>
  );
}
