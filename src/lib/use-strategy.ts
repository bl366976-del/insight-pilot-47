import { useCallback, useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { generateStrategy } from "@/lib/strategy.functions";
import type { StrategyPlan } from "@/lib/strategy.server";
import { buildChannelContext, useChannel } from "@/lib/use-channel";
import { buildDnaContext, useCreatorDna } from "@/lib/creator-dna";

const KEY = "orbita.strategy";

type Cached = { channelId: string; createdAt: number; plan: StrategyPlan };

export function useStrategy() {
  const { snapshot, ready: channelReady } = useChannel();
  const { dna } = useCreatorDna();
  const [plan, setPlan] = useState<StrategyPlan | null>(null);
  const [createdAt, setCreatedAt] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const run = useServerFn(generateStrategy);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(KEY);
      if (raw) {
        const cached = JSON.parse(raw) as Cached;
        setPlan(cached.plan);
        setCreatedAt(cached.createdAt);
      }
    } catch {
      /* cache inválido */
    }
    setReady(true);
  }, []);

  const generate = useCallback(async () => {
    if (!snapshot) {
      setError("Conecte seu canal primeiro para gerar um plano com dados reais.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const context = [
        buildChannelContext(snapshot),
        "",
        buildDnaContext(dna),
        "",
        `Data de hoje: ${new Date().toLocaleDateString("pt-BR")}`,
      ].join("\n");
      const result = await run({ data: { context: context.slice(0, 16000) } });
      const cached: Cached = {
        channelId: snapshot.channelId,
        createdAt: Date.now(),
        plan: result,
      };
      window.localStorage.setItem(KEY, JSON.stringify(cached));
      setPlan(result);
      setCreatedAt(cached.createdAt);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao gerar o plano.";
      setError(
        message.includes("MISSING_KEY")
          ? "A IA não está configurada neste projeto."
          : message,
      );
    } finally {
      setLoading(false);
    }
  }, [dna, run, snapshot]);

  // Gera automaticamente na primeira visita depois de conectar o canal.
  useEffect(() => {
    if (!ready || !channelReady || loading || plan || !snapshot) return;
    void generate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, channelReady, snapshot]);

  return { plan, createdAt, loading, error, ready, generate, snapshot };
}
