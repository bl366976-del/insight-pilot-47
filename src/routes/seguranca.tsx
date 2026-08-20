import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { Loader2, ShieldCheck, ShieldAlert } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { reviewPolicy } from "@/lib/policy.functions";
import { buildChannelContext, useChannel } from "@/lib/use-channel";
import { buildDnaContext, useCreatorDna } from "@/lib/creator-dna";

export const Route = createFileRoute("/seguranca")({
  head: () => ({
    meta: [
      { title: "Segurança e políticas do YouTube | Órbita" },
      {
        name: "description",
        content:
          "Safe Publish: analise título, thumbnail, descrição e conteúdo antes de publicar e entenda o risco de política com explicação clara.",
      },
      { property: "og:title", content: "Safe Publish e Policy Intelligence | Órbita" },
      {
        property: "og:description",
        content: "Máxima liberdade criativa dentro das regras atuais do YouTube.",
      },
    ],
  }),
  component: Page,
});

const quick = [
  "Posso falar palavrão no meio do vídeo sem perder monetização?",
  "Posso usar 15 segundos de uma música famosa na abertura?",
  "Essa thumbnail com expressão de choque é arriscada?",
  "Meu vídeo sobre um crime real pode ser desmonetizado?",
];

const policySources = [
  { name: "Diretrizes da Comunidade", checked: "Base pública · verificada pela IA na consulta" },
  { name: "Conteúdo adequado a anunciantes", checked: "Base pública · verificada pela IA na consulta" },
  { name: "Direitos autorais e Content ID", checked: "Base pública · verificada pela IA na consulta" },
  { name: "Spam, práticas enganosas e miniaturas", checked: "Base pública · verificada pela IA na consulta" },
];

const levelStyle: Record<string, string> = {
  VERDE: "bg-success/15 text-success border-success/40",
  AMARELO: "bg-warning/15 text-warning border-warning/40",
  LARANJA: "bg-accent/15 text-accent border-accent/40",
  VERMELHO: "bg-danger/15 text-danger border-danger/40",
};

function Page() {
  const { snapshot } = useChannel();
  const { dna } = useCreatorDna();
  const run = useServerFn(reviewPolicy);
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ level: string; text: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function ask(q: string) {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const context = [buildChannelContext(snapshot), buildDnaContext(dna)]
        .filter(Boolean)
        .join("\n\n");
      const res = await run({ data: { question: q, context } });
      setResult(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível analisar agora.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppShell>
      <header className="grid-noise panel p-6 sm:p-8">
        <p className="text-xs uppercase tracking-[0.2em] text-info">Policy Intelligence</p>
        <h1 className="mt-2 flex items-center gap-2 text-2xl font-bold sm:text-3xl">
          <ShieldCheck className="size-6 text-info" /> Safe Publish
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Descreva o vídeo, o título, a thumbnail ou a dúvida. Classificamos o risco em verde,
          amarelo, laranja ou vermelho e explicamos como manter sua ideia dentro das regras.
        </p>
      </header>

      <section className="panel mt-6 p-5">
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          rows={5}
          placeholder="Ex.: Título “ELE PERDEU TUDO” + thumbnail com expressão de choque, vídeo sobre um caso real com áudio de reportagem."
          className="w-full resize-none rounded-xl border border-border bg-surface-2 p-4 text-sm outline-none placeholder:text-muted-foreground focus:border-primary"
        />
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Button disabled={loading || !question.trim()} onClick={() => ask(question.trim())} className="gap-2">
            {loading ? <Loader2 className="size-4 animate-spin" /> : <ShieldCheck className="size-4" />}
            {loading ? "Analisando..." : "Analisar antes de publicar"}
          </Button>
          <span className="text-[11px] text-muted-foreground">
            Não substitui a decisão oficial do YouTube.
          </span>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {quick.map((q) => (
            <button
              key={q}
              onClick={() => {
                setQuestion(q);
                void ask(q);
              }}
              className="rounded-full border border-border bg-surface-2 px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary hover:text-foreground"
            >
              {q}
            </button>
          ))}
        </div>
      </section>

      {error && (
        <div className="panel mt-4 border-danger/40 p-4 text-sm text-muted-foreground">
          {error.includes("MISSING_KEY")
            ? "A IA não está configurada neste ambiente."
            : error}
        </div>
      )}

      {result && (
        <section className="panel mt-4 p-5">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${
              levelStyle[result.level] ?? levelStyle["AMARELO"]
            }`}
          >
            <ShieldAlert className="size-3.5" /> Risco {result.level.toLowerCase()}
          </span>
          <div className="prose-invert mt-4 space-y-3 text-sm leading-relaxed text-foreground/90 [&_li]:ml-4 [&_li]:list-disc [&_strong]:text-foreground">
            <ReactMarkdown>{result.text}</ReactMarkdown>
          </div>
        </section>
      )}

      <section className="panel mt-4 p-5">
        <h2 className="text-base font-semibold">Base de políticas monitorada</h2>
        <p className="text-xs text-muted-foreground">
          Cada resposta cita a fonte e a data da verificação feita na consulta.
        </p>
        <ul className="mt-4 divide-y divide-border">
          {policySources.map((p) => (
            <li key={p.name} className="flex flex-wrap items-center justify-between gap-2 py-3">
              <span className="text-sm">{p.name}</span>
              <span className="text-[11px] text-muted-foreground">{p.checked}</span>
            </li>
          ))}
        </ul>
      </section>
    </AppShell>
  );
}
