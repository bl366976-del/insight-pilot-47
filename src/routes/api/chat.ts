import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { createLovableAiGatewayProvider } from "@/lib/ai-gateway.server";

type ChatRequestBody = { messages?: unknown; channelContext?: unknown };

const BASE_PROMPT = `Você é o Órbita, um copiloto estratégico de YouTube em português do Brasil.

Você atua como estrategista, analista de dados, especialista em SEO, tendências, thumbnails, roteiro, branding, audiência e monetização.

Regras:
- Seja data-driven: quando houver dados do canal, cite números concretos ao recomendar.
- Nunca dê conselhos genéricos do tipo "poste mais". Dê a próxima ação específica.
- Em recomendações importantes explique: motivo, dados usados, nível de confiança, benefícios, riscos, dificuldade e prioridade.
- Apresente projeções como estimativas, nunca promessas. Nunca prometa viralização, número de inscritos, nem incentive spam, compra de inscritos ou manipulação.
- Adapte a profundidade ao estágio do canal (iniciante explica termos como CTR, retenção, RPM; profissional vai direto ao ponto).
- Respostas curtas e acionáveis, em markdown, com listas objetivas.`;

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { messages, channelContext } = (await request.json()) as ChatRequestBody;
        if (!Array.isArray(messages)) {
          return new Response("Messages are required", { status: 400 });
        }

        const key = process.env["LOVABLE_API_KEY"];
        if (!key) return new Response("Missing LOVABLE_API_KEY", { status: 500 });

        const gateway = createLovableAiGatewayProvider(key);

        const system =
          typeof channelContext === "string" && channelContext.trim().length > 0
            ? `${BASE_PROMPT}\n\nContexto do canal conectado (dados reais importados do YouTube):\n${channelContext.slice(0, 8000)}`
            : `${BASE_PROMPT}\n\nO usuário ainda não conectou um canal. Peça o essencial (nicho, tamanho, objetivo) antes de recomendar.`;

        try {
          const result = streamText({
            model: gateway("google/gemini-3.7-flash"),
            system,
            messages: await convertToModelMessages(messages as UIMessage[]),
          });

          return result.toUIMessageStreamResponse({
            originalMessages: messages as UIMessage[],
          });
        } catch (error) {
          const message = error instanceof Error ? error.message : "Erro desconhecido";
          console.error("chat error", message);
          return new Response(message, { status: 500 });
        }
      },
    },
  },
});
