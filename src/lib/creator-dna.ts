import { useCallback, useEffect, useState } from "react";

const KEY = "orbita.creator-dna";

export type DnaMemory = {
  id: string;
  text: string;
  source: "manual" | "conversa" | "sistema";
  active: boolean;
  createdAt: number;
};

export type Personality = {
  humor: number;
  energia: number;
  formalidade: number;
  espontaneidade: number;
  emocao: number;
  ritmo: number;
  storytelling: number;
  interacao: number;
  complexidade: number;
};

export type CreatorDna = {
  mode: "small" | "pro";
  goals: string;
  likes: string;
  dislikes: string;
  personality: Personality;
  memories: DnaMemory[];
};

export const personalityLabels: Record<keyof Personality, string> = {
  humor: "Humor",
  energia: "Energia",
  formalidade: "Formalidade",
  espontaneidade: "Espontaneidade",
  emocao: "Emoção",
  ritmo: "Ritmo",
  storytelling: "Storytelling",
  interacao: "Interação",
  complexidade: "Complexidade",
};

export const defaultDna: CreatorDna = {
  mode: "small",
  goals: "",
  likes: "",
  dislikes: "",
  personality: {
    humor: 70,
    energia: 65,
    formalidade: 30,
    espontaneidade: 75,
    emocao: 55,
    ritmo: 70,
    storytelling: 60,
    interacao: 65,
    complexidade: 45,
  },
  memories: [
    {
      id: "m-1",
      text: "Prefere thumbnails com pouco texto e alto contraste.",
      source: "sistema",
      active: true,
      createdAt: Date.now(),
    },
    {
      id: "m-2",
      text: "Não gosta de introduções longas — hook em até 20 segundos.",
      source: "sistema",
      active: true,
      createdAt: Date.now(),
    },
    {
      id: "m-3",
      text: "Quer manter linguagem informal e humor espontâneo.",
      source: "sistema",
      active: true,
      createdAt: Date.now(),
    },
  ],
};

export function useCreatorDna() {
  const [dna, setDna] = useState<CreatorDna>(defaultDna);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(KEY);
      if (raw) setDna({ ...defaultDna, ...(JSON.parse(raw) as CreatorDna) });
    } catch {
      /* ignora storage inválido */
    }
    setReady(true);
  }, []);

  const update = useCallback((patch: Partial<CreatorDna>) => {
    setDna((prev) => {
      const next = { ...prev, ...patch };
      window.localStorage.setItem(KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const addMemory = useCallback(
    (text: string, source: DnaMemory["source"] = "manual") => {
      setDna((prev) => {
        const next: CreatorDna = {
          ...prev,
          memories: [
            { id: crypto.randomUUID(), text, source, active: true, createdAt: Date.now() },
            ...prev.memories,
          ],
        };
        window.localStorage.setItem(KEY, JSON.stringify(next));
        return next;
      });
    },
    [],
  );

  const patchMemory = useCallback((id: string, patch: Partial<DnaMemory>) => {
    setDna((prev) => {
      const next: CreatorDna = {
        ...prev,
        memories: prev.memories.map((m) => (m.id === id ? { ...m, ...patch } : m)),
      };
      window.localStorage.setItem(KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const removeMemory = useCallback((id: string) => {
    setDna((prev) => {
      const next: CreatorDna = { ...prev, memories: prev.memories.filter((m) => m.id !== id) };
      window.localStorage.setItem(KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  return { dna, ready, update, addMemory, patchMemory, removeMemory };
}

/** Percentual de definição do DNA — quanto o sistema já conhece o criador. */
export function dnaCompleteness(dna: CreatorDna): number {
  const active = dna.memories.filter((m) => m.active).length;
  const score =
    Math.min(active, 8) * 7 +
    (dna.goals.trim() ? 16 : 0) +
    (dna.likes.trim() ? 14 : 0) +
    (dna.dislikes.trim() ? 14 : 0);
  return Math.max(12, Math.min(100, score));
}

export function buildDnaContext(dna: CreatorDna): string {
  const p = dna.personality;
  const mems = dna.memories.filter((m) => m.active).map((m) => `- ${m.text}`);
  return [
    "CREATOR DNA (use isto para personalizar tudo; nunca sugira algo que contrarie estas preferências):",
    `Modo: ${dna.mode === "small" ? "Canal pequeno — priorize baixa competição, custo baixo e microtendências" : "Canal profissional — priorize escala, benchmarking, séries e monetização"}`,
    dna.goals.trim() ? `Objetivos: ${dna.goals.trim()}` : "",
    dna.likes.trim() ? `Gosta de: ${dna.likes.trim()}` : "",
    dna.dislikes.trim() ? `Rejeita: ${dna.dislikes.trim()}` : "",
    `Personalidade (0-100): ${(Object.keys(p) as (keyof Personality)[])
      .map((k) => `${personalityLabels[k]} ${p[k]}`)
      .join(" · ")}`,
    mems.length ? `Memórias do criador:\n${mems.join("\n")}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}
