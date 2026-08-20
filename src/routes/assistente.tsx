import { createFileRoute, Link } from "@tanstack/react-router";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useEffect, useMemo, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { AppShell } from "@/components/AppShell";
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { Message, MessageContent } from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputTextarea,
  PromptInputFooter,
  PromptInputSubmit,
} from "@/components/ai-elements/prompt-input";
import { Shimmer } from "@/components/ai-elements/shimmer";
import { buildChannelContext, useChannel } from "@/lib/use-channel";

export const Route = createFileRoute("/assistente")({
  head: () => ({
    meta: [
      { title: "Assistente estratégico | Órbita para criadores" },
      {
        name: "description",
        content:
          "Converse com a IA do Órbita sobre o seu canal: ideias, títulos, thumbnails, retenção, SEO e a próxima decisão de conteúdo.",
      },
      { property: "og:title", content: "Assistente estratégico | Órbita" },
      {
        property: "og:description",
        content: "Um estrategista de YouTube disponível 24h, com os dados do seu canal em contexto.",
      },
    ],
  }),
  component: Page,
});

const SUGGESTIONS = [
  "Qual vídeo eu deveria fazer agora?",
  "Analise meus últimos vídeos e diga o que está funcionando",
  "Me dê 5 títulos melhores para o meu vídeo mais recente",
  "Como aumentar meu CTR nas próximas 4 semanas?",
];

function Page() {
  const { snapshot } = useChannel();
  const { dna } = useCreatorDna();
  const channelContext = useMemo(
    () => [buildChannelContext(snapshot), buildDnaContext(dna)].filter(Boolean).join("\n\n"),
    [snapshot, dna],
  );
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const transport = useMemo(
    () => new DefaultChatTransport({ api: "/api/chat", body: { channelContext } }),
    [channelContext],
  );

  const { messages, sendMessage, status, error } = useChat({ transport });
  const busy = status === "submitted" || status === "streaming";

  useEffect(() => {
    if (!busy) textareaRef.current?.focus();
  }, [busy]);

  function send(text: string) {
    if (!text.trim() || busy) return;
    void sendMessage({ text: text.trim() });
    setInput("");
  }

  return (
    <AppShell>
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-accent">Copiloto</p>
          <h1 className="mt-2 text-2xl font-bold sm:text-3xl">Assistente estratégico</h1>
        </div>
        <p className="text-xs text-muted-foreground">
          {snapshot ? (
            <>
              Contexto ativo: <span className="text-accent">{snapshot.title}</span>
            </>
          ) : (
            <>
              Sem canal conectado ·{" "}
              <Link to="/conectar" className="text-accent hover:underline">
                conectar agora
              </Link>
            </>
          )}
        </p>
      </header>

      <div className="panel mt-5 flex h-[65vh] flex-col overflow-hidden">
        <Conversation className="flex-1">
          <ConversationContent className="space-y-4">
            {messages.length === 0 && (
              <div className="py-10 text-center">
                <h2 className="text-lg font-semibold">Pergunte qualquer coisa sobre o seu canal</h2>
                <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
                  Quanto mais contexto (canal conectado, objetivo, nicho), mais específica fica a
                  recomendação.
                </p>
                <div className="mt-5 flex flex-wrap justify-center gap-2">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => send(s)}
                      className="rounded-full border border-border bg-surface-2 px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-accent hover:text-accent"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((m) => {
              const text = m.parts
                .map((p) => (p.type === "text" ? p.text : ""))
                .join("");
              return (
                <Message from={m.role} key={m.id}>
                  <MessageContent className="text-sm">
                    <div className="prose prose-sm max-w-none prose-headings:text-foreground prose-strong:text-foreground prose-li:marker:text-accent text-foreground">
                      <ReactMarkdown>{text}</ReactMarkdown>
                    </div>
                  </MessageContent>
                </Message>
              );
            })}

            {status === "submitted" && (
              <Shimmer className="text-sm">Analisando seu canal...</Shimmer>
            )}
            {error && (
              <p className="text-sm text-primary">
                Não consegui responder agora: {error.message}
              </p>
            )}
          </ConversationContent>
          <ConversationScrollButton />
        </Conversation>

        <div className="border-t border-border p-3">
          <PromptInput
            onSubmit={(_message, event) => {
              event.preventDefault();
              send(input);
            }}
          >
            <PromptInputTextarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ex.: analise meus 5 últimos vídeos e diga qual formato repetir"
            />
            <PromptInputFooter className="justify-end">
              <PromptInputSubmit status={status} disabled={!input.trim() || busy} />
            </PromptInputFooter>
          </PromptInput>
        </div>
      </div>
    </AppShell>
  );
}
