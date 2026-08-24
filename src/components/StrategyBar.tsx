import { Link } from "@tanstack/react-router";
import { Loader2, RefreshCw, Youtube } from "lucide-react";
import { Button } from "@/components/ui/button";

export function StrategyBar({
  connected,
  loading,
  error,
  createdAt,
  onGenerate,
}: {
  connected: boolean;
  loading: boolean;
  error: string | null;
  createdAt: number | null;
  onGenerate: () => void;
}) {
  return (
    <div className="panel mt-6 flex flex-wrap items-center gap-3 p-4">
      <div className="min-w-0 flex-1 text-sm">
        {!connected ? (
          <p className="text-muted-foreground">
            Você está vendo um exemplo. Conecte seu canal para gerar tudo com os seus dados reais.
          </p>
        ) : loading ? (
          <p className="text-muted-foreground">
            Analisando seus vídeos e montando o plano estratégico…
          </p>
        ) : error ? (
          <p className="text-primary">{error}</p>
        ) : createdAt ? (
          <p className="text-muted-foreground">
            Plano gerado com dados reais do seu canal em{" "}
            {new Date(createdAt).toLocaleString("pt-BR")}.
          </p>
        ) : (
          <p className="text-muted-foreground">Gere o plano estratégico do seu canal.</p>
        )}
      </div>
      {connected ? (
        <Button size="sm" variant="secondary" onClick={onGenerate} disabled={loading} className="gap-2">
          {loading ? <Loader2 className="size-3.5 animate-spin" /> : <RefreshCw className="size-3.5" />}
          {loading ? "Gerando…" : "Atualizar análise"}
        </Button>
      ) : (
        <Button asChild size="sm" className="gap-2">
          <Link to="/conectar">
            <Youtube className="size-3.5" /> Conectar canal
          </Link>
        </Button>
      )}
    </div>
  );
}
