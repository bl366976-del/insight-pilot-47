import type { ChannelSnapshot } from "./youtube.server";

export function compact(n: number) {
  if (n >= 1e9) return `${(n / 1e9).toFixed(1)}B`;
  if (n >= 1e6) return `${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(0)}k`;
  return String(n);
}

/** Métricas reais derivadas dos últimos vídeos importados do canal. */
export function realMetrics(s: ChannelSnapshot) {
  const videos = [...s.videos].sort(
    (a, b) => new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime(),
  );
  const half = Math.max(1, Math.floor(videos.length / 2));
  const older = videos.slice(0, half);
  const recent = videos.slice(half);
  const avg = (arr: typeof videos, pick: (v: (typeof videos)[number]) => number) =>
    arr.length ? arr.reduce((a, v) => a + pick(v), 0) / arr.length : 0;

  const viewsDelta = older.length
    ? Math.round((avg(recent, (v) => v.views) / Math.max(avg(older, (v) => v.views), 1) - 1) * 100)
    : 0;
  const engDelta =
    Math.round((avg(recent, (v) => v.engagementRate) - avg(older, (v) => v.engagementRate)) * 100) /
    100;

  const growth = videos.map((v) => ({
    label: new Date(v.publishedAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
    views: Math.round(v.views / 1000),
  }));

  const engAvg = avg(videos, (v) => v.engagementRate);
  const scores = [
    { label: "Engajamento", value: Math.min(100, Math.round(engAvg * 20)) },
    { label: "Consistência", value: Math.min(100, Math.round(s.contentProfile.postsPerWeek * 40)) },
    { label: "Variedade de temas", value: Math.min(100, s.contentProfile.topTopics.length * 12) },
    { label: "Descoberta (Shorts)", value: Math.min(100, Math.round(s.contentProfile.shortsShare)) },
  ];

  /** Veredito de catálogo calculado a partir do desempenho real de cada vídeo. */
  const catalog = [...s.videos]
    .sort((a, b) => b.views - a.views)
    .slice(0, 6)
    .map((v) => {
      const verdict =
        v.vsAverage >= 40
          ? "Repetir"
          : v.vsAverage >= 0
            ? "Explorar"
            : v.engagementRate > engAvg
              ? "Transformar"
              : v.vsAverage <= -60
                ? "Abandonar"
                : "Atualizar";
      return {
        title: v.title,
        views: compact(v.views),
        verdict,
        note:
          verdict === "Repetir"
            ? `${v.vsAverage}% acima da média — vale virar série ou formato recorrente.`
            : verdict === "Explorar"
              ? `Desempenho acima da média (${v.vsAverage > 0 ? "+" : ""}${v.vsAverage}%) com pouca exploração do tema.`
              : verdict === "Transformar"
                ? `Views abaixo da média, mas ${v.engagementRate.toFixed(2)}% de engajamento — reaproveite em outro formato.`
                : verdict === "Abandonar"
                  ? `${v.vsAverage}% vs média e engajamento baixo — tema fora do posicionamento.`
                  : `${v.vsAverage}% vs média — refaça com melhor título e thumbnail.`,
      };
    });

  return { viewsDelta, engDelta, growth, engAvg, scores, catalog };
}
