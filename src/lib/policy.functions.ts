import { createServerFn } from "@tanstack/react-start";
import { streamText } from "ai";
import { createLovableAiGatewayProvider } from "@/lib/ai-gateway.server";

type Input = { question: string; context?: string };

const SYSTEM = `Você é o módulo Policy Intelligence do Órbita, especialista nas políticas públicas do YouTube (Diretrizes da Comunidade, monetização/conteúdo adequado a anunciantes, direitos autorais, spam, miniaturas, títulos, conteúdo infantil, Shorts, lives).

Regras absolutas:
- Nunca ensine a burlar, enganar ou escapar de enforcement. Ajude a interpretar o que é permitido e a usar toda a liberdade criativa DENTRO das regras.
- Classifique o risco em uma destas faixas na PRIMEIRA linha, exatamente assim: "RISCO: VERDE" | "RISCO: AMARELO" | "RISCO: LARANJA" | "RISCO: VERMELHO".
- Depois explique em markdown curto: **Por quê**, **O que ajustar**, **Como manter a ideia original**, **Confiança** (alta/média/hipótese).
- Sempre termine com uma linha: "Base: políticas públicas do YouTube · verificado por IA em <data de hoje> · não substitui a decisão oficial do YouTube."
- Responda em português do Brasil, direto ao ponto.`;

export const reviewPolicy = createServerFn({ method: "POST" })
  .inputValidator((input: Input) => {
    if (!input?.question?.trim()) throw new Error("Pergunta obrigatória");
    return { question: input.question.slice(0, 4000), context: (input.context ?? "").slice(0, 4000) };
  })
  .handler(async ({ data }) => {
    const key = process.env["LOVABLE_API_KEY"];
    if (!key) throw new Error("MISSING_KEY");

    const gateway = createLovableAiGatewayProvider(key);
    const result = streamText({
      model: gateway("google/gemini-3.7-flash"),
      system: data.context ? `${SYSTEM}\n\nContexto do criador:\n${data.context}` : SYSTEM,
      prompt: data.question,
    });

    const text = await result.text;
    const match = /RISCO:\s*(VERDE|AMARELO|LARANJA|VERMELHO)/i.exec(text);
    return {
      level: (match?.[1]?.toUpperCase() ?? "AMARELO") as
        | "VERDE"
        | "AMARELO"
        | "LARANJA"
        | "VERMELHO",
      text,
    };
  });
