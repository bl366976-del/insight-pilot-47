import { useCallback, useEffect, useState } from "react";
import type { ChannelSnapshot } from "./youtube.server";

const KEY = "orbita.channel";

export function useChannel() {
  const [snapshot, setSnapshot] = useState<ChannelSnapshot | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(KEY);
      if (raw) setSnapshot(JSON.parse(raw) as ChannelSnapshot);
    } catch {
      /* ignora storage inválido */
    }
    setReady(true);
  }, []);

  const save = useCallback((next: ChannelSnapshot) => {
    window.localStorage.setItem(KEY, JSON.stringify(next));
    setSnapshot(next);
  }, []);

  const clear = useCallback(() => {
    window.localStorage.removeItem(KEY);
    setSnapshot(null);
  }, []);

  return { snapshot, ready, save, clear };
}

export function buildChannelContext(s: ChannelSnapshot | null): string {
  if (!s) return "";
  const p = s.contentProfile;
  return [
    `Canal: ${s.title} (${s.handle})`,
    `Inscritos: ${s.subscribers.toLocaleString("pt-BR")} · Views totais: ${s.views.toLocaleString("pt-BR")} · Vídeos: ${s.videoCount}`,
    `Descrição: ${s.description.slice(0, 400)}`,
    `Média de views nos últimos vídeos: ${p.avgViews.toLocaleString("pt-BR")}`,
    `Duração mediana (longos): ${p.medianDurationMin} min · Shorts: ${p.shortsShare}% · Frequência: ${p.postsPerWeek}/semana`,
    `Temas recorrentes nos títulos: ${p.topTopics.join(", ")}`,
    `Insights calculados: ${s.insights.join(" | ")}`,
    "Últimos vídeos (título · views · engajamento% · duração min · vs média%):",
    ...s.videos.map(
      (v) =>
        `- ${v.title} · ${v.views.toLocaleString("pt-BR")} · ${v.engagementRate.toFixed(2)}% · ${v.durationMin.toFixed(1)} · ${v.vsAverage > 0 ? "+" : ""}${v.vsAverage}%`,
    ),
  ].join("\n");
}
