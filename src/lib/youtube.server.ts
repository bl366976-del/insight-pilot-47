const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";
const INNERTUBE_KEY = "AIzaSyAO_FJ2SlqU8Q4STEHLGCilw_Y9_11qcW8";

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

async function getText(url: string) {
  const res = await fetch(url, {
    headers: { "user-agent": UA, "accept-language": "en-US,en;q=0.9" },
  });
  if (!res.ok) throw new Error(`Falha ao consultar o YouTube (${res.status}).`);
  return await res.text();
}

function unescapeJson(value: string) {
  try {
    return JSON.parse(`"${value.replace(/"/g, '\\"')}"`) as string;
  } catch {
    return value;
  }
}

function parseCompact(raw: string): number {
  const m = /([\d.,]+)\s*([KMB])?/i.exec(raw.replace(/\u00a0/g, " "));
  if (!m) return 0;
  const num = Number(m[1]!.replace(/,/g, ""));
  const mult = { k: 1e3, m: 1e6, b: 1e9 }[(m[2] ?? "").toLowerCase()] ?? 1;
  return Math.round(num * mult);
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

async function resolveChannelId(input: string): Promise<string> {
  const q = extractQuery(input);
  if (q.type === "id") return q.value;

  if (q.type === "handle") {
    const html = await getText(`https://www.youtube.com/@${encodeURIComponent(q.value)}`);
    const id =
      /"externalId":"(UC[\w-]{20,})"/.exec(html)?.[1] ??
      /rel="canonical" href="https:\/\/www\.youtube\.com\/channel\/(UC[\w-]{20,})"/.exec(html)?.[1];
    if (id) return id;
  }

  const html = await getText(
    `https://www.youtube.com/results?search_query=${encodeURIComponent(q.value)}&sp=EgIQAg%253D%253D`,
  );
  const id = /"channelId":"(UC[\w-]{20,})"/.exec(html)?.[1];
  if (!id) throw new Error("Canal não encontrado. Tente o @handle ou a URL completa do canal.");
  return id;
}

type RssEntry = {
  id: string;
  title: string;
  publishedAt: string;
  views: number;
  likes: number;
  thumbnail: string;
  isShort: boolean;
};

async function fetchFeed(channelId: string): Promise<RssEntry[]> {
  const xml = await getText(
    `https://www.youtube.com/feeds/videos.xml?channel_id=${encodeURIComponent(channelId)}`,
  );
  const entries = xml.split("<entry>").slice(1);
  return entries.map((e) => {
    const pick = (re: RegExp) => re.exec(e)?.[1] ?? "";
    const id = pick(/<yt:videoId>([^<]+)<\/yt:videoId>/);
    return {
      id,
      title: unescapeJson(pick(/<title>([\s\S]*?)<\/title>/))
        .replace(/&amp;/g, "&")
        .replace(/&#39;/g, "'")
        .replace(/&quot;/g, '"')
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">"),
      publishedAt: pick(/<published>([^<]+)<\/published>/),
      views: Number(pick(/<media:statistics views="(\d+)"/) || 0),
      likes: Number(pick(/<media:starRating count="(\d+)"/) || 0),
      thumbnail: pick(/<media:thumbnail url="([^"]+)"/),
      isShort: /href="https:\/\/www\.youtube\.com\/shorts\//.test(e),
    };
  });
}

async function fetchDuration(videoId: string): Promise<number> {
  try {
    const res = await fetch(`https://www.youtube.com/youtubei/v1/player?key=${INNERTUBE_KEY}`, {
      method: "POST",
      headers: { "content-type": "application/json", "user-agent": UA },
      body: JSON.stringify({
        videoId,
        context: { client: { clientName: "WEB", clientVersion: "2.20240101.00.00" } },
      }),
    });
    if (!res.ok) return 0;
    const json = (await res.json()) as { videoDetails?: { lengthSeconds?: string } };
    return Number(json.videoDetails?.lengthSeconds ?? 0) / 60;
  } catch {
    return 0;
  }
}

export async function fetchChannelSnapshot(input: string): Promise<ChannelSnapshot> {
  const channelId = await resolveChannelId(input);

  const [about, feed] = await Promise.all([
    getText(`https://www.youtube.com/channel/${channelId}/about`),
    fetchFeed(channelId),
  ]);

  const title =
    unescapeJson(/"channelMetadataRenderer":\{"title":"((?:[^"\\]|\\.)*)"/.exec(about)?.[1] ?? "") ||
    feed[0]?.title ||
    "Canal";
  const handle = unescapeJson(/"canonicalChannelUrl":"[^"]*?\/(@[\w.\-]+)"/.exec(about)?.[1] ?? "");
  const description = unescapeJson(
    /"description":"((?:[^"\\]|\\.){0,1200})"/.exec(about)?.[1] ?? "",
  );
  const thumbnail =
    /<meta property="og:image" content="([^"]+)"/.exec(about)?.[1] ??
    /"avatar":\{"thumbnails":\[\{"url":"([^"]+)"/.exec(about)?.[1] ??
    "";
  const subscribers = parseCompact(/"subscriberCountText":"([^"]+)"/.exec(about)?.[1] ?? "0");
  const views = parseCompact(/"viewCountText":"([^"]+)"/.exec(about)?.[1] ?? "0");
  const videoCount = parseCompact(/"videoCountText":"([^"]+)"/.exec(about)?.[1] ?? "0");
  const joined = /"joinedDateText":\{"content":"Joined ([^"]+)"/.exec(about)?.[1] ?? "";
  const publishedAt = joined ? new Date(joined).toISOString() : "";

  if (!feed.length) {
    throw new Error(
      "Não encontramos vídeos públicos recentes nesse canal. Verifique o @handle informado.",
    );
  }

  const durations = await Promise.all(feed.map((v) => fetchDuration(v.id)));

  let videos: VideoSnapshot[] = feed.map((v, i) => {
    const durationMin = durations[i] || (v.isShort ? 0.8 : 0);
    return {
      id: v.id,
      title: v.title,
      publishedAt: v.publishedAt,
      views: v.views,
      likes: v.likes,
      comments: 0,
      durationMin,
      isShort: v.isShort || (durationMin > 0 && durationMin <= 1.05),
      thumbnail: v.thumbnail,
      engagementRate: v.views ? (v.likes / v.views) * 100 : 0,
      vsAverage: 0,
    } satisfies VideoSnapshot;
  });

  const avgViews = videos.length
    ? Math.round(videos.reduce((a, v) => a + v.views, 0) / videos.length)
    : 0;
  videos = videos.map((v) => ({
    ...v,
    vsAverage: avgViews ? Math.round((v.views / avgViews - 1) * 100) : 0,
  }));

  const sortedByViews = [...videos].sort((a, b) => b.views - a.views);
  const longs = videos.filter((v) => !v.isShort);
  const longDurations = longs.map((v) => v.durationMin).filter(Boolean).sort((a, b) => a - b);
  const medianDurationMin = longDurations.length
    ? Math.round(longDurations[Math.floor(longDurations.length / 2)]! * 10) / 10
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
    const above = longs.filter((v) => v.views > avgViews && v.durationMin);
    const avgAbove = above.length
      ? Math.round((above.reduce((a, v) => a + v.durationMin, 0) / above.length) * 10) / 10
      : medianDurationMin;
    insights.push(
      `Duração mediana dos vídeos longos: ${medianDurationMin} min. Os que superaram a média de views têm ~${avgAbove} min — essa é a faixa a testar.`,
    );
  }
  const shorts = videos.filter((v) => v.isShort);
  if (shorts.length) {
    const shortsAvg = Math.round(shorts.reduce((a, v) => a + v.views, 0) / shorts.length);
    insights.push(
      `Shorts são ${shortsShare}% das publicações recentes e fazem em média ${shortsAvg.toLocaleString("pt-BR")} views vs ${avgViews.toLocaleString("pt-BR")} da média geral.`,
    );
  } else {
    insights.push(
      "Nenhum Short nas publicações recentes — há espaço para testar cortes como fonte extra de descoberta.",
    );
  }
  const bestEng = [...videos].sort((a, b) => b.engagementRate - a.engagementRate)[0];
  if (bestEng) {
    insights.push(
      `Maior taxa de likes: “${bestEng.title}” com ${bestEng.engagementRate.toFixed(2)}% (likes / views) — sinal de tema com comunidade forte.`,
    );
  }
  insights.push(
    `Frequência estimada: ${postsPerWeek} publicações por semana nos últimos ${videos.length} vídeos.`,
  );

  return {
    channelId,
    title,
    handle,
    description,
    thumbnail,
    subscribers,
    views,
    videoCount,
    publishedAt,
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
