import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Dna, Plus, Trash2, Eye, EyeOff } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  useCreatorDna,
  dnaCompleteness,
  personalityLabels,
  type Personality,
} from "@/lib/creator-dna";

export const Route = createFileRoute("/creator-dna")({
  head: () => ({
    meta: [
      { title: "Creator DNA — seu perfil criativo | Órbita" },
      {
        name: "description",
        content:
          "O Creator DNA aprende seu estilo, humor, linguagem e preferências para que nenhuma sugestão da IA seja genérica.",
      },
      { property: "og:title", content: "Creator DNA | Órbita" },
      {
        property: "og:description",
        content: "Personalidade, memórias e preferências do criador em um perfil vivo e editável.",
      },
    ],
  }),
  component: Page,
});

function Page() {
  const { dna, update, addMemory, patchMemory, removeMemory } = useCreatorDna();
  const [draft, setDraft] = useState("");
  const pct = dnaCompleteness(dna);

  return (
    <AppShell>
      <header className="grid-noise panel p-6 sm:p-8">
        <p className="text-xs uppercase tracking-[0.2em] text-primary">Inteligência pessoal</p>
        <h1 className="mt-2 flex items-center gap-2 text-2xl font-bold sm:text-3xl">
          <Dna className="size-6 text-primary" /> Creator DNA
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Tudo que você registra aqui entra no raciocínio da IA. Quanto mais definido, mais as ideias
          soam como você — e menos genéricas ficam.
        </p>
        <div className="mt-5 flex items-center gap-4">
          <div className="h-2 w-56 overflow-hidden rounded-full bg-muted">
            <div className="brand-gradient h-full" style={{ width: `${pct}%` }} />
          </div>
          <span className="num text-sm">{pct}% definido</span>
        </div>
      </header>

      <section className="mt-6 grid gap-4 lg:grid-cols-3">
        <div className="panel p-5">
          <h2 className="text-base font-semibold">Modo de crescimento</h2>
          <p className="text-xs text-muted-foreground">
            Muda as prioridades das recomendações em todo o app.
          </p>
          <div className="mt-4 grid gap-2">
            {(
              [
                {
                  id: "small",
                  title: "Small Creator Mode",
                  desc: "Baixa competição, microtendências, produção barata, alta diferenciação.",
                },
                {
                  id: "pro",
                  title: "Professional Creator Mode",
                  desc: "Escala, séries, benchmarking, múltiplos formatos e monetização.",
                },
              ] as const
            ).map((m) => (
              <button
                key={m.id}
                onClick={() => update({ mode: m.id })}
                className={`rounded-xl border p-3 text-left transition-colors ${
                  dna.mode === m.id
                    ? "border-primary bg-primary/10"
                    : "border-border bg-surface-2 hover:border-primary/50"
                }`}
              >
                <p className="text-sm font-medium">{m.title}</p>
                <p className="mt-1 text-xs text-muted-foreground">{m.desc}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="panel p-5 lg:col-span-2">
          <h2 className="text-base font-semibold">Mapa de personalidade</h2>
          <p className="text-xs text-muted-foreground">
            A IA usa este mapa para calibrar tom, ritmo e formato das ideias.
          </p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {(Object.keys(dna.personality) as (keyof Personality)[]).map((k) => (
              <label key={k} className="block">
                <span className="flex justify-between text-xs">
                  <span className="text-muted-foreground">{personalityLabels[k]}</span>
                  <span className="num">{dna.personality[k]}</span>
                </span>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={dna.personality[k]}
                  onChange={(e) =>
                    update({
                      personality: { ...dna.personality, [k]: Number(e.target.value) },
                    })
                  }
                  className="mt-2 h-1.5 w-full appearance-none rounded-full bg-muted accent-[var(--color-primary)]"
                  aria-label={personalityLabels[k]}
                />
              </label>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-4 grid gap-4 lg:grid-cols-3">
        {(
          [
            { key: "goals", title: "Objetivos", ph: "Ex.: chegar a 100k sem virar canal de notícia." },
            { key: "likes", title: "Gosto de fazer", ph: "Ex.: testes práticos, humor seco, edição rápida." },
            { key: "dislikes", title: "Não quero fazer", ph: "Ex.: reagir a vídeos, clickbait exagerado." },
          ] as const
        ).map((f) => (
          <div key={f.key} className="panel p-5">
            <h3 className="text-sm font-semibold">{f.title}</h3>
            <textarea
              value={dna[f.key]}
              onChange={(e) => update({ [f.key]: e.target.value })}
              placeholder={f.ph}
              rows={4}
              className="mt-3 w-full resize-none rounded-xl border border-border bg-surface-2 p-3 text-sm outline-none placeholder:text-muted-foreground focus:border-primary"
            />
          </div>
        ))}
      </section>

      <section className="panel mt-4 p-5">
        <h2 className="text-base font-semibold">Memória do meu canal</h2>
        <p className="text-xs text-muted-foreground">
          Fatos de longo prazo que a IA deve lembrar. Você controla tudo: editar, desativar ou apagar.
        </p>

        <form
          className="mt-4 flex flex-col gap-2 sm:flex-row"
          onSubmit={(e) => {
            e.preventDefault();
            if (!draft.trim()) return;
            addMemory(draft.trim());
            setDraft("");
          }}
        >
          <Input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Ex.: prefiro thumbnails sem meu rosto em close."
            className="h-11 bg-surface-2"
            aria-label="Nova memória"
          />
          <Button type="submit" className="h-11 gap-2">
            <Plus className="size-4" /> Guardar
          </Button>
        </form>

        <ul className="mt-4 divide-y divide-border">
          {dna.memories.map((m) => (
            <li key={m.id} className="flex items-center gap-3 py-3">
              <span
                className={`size-1.5 shrink-0 rounded-full ${m.active ? "bg-success" : "bg-muted-foreground/40"}`}
              />
              <input
                value={m.text}
                onChange={(e) => patchMemory(m.id, { text: e.target.value })}
                className={`min-w-0 flex-1 bg-transparent text-sm outline-none ${
                  m.active ? "" : "text-muted-foreground line-through"
                }`}
              />
              <span className="hidden rounded-full border border-border px-2 py-0.5 text-[10px] text-muted-foreground sm:inline">
                {m.source}
              </span>
              <button
                onClick={() => patchMemory(m.id, { active: !m.active })}
                aria-label={m.active ? "Desativar memória" : "Ativar memória"}
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                {m.active ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
              </button>
              <button
                onClick={() => removeMemory(m.id)}
                aria-label="Apagar memória"
                className="text-muted-foreground transition-colors hover:text-danger"
              >
                <Trash2 className="size-4" />
              </button>
            </li>
          ))}
          {dna.memories.length === 0 && (
            <li className="py-6 text-center text-sm text-muted-foreground">
              Nenhuma memória ainda. A IA vai sugerir memórias conforme vocês conversarem.
            </li>
          )}
        </ul>
      </section>
    </AppShell>
  );
}
