"use client";

import { X, ArrowDown, ArrowUp, SlidersHorizontal } from "lucide-react";
import { useHistoricoEstoque } from "@/hooks/estoque/useHistoricoEstoque";

const TIPO_CONFIG = {
  ENTRADA: { label: "Entrada", icone: ArrowUp, cor: "text-green-700", bg: "bg-green-700/10" },
  SAIDA: { label: "Saída", icone: ArrowDown, cor: "text-red-600", bg: "bg-red-600/10" },
  AJUSTE: { label: "Ajuste", icone: SlidersHorizontal, cor: "text-gray-500", bg: "bg-gray-500/10" },
};

function formatarData(dataIso) {
  return new Date(dataIso).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function descricaoOrigem(registro) {
  if (registro.fk_venda_id) return "Venda #" + registro.fk_venda_id;
  if (registro.fk_compra_id) return "Compra #" + registro.fk_compra_id;
  if (registro.tipo_movimento === "AJUSTE" && registro.quantidade === 0)
    return "Ajuste de parâmetros";
  return registro.observacao || "Ajuste manual";
}

export default function PainelHistorico({ produto, onClose }) {
  const { historico, loading, erroMsg, filtroTipo, setFiltroTipo } =
    useHistoricoEstoque(produto);

  if (!produto) return null;

  const chips = [
    { valor: null, label: "Todos" },
    { valor: "ENTRADA", label: "Entrada" },
    { valor: "SAIDA", label: "Saída" },
    { valor: "AJUSTE", label: "Ajuste" },
  ];

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-end z-50">
      <div className="bg-white h-full w-full max-w-md shadow-xl overflow-hidden flex flex-col">
        <div className="h-1 bg-blue-600/80" />

        <div className="p-5 border-b border-gray-100">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-gray-800 font-semibold text-base">
              {produto.nome || produto.codigo_produto}
            </h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="w-4.5 h-4.5" />
            </button>
          </div>
          <p className="text-xs text-gray-400 mb-3">
            Saldo total atual:{" "}
            <span className="text-gray-800 font-semibold">
              {produto.estoque_atual ?? "—"} un.
            </span>
          </p>

          <div className="flex gap-1.5">
            {chips.map((chip) => (
              <button
                key={chip.label}
                onClick={() => setFiltroTipo(chip.valor)}
                className={
                  "text-xs px-3 py-1 rounded-full font-medium transition " +
                  (filtroTipo === chip.valor
                    ? "bg-gray-100 text-gray-800"
                    : "text-gray-400 hover:bg-gray-50")
                }
              >
                {chip.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading && (
            <p className="text-sm text-gray-400 p-5">Carregando histórico...</p>
          )}

          {!loading && erroMsg && (
            <p className="text-sm text-red-500 p-5">{erroMsg}</p>
          )}

          {!loading && !erroMsg && historico.length === 0 && (
            <p className="text-sm text-gray-400 p-5">
              Nenhum movimento encontrado.
            </p>
          )}

          {!loading &&
            !erroMsg &&
            historico.map((registro) => {
              const config = TIPO_CONFIG[registro.tipo_movimento] ?? TIPO_CONFIG.AJUSTE;
              const Icone = config.icone;
              const sinal = registro.tipo_movimento === "SAIDA" ? "-" : "+";

              return (
                <div
                  key={registro.id_estoque}
                  className="flex items-start gap-3 px-5 py-3 border-t border-gray-50"
                >
                  <div
                    className={
                      "w-7 h-7 rounded-md flex items-center justify-center shrink-0 mt-0.5 " +
                      config.bg
                    }
                  >
                    <Icone className={"w-3.5 h-3.5 " + config.cor} strokeWidth={2.5} />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <p className="text-sm text-gray-800 font-medium">
                        {config.label} — {descricaoOrigem(registro)}
                      </p>
                      <p className={"text-sm font-semibold " + config.cor}>
                        {registro.quantidade === 0
                          ? "+0"
                          : sinal + registro.quantidade}
                      </p>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {registro.localizacao?.localizacao ?? "Sem localização"} ·{" "}
                      {formatarData(registro.data_hora)} · saldo:{" "}
                      {registro.estoque_atual}
                    </p>
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}