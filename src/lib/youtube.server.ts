const API = "https://www.googleapis.com/youtube/v3";

export type ChannelSnapshot = {
  channelId: string;
  title: string;
  handle: string;
  description: string;
  thumbnail: string;
  subscribers: number;
  views: number;
  videoCount: number;
  publishedAt: string;
  videos: VideoSnapshot[];
  insights: string[];
  contentProfile: {
    avgViews: number;
    medianDurationMin: number;
    shortsShare: number;
    postsPerWeek: number;
    topTopics: string[];
    bestVideo: string;
    worstVideo: string;
  };
};

export type VideoSnapshot = {
  id: string;
  title: string;
  publishedAt: string;
  views: number;
  likes: number;
  comments: number;
  durationMin: number;
  isShort: boolean;
  thumbnail: string;
  engagementRate: number;
  vsAverage: number;
};

function parseDuration(iso: string): number {
  const m = /PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/.exec(iso);
  if (!m) return 0;
  const [, h, min, s] = m;
  return (Number(h ?? 0) * 3600 + Number(min ?? 0) * 60 + Number(s ?? 0)) / 60;
}

function extractQuery(input: string): { type: "id" | "handle" | "search"; value: string } {
  const raw = input.trim();
  const urlChannel = /youtube\.com\/channel\/(UC[\w-]{20,})/i.exec(raw);
  if (urlChannel) return { type: "id", value: urlChannel[1]! };
  const urlHandle = /youtube\.com\/@([\w.\-]+)/i.exec(raw);
  if (urlHandle) return { type: "handle", value: urlHandle[1]! };
  if (/^UC[\w-]{20,}$/.test(raw)) return { type: "id", value: raw };
  if (raw.startsWith("@")) return { type: "handle", value: raw.slice(1) };
  return { type: "search", value: raw };
}

async function fetchJson(url: string) {
  const res = await fetch(url);
  const body = await res.json();
  if (!res.ok) {
    const message =
      (body as { error?: { message?: string } })?.error?.message ?? `Erro ${res.status}`;
    throw new Error(message);
  }
  return body as any;
}

export async function fetchChannelSnapshot(input: string, key: string): Promise<ChannelSnapshot> {
  const q = extractQuery(input);
  let channelId = q.type === "id" ? q.value : "";

  if (!channelId && q.type === "handle") {
    const data = await fetchJson(
      `${API}/channels?part=id&forHandle=${encodeURIComponent(q.value)}&key=${key}`,
    );
    channelId = data.items?.[0]?.id ?? "";
  }
  if (!channelId) {
    const data = await fetchJson(
      `${API}/search?part=snippet&type=channel&maxResults=1&q=${encodeURIComponent(q.value)}&key=${key}`,
    );
    channelId = data.items?.[0]?.snippet?.channelId ?? data.items?.[0]?.id?.channelId ?? "";
  }
  if (!channelId) throw new Error("Canal não encontrado. Tente o @handle ou a URL completa.");

  const channelData = await fetchJson(
    `${API}/channels?part=snippet,statistics,contentDetails&id=${channelId}&key=${key}`,
  );
  const ch = channelData.items?.[0];
  if (!ch) throw new Error("Canal não encontrado.");

  const uploads: string = ch.contentDetails.relatedPlaylists.uploads;
  const playlist = await fetchJson(
    `${API}/playlistItems?part=contentDetails&maxResults=30&playlistId=${uploads}&key=${key}`,
  );
  const ids: string[] = (playlist.items ?? []).map((i: any) => i.contentDetails.videoId);

  let videos: VideoSnapshot[] = [];
  if (ids.length) {
    const vd = await fetchJson(
      `${API}/videos?part=snippet,statistics,contentDetails&id=${ids.join(",")}&key=${key}`,
    );
    videos = (vd.items ?? []).map((v: any) => {
      const views = Number(v.statistics?.viewCount ?? 0);
      const likes = Number(v.statistics?.likeCount ?? 0);
      const comments = Number(v.statistics?.commentCount ?? 0);
      const durationMin = parseDuration(v.contentDetails?.duration ?? "PT0S");
      return {
        id: v.id,
        title: v.snippet.title,
        publishedAt: v.snippet.publishedAt,
        views,
        likes,
        comments,
        durationMin,
        isShort: durationMin <= 1.05,
        thumbnail: v.snippet.thumbnails?.medium?.url ?? "",
        engagementRate: views ? ((likes + comments) / views) * 100 : 0,
        vsAverage: 0,
      } satisfies VideoSnapshot;
    });
  }

  const avgViews = videos.length
    ? Math.round(videos.reduce((a, v) => a + v.views, 0) / videos.length)
    : 0;
  videos = videos.map((v) => ({
    ...v,
    vsAverage: avgViews ? Math.round((v.views / avgViews - 1) * 100) : 0,
  }));

  const sortedByViews = [...videos].sort((a, b) => b.views - a.views);
  const longs = videos.filter((v) => !v.isShort);
  const durations = longs.map((v) => v.durationMin).sort((a, b) => a - b);
  const medianDurationMin = durations.length
    ? Math.round(durations[Math.floor(durations.length / 2)]! * 10) / 10
    : 0;

  const dates = videos.map((v) => new Date(v.publishedAt).getTime()).sort((a, b) => b - a);
  const spanWeeks =
    dates.length > 1 ? Math.max((dates[0]! - dates[dates.length - 1]!) / 6048e5, 1) : 1;
  const postsPerWeek = Math.round((videos.length / spanWeeks) * 10) / 10;

  const stop = new Set([
    "de","a","o","que","e","do","da","em","para","com","no","na","os","as","um","uma","por","como",
    "meu","minha","the","of","to","and","is","seu","sua","mais","não","você","eu","-","|","2024","2025","2026",
  ]);
  const freq = new Map<string, number>();
  for (const v of videos) {
    for (const word of v.title.toLowerCase().split(/[^\p{L}\p{N}]+/u)) {
      if (word.length < 4 || stop.has(word)) continue;
      freq.set(word, (freq.get(word) ?? 0) + 1);
    }
  }
  const topTopics = [...freq.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([w]) => w);

  const shortsShare = videos.length
    ? Math.round((videos.filter((v) => v.isShort).length / videos.length) * 100)
    : 0;

  const insights: string[] = [];
  if (sortedByViews[0]) {
    insights.push(
      `“${sortedByViews[0].title}” é o vídeo recente com melhor desempenho: ${sortedByViews[0].views.toLocaleString("pt-BR")} views (${sortedByViews[0].vsAverage > 0 ? "+" : ""}${sortedByViews[0].vsAverage}% vs média dos últimos vídeos).`,
    );
  }
  if (medianDurationMin) {
    const above = longs.filter((v) => v.views > avgViews);
    const avgAbove = above.length
      ? Math.round((above.reduce((a, v) => a + v.durationMin, 0) / above.length) * 10) / 10
      : medianDurationMin;
    insights.push(
      `Duração mediana dos vídeos longos: ${medianDurationMin} min. Os que superaram a média de views têm ~${avgAbove} min — essa é a faixa a testar.`,
    );
  }
  if (shortsShare > 0) {
    const shorts = videos.filter((v) => v.isShort);
    const shortsAvg = Math.round(shorts.reduce((a, v) => a + v.views, 0) / shorts.length);
    insights.push(
      `Shorts são ${shortsShare}% das publicações recentes e fazem em média ${shortsAvg.toLocaleString("pt-BR")} views vs ${avgViews.toLocaleString("pt-BR")} da média geral.`,
    );
  } else {
    insights.push("Nenhum Short nas publicações recentes — há espaço para testar cortes como fonte extra de descoberta.");
  }
  const bestEng = [...videos].sort((a, b) => b.engagementRate - a.engagementRate)[0];
  if (bestEng) {
    insights.push(
      `Maior engajamento: “${bestEng.title}” com ${bestEng.engagementRate.toFixed(2)}% (likes+comentários / views) — sinal de tema com comunidade forte.`,
    );
  }
  insights.push(
    `Frequência estimada: ${postsPerWeek} publicações por semana nos últimos ${videos.length} vídeos.`,
  );

  return {
    channelId,
    title: ch.snippet.title,
    handle: ch.snippet.customUrl ?? "",
    description: ch.snippet.description ?? "",
    thumbnail: ch.snippet.thumbnails?.medium?.url ?? "",
    subscribers: Number(ch.statistics?.subscriberCount ?? 0),
    views: Number(ch.statistics?.viewCount ?? 0),
    videoCount: Number(ch.statistics?.videoCount ?? 0),
    publishedAt: ch.snippet.publishedAt,
    videos: videos.slice(0, 12),
    insights,
    contentProfile: {
      avgViews,
      medianDurationMin,
      shortsShare,
      postsPerWeek,
      topTopics,
      bestVideo: sortedByViews[0]?.title ?? "",
      worstVideo: sortedByViews[sortedByViews.length - 1]?.title ?? "",
    },
  };
}
