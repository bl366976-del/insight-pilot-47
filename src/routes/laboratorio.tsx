import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { FlaskConical, Plus, Trophy, Trash2 } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/laboratorio")({
  head: () => ({
    meta: [
      { title: "Laboratório de experimentos | Órbita" },
      {
        name: "description",
        content:
          "Teste títulos, thumbnails, hooks e formatos, registre o resultado e transforme cada experimento em aprendizado do canal.",
      },
      { property: "og:title", content: "YouTube Lab | Órbita" },
      {
        property: "og:description",
        content: "Win Library e Failure Library: o que funciona e o que evitar no seu canal.",
      },
    ],
  }),
  component: Page,
});

type Kind = "Título" | "Thumbnail" | "Hook" | "Formato" | "Duração";
type Experiment = {
  id: string;
  kind: Kind;
  a: string;
  b: string;
  metric: string;
  winner: "a" | "b" | null;
  createdAt: number;
};

const KEY = "orbita.lab";
const kinds: Kind[] = ["Título", "Thumbnail", "Hook", "Formato", "Duração"];

const seed: Experiment[] = [
  {
    id: "seed-1",
    kind: "Thumbnail",
    a: "Rosto em close com 4 palavras",
    b: "Objeto em destaque com 2 palavras",
    metric: "CTR 8,7% vs 12,4%",
    winner: "b",
    createdAt: Date.now() - 86400000 * 6,
  },
  {
    id: "seed-2",
    kind: "Hook",
    a: "Introdução com contexto de 40s",
    b: "Resultado surpreendente nos primeiros 8s",
    metric: "Retenção 30s: 61% vs 79%",
    winner: "b",
    createdAt: Date.now() - 86400000 * 12,
  },
];

function Page() {
  const [items, setItems] = useState<Experiment[]>(seed);
  const [kind, setKind] = useState<Kind>("Título");
  const [a, setA] = useState("");
  const [b, setB] = useState("");

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(KEY);
      if (raw) setItems(JSON.parse(raw) as Experiment[]);
    } catch {
      /* ignora storage inválido */
    }
  }, []);

  function persist(next: Experiment[]) {
    setItems(next);
    window.localStorage.setItem(KEY, JSON.stringify(next));
  }

  const wins = items.filter((i) => i.winner);
  const open = items.filter((i) => !i.winner);

  return (
    <AppShell>
      <header className="grid-noise panel p-6 sm:p-8">
        <p className="text-xs uppercase tracking-[0.2em] text-opportunity">YouTube Lab</p>
        <h1 className="mt-2 flex items-center gap-2 text-2xl font-bold sm:text-3xl">
          <FlaskConical className="size-6 text-opportunity" /> Laboratório
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Um teste por vez, resultado registrado. Cada vencedor vira regra do seu Channel Playbook;
          cada derrota entra na Failure Library para não se repetir.
        </p>
      </header>

      <section className="panel mt-6 p-5">
        <h2 className="text-base font-semibold">Novo experimento</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {kinds.map((k) => (
            <button
              key={k}
              onClick={() => setKind(k)}
              className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${
                kind === k
                  ? "border-primary bg-primary/15 text-foreground"
                  : "border-border bg-surface-2 text-muted-foreground hover:border-primary/50"
              }`}
            >
              Teste de {k}
            </button>
          ))}
        </div>
        <form
          className="mt-4 grid gap-2 sm:grid-cols-[1fr_1fr_auto]"
          onSubmit={(e) => {
            e.preventDefault();
            if (!a.trim() || !b.trim()) return;
            persist([
              {
                id: crypto.randomUUID(),
                kind,
                a: a.trim(),
                b: b.trim(),
                metric: "",
                winner: null,
                createdAt: Date.now(),
              },
              ...items,
            ]);
            setA("");
            setB("");
          }}
        >
          <Input value={a} onChange={(e) => setA(e.target.value)} placeholder="Versão A" className="h-11 bg-surface-2" />
          <Input value={b} onChange={(e) => setB(e.target.value)} placeholder="Versão B" className="h-11 bg-surface-2" />
          <Button type="submit" className="h-11 gap-2">
            <Plus className="size-4" /> Criar teste
          </Button>
        </form>
      </section>

      <section className="mt-4 grid gap-4 lg:grid-cols-2">
        <div className="panel p-5">
          <h2 className="text-base font-semibold">Em andamento</h2>
          {open.length === 0 && (
            <p className="mt-3 text-sm text-muted-foreground">Nenhum teste rodando agora.</p>
          )}
          <ul className="mt-3 space-y-3">
            {open.map((it) => (
              <li key={it.id} className="rounded-xl bg-surface-2 p-3">
                <p className="text-[11px] uppercase tracking-widest text-muted-foreground">
                  Teste de {it.kind}
                </p>
                <div className="mt-2 grid gap-2 sm:grid-cols-2">
                  {(["a", "b"] as const).map((side) => (
                    <button
                      key={side}
                      onClick={() =>
                        persist(items.map((x) => (x.id === it.id ? { ...x, winner: side } : x)))
                      }
                      className="rounded-lg border border-border p-2 text-left text-sm transition-colors hover:border-success"
                    >
                      <span className="text-[10px] uppercase text-muted-foreground">
                        {side === "a" ? "A" : "B"}
                      </span>
                      <span className="block">{it[side]}</span>
                    </button>
                  ))}
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <Input
                    value={it.metric}
                    onChange={(e) =>
                      persist(items.map((x) => (x.id === it.id ? { ...x, metric: e.target.value } : x)))
                    }
                    placeholder="Resultado observado (ex.: CTR 6,1% vs 9,3%)"
                    className="h-9 bg-background text-xs"
                  />
                  <button
                    onClick={() => persist(items.filter((x) => x.id !== it.id))}
                    aria-label="Apagar experimento"
                    className="text-muted-foreground hover:text-danger"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
                <p className="mt-2 text-[11px] text-muted-foreground">
                  Clique na versão vencedora quando tiver dados suficientes.
                </p>
              </li>
            ))}
          </ul>
        </div>

        <div className="panel p-5">
          <h2 className="flex items-center gap-2 text-base font-semibold">
            <Trophy className="size-4 text-success" /> Win Library
          </h2>
          <p className="text-xs text-muted-foreground">Aprendizados confirmados do seu canal.</p>
          {wins.length === 0 && (
            <p className="mt-3 text-sm text-muted-foreground">Ainda sem vencedores registrados.</p>
          )}
          <ul className="mt-3 space-y-3">
            {wins.map((it) => (
              <li key={it.id} className="rounded-xl bg-surface-2 p-3">
                <p className="text-[11px] uppercase tracking-widest text-muted-foreground">
                  {it.kind}
                </p>
                <p className="mt-1 text-sm">
                  <span className="text-success">Vence:</span> {it.winner === "a" ? it.a : it.b}
                </p>
                <p className="text-xs text-muted-foreground line-through">
                  {it.winner === "a" ? it.b : it.a}
                </p>
                {it.metric && <p className="num mt-1 text-xs text-success">{it.metric}</p>}
              </li>
            ))}
          </ul>
        </div>
      </section>
    </AppShell>
  );
}
