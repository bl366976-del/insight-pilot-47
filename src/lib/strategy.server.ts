import { streamText } from "ai";
import { createLovableAiGatewayProvider } from "@/lib/ai-gateway.server";

export type StrategyPlan = {
  summary: string;
  opportunities: {
    id: string;
    title: string;
    why: string;
    data: string[];
    confidence: "alta" | "média" | "hipótese";
    impact: number;
    effort: "baixo" | "médio" | "alto";
    tag: string;
  }[];
  trends: {
    topic: string;
    status:
      | "Explodindo"
      | "Crescendo"
      | "Estável"
      | "Saturado"
      | "Em queda"
      | "Oportunidade escondida";
    interest: number;
    growth: number;
    competition: number;
    score: number;
    source: string;
    why: string;
  }[];
  nextVideo: {
    title: string;
    potential: number;
    trend: string;
    competition: string;
    audience: string;
    hook: string;
    duration: string;
    structure: string[];
    thumbnail: string;
    publish: string;
    reasons: string[];
    alternatives: { title: string; potential: number; note: string }[];
  };
  catalog: { title: string; views: string; verdict: string; note: string }[];
  tasks: { task: string; impact: string; effort: string; why: string }[];
  alerts: { level: "positivo" | "atencao" | "info"; text: string }[];
};

const SCHEMA = `{
  "summary": "2 frases sobre o momento do canal",
  "opportunities": [{ "id": "op-1", "title": "", "why": "", "data": ["dado concreto com número do canal"], "confidence": "alta|média|hipótese", "impact": 0, "effort": "baixo|médio|alto", "tag": "Formato|Retenção|Tendência|Audiência|SEO" }],
  "trends": [{ "topic": "", "status": "Explodindo|Crescendo|Estável|Saturado|Em queda|Oportunidade escondida", "interest": 0, "growth": 0, "competition": 0, "score": 0, "source": "", "why": "" }],
  "nextVideo": { "title": "", "potential": 0, "trend": "", "competition": "", "audience": "", "hook": "", "duration": "", "structure": ["0:00–0:15 — ..."], "thumbnail": "", "publish": "", "reasons": [""], "alternatives": [{ "title": "", "potential": 0, "note": "" }] },
  "catalog": [{ "title": "título real de um vídeo do canal", "views": "12.3k", "verdict": "Repetir|Atualizar|Transformar|Explorar|Abandonar", "note": "" }],
  "tasks": [{ "task": "", "impact": "Alto|Médio|Baixo", "effort": "Alto|Médio|Baixo", "why": "" }],
  "alerts": [{ "level": "positivo|atencao|info", "text": "" }]
}`;

const SYSTEM = `Você é o motor de estratégia do Órbita, plataforma de inteligência para criadores de YouTube.
Você recebe dados REAIS do canal (vídeos, views, likes, duração, frequência) e o Creator DNA.
Gere um plano estratégico específico para ESTE canal.

Regras:
- Cite números reais do canal nos campos "data", "why" e "reasons".
- ANTI-GENERIC: nada que qualquer canal poderia publicar. Use os temas e formatos reais do criador.
- 4 a 6 oportunidades, 6 tendências, 5 itens de catálogo (usando títulos reais dos vídeos enviados), 5 tarefas, 3 a 5 alertas.
- Tendências: baseie-se no nicho real do canal; scores de 0 a 100, growth pode ser negativo.
- Nunca prometa viralização. Projeções são estimativas.
- Português do Brasil.
- Responda APENAS com JSON válido nesse formato, sem markdown, sem comentários:
${SCHEMA}`;

export async function generateStrategyPlan(context: string, apiKey: string): Promise<StrategyPlan> {
  const gateway = createLovableAiGatewayProvider(apiKey);
  const result = streamText({
    model: gateway("google/gemini-3.7-flash"),
    system: SYSTEM,
    prompt: context,
  });
  const raw = await result.text;
  const json = raw.slice(raw.indexOf("{"), raw.lastIndexOf("}") + 1);
  try {
    return JSON.parse(json) as StrategyPlan;
  } catch {
    throw new Error("A IA devolveu um formato inesperado. Tente gerar novamente.");
  }
}
