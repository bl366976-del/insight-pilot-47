export type Confidence = "alta" | "média" | "baixa";

export const channel = {
  name: "Canal Órbita",
  niche: "Tecnologia & Produtividade",
  stage: "Nível 2 — Crescimento",
  subscribers: 42800,
  subsDelta: 6.4,
  views30d: 812400,
  viewsDelta: 8.3,
  ctr: 5.8,
  ctrDelta: -0.7,
  retention: 41.2,
  retentionDelta: 2.1,
  watchHours: 38900,
  watchDelta: 11.2,
};

export const growth = [
  { label: "Sem 1", views: 128, subs: 480 },
  { label: "Sem 2", views: 154, subs: 610 },
  { label: "Sem 3", views: 141, subs: 520 },
  { label: "Sem 4", views: 189, subs: 780 },
  { label: "Sem 5", views: 172, subs: 690 },
  { label: "Sem 6", views: 236, subs: 940 },
  { label: "Sem 7", views: 268, subs: 1120 },
  { label: "Sem 8", views: 312, subs: 1340 },
];

export const scores = [
  { label: "Conteúdo", value: 78 },
  { label: "CTR", value: 54 },
  { label: "Retenção", value: 71 },
  { label: "Consistência", value: 63 },
  { label: "Branding", value: 46 },
  { label: "SEO", value: 69 },
  { label: "Tendências", value: 82 },
  { label: "Diferenciação", value: 58 },
];

export type Opportunity = {
  id: string;
  title: string;
  why: string;
  data: string[];
  confidence: Confidence;
  impact: number;
  effort: "baixo" | "médio" | "alto";
  tag: string;
};

export const opportunities: Opportunity[] = [
  {
    id: "op-1",
    title: "Dobrar vídeos de comparação dentro do nicho",
    why: "Comparações convertem 2,3× mais inscritos por 1.000 views do que os vídeos de notícia, mesmo tendo menos views absolutas.",
    data: [
      "Últimos 12 vídeos: comparações com 9,4 inscritos/1k views vs 4,1 da média",
      "Retenção média 47,8% em comparações (canal: 41,2%)",
      "Busca por “X vs Y” no nicho cresceu 34% em 90 dias",
    ],
    confidence: "alta",
    impact: 92,
    effort: "médio",
    tag: "Formato",
  },
  {
    id: "op-2",
    title: "Encurtar a introdução para menos de 20 segundos",
    why: "A maior perda de audiência acontece antes da entrega da promessa nos seus vídeos longos.",
    data: [
      "72% de abandono entre 0:18 e 0:31 nos últimos 6 vídeos",
      "Vídeos com hook direto retiveram +18 pontos em 30s",
    ],
    confidence: "alta",
    impact: 86,
    effort: "baixo",
    tag: "Retenção",
  },
  {
    id: "op-3",
    title: "Lacuna de conteúdo: automações locais de IA",
    why: "Demanda crescente com pouca oferta de criadores comparáveis ao seu tamanho.",
    data: [
      "Interesse de busca +42% em 60 dias",
      "Apenas 2 de 14 concorrentes monitorados publicaram sobre o tema",
      "Seus 3 vídeos adjacentes tiveram CTR 7,1% (acima da média)",
    ],
    confidence: "média",
    impact: 79,
    effort: "médio",
    tag: "Tendência",
  },
  {
    id: "op-4",
    title: "Parte 2 pedida explicitamente pela audiência",
    why: "Sinal direto de demanda nos comentários do vídeo mais recente.",
    data: [
      "38% dos 1.204 comentários pedem continuação",
      "Sentimento positivo em 81% das menções",
    ],
    confidence: "alta",
    impact: 74,
    effort: "baixo",
    tag: "Audiência",
  },
];

export type Trend = {
  topic: string;
  status: "Explodindo" | "Crescendo" | "Estável" | "Saturado" | "Em queda" | "Oportunidade escondida";
  interest: number;
  growth: number;
  competition: number;
  score: number;
  source: string;
};

export const trends: Trend[] = [
  { topic: "Agentes de IA locais", status: "Explodindo", interest: 87, growth: 42, competition: 38, score: 91, source: "YouTube · Google Trends · Reddit" },
  { topic: "Setup minimalista 2026", status: "Crescendo", interest: 74, growth: 21, competition: 44, score: 78, source: "YouTube · TikTok" },
  { topic: "Produtividade sem apps", status: "Oportunidade escondida", interest: 58, growth: 33, competition: 17, score: 84, source: "Reddit · Google Trends" },
  { topic: "Review de notebooks", status: "Saturado", interest: 92, growth: 4, competition: 89, score: 41, source: "YouTube" },
  { topic: "Prompt engineering básico", status: "Em queda", interest: 61, growth: -18, competition: 72, score: 28, source: "Google Trends · X" },
  { topic: "Automação de rotina doméstica", status: "Estável", interest: 66, growth: 6, competition: 51, score: 59, source: "YouTube · Notícias" },
];

export const todayTasks = [
  { task: "Gravar hook alternativo do vídeo “7 ferramentas de IA”", impact: "Alto", effort: "Baixo", why: "Hook é a maior alavanca de retenção agora." },
  { task: "Testar thumbnail B (menos texto) no vídeo de terça", impact: "Alto", effort: "Baixo", why: "CTR caiu 0,7 pt em 28 dias." },
  { task: "Responder 20 comentários pedindo Parte 2", impact: "Médio", effort: "Baixo", why: "Demanda explícita e sinal de comunidade." },
  { task: "Pesquisar tendência “agentes de IA locais”", impact: "Alto", effort: "Médio", why: "Score de oportunidade 91/100." },
  { task: "Revisar retenção do vídeo publicado ontem", impact: "Médio", effort: "Baixo", why: "Janela das primeiras 48h." },
];

export const alerts = [
  { level: "positivo", text: "“Fiz meu PC virar servidor” está 63% acima da média nas primeiras 24h." },
  { level: "atencao", text: "CTR médio caiu de 6,5% para 5,8% nos últimos 28 dias." },
  { level: "info", text: "Concorrente Tech Nova começou uma série semanal de comparações." },
  { level: "info", text: "Tendência “agentes de IA locais” entrou em estado Explodindo." },
];

export const nextVideo = {
  title: "Testei 7 agentes de IA que rodam no seu PC (sem internet)",
  potential: 92,
  trend: "Alta",
  competition: "Média",
  audience: "Entusiastas de tecnologia, 25–40, buscando privacidade e autonomia",
  hook: "Desliguei a internet e pedi para a IA organizar minha semana inteira. O resultado me assustou.",
  duration: "9–11 minutos",
  structure: [
    "0:00–0:15 — Resultado surpreendente primeiro (prova visual)",
    "0:15–1:10 — Contexto e promessa clara dos 7 testes",
    "1:10–7:30 — Testes em ordem crescente de impacto, com vereditos rápidos",
    "7:30–9:30 — Comparação final e recomendação por perfil de uso",
    "9:30–10:30 — Próximo passo + gancho para Parte 2",
  ],
  thumbnail: "Rosto em reação forte à esquerda, notebook desconectado à direita, 2 palavras no máximo em alto contraste.",
  publish: "Terça, 19h (BRT) — melhor janela histórica do canal para vídeos longos",
  reasons: [
    "Formato comparação: 2,3× mais inscritos por 1k views no seu canal",
    "Tema em estado Explodindo com competição média",
    "Duração dentro da faixa de melhor retenção (8–12 min)",
  ],
  alternatives: [
    { title: "Substituí 6 apps por 1 automação: valeu a pena?", potential: 84, note: "Aproveita lacuna “produtividade sem apps”." },
    { title: "Setup 2026: o que eu removi da minha mesa", potential: 77, note: "Tendência crescente, produção rápida." },
    { title: "Parte 2 do vídeo mais pedido pelos inscritos", potential: 81, note: "Demanda explícita em 38% dos comentários." },
  ],
};

export const catalog = [
  { title: "Como organizei minha vida com 3 apps", views: "412k", verdict: "Repetir", note: "Evergreen: 61% das views vieram de busca." },
  { title: "Notebook barato vale a pena?", views: "188k", verdict: "Atualizar", note: "Dados desatualizados; refazer com modelos de 2026." },
  { title: "Meu método de estudo", views: "96k", verdict: "Transformar", note: "Alto potencial de virar série de Shorts." },
  { title: "Reagi a setups estranhos", views: "34k", verdict: "Abandonar", note: "Fora do posicionamento e baixa conversão." },
  { title: "IA no dia a dia: 5 usos reais", views: "127k", verdict: "Explorar", note: "Subestimado: CTR 8,2% com pouca distribuição." },
];
