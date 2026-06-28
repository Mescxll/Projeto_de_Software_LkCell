"use client";

import {
  ArrowDown,
  ArrowUp,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const TIPO_CONFIG = {
  ENTRADA: {
    label: "Entrada",
    icone: ArrowUp,
    cor: "text-green-700",
    bg: "bg-green-700/10",
  },
  SAIDA: {
    label: "Saída",
    icone: ArrowDown,
    cor: "text-red-600",
    bg: "bg-red-600/10",
  },
  AJUSTE: {
    label: "Ajuste",
    icone: SlidersHorizontal,
    cor: "text-gray-500",
    bg: "bg-gray-500/10",
  },
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

function calcularSinal(registro) {
  if (registro.tipo_movimento === "SAIDA") return "-";
  if (registro.tipo_movimento === "ENTRADA") return "+";
  if (registro.observacao?.startsWith("Transferência para")) return "+";
  if (registro.observacao?.startsWith("Transferência de")) return "-";
  return "+";
}

export default function MovimentacoesTabela({
  movimentacoes,
  paginacao,
  loading,
  erroMsg,
  filtroTipo,
  onFiltroTipoChange,
  filtroDataInicio,
  filtroDataFim,
  onFiltroDataChange,
  onPaginaChange,
}) {
  const chips = [
    { valor: null, label: "Todos" },
    { valor: "ENTRADA", label: "Entrada" },
    { valor: "SAIDA", label: "Saída" },
    { valor: "AJUSTE", label: "Ajuste" },
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex gap-1.5">
          {chips.map((chip) => (
            <button
              key={chip.label}
              onClick={() => onFiltroTipoChange(chip.valor)}
              className={
                "text-xs px-3 py-1.5 rounded-full font-medium transition " +
                (filtroTipo === chip.valor
                  ? "bg-gray-100 text-gray-800"
                  : "text-gray-400 hover:bg-gray-50")
              }
            >
              {chip.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <input
            type="date"
            value={filtroDataInicio}
            onChange={(e) => onFiltroDataChange(e.target.value, filtroDataFim)}
            className="text-sm border border-gray-200 rounded-lg px-2.5 py-1.5 text-gray-600 outline-none focus:border-blue-400"
          />
          <span className="text-gray-400 text-sm">até</span>
          <input
            type="date"
            value={filtroDataFim}
            onChange={(e) =>
              onFiltroDataChange(filtroDataInicio, e.target.value)
            }
            className="text-sm border border-gray-200 rounded-lg px-2.5 py-1.5 text-gray-600 outline-none focus:border-blue-400"
          />
        </div>
      </div>

      {loading && (
        <p className="text-sm text-gray-400 py-6 text-center">
          Carregando movimentações...
        </p>
      )}

      {!loading && erroMsg && (
        <p className="text-sm text-red-500 py-6 text-center">{erroMsg}</p>
      )}

      {!loading && !erroMsg && movimentacoes.length === 0 && (
        <p className="text-sm text-gray-400 py-6 text-center">
          Nenhuma movimentação encontrada para os filtros selecionados.
        </p>
      )}

      {!loading && !erroMsg && movimentacoes.length > 0 && (
        <>
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="text-left text-gray-400 border-b border-gray-100">
                <th className="py-2 px-2 font-medium">Tipo</th>
                <th className="py-2 px-2 font-medium">Produto</th>
                <th className="py-2 px-2 font-medium">Origem</th>
                <th className="py-2 px-2 font-medium">Localização</th>
                <th className="py-2 px-2 font-medium text-right">Quantidade</th>
                <th className="py-2 px-2 font-medium text-right">
                  Quantidade após
                </th>
                <th className="py-2 px-2 font-medium">Data</th>
              </tr>
            </thead>
            <tbody>
              {movimentacoes.map((registro) => {
                const config =
                  TIPO_CONFIG[registro.tipo_movimento] ?? TIPO_CONFIG.AJUSTE;
                const Icone = config.icone;
                const sinal = calcularSinal(registro);

                return (
                  <tr
                    key={registro.id_estoque}
                    className="border-b border-gray-50"
                  >
                    <td className="py-2.5 px-2">
                      <span
                        className={
                          "inline-flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-full " +
                          config.cor +
                          " " +
                          config.bg
                        }
                      >
                        <Icone className="w-3 h-3" strokeWidth={2.5} />
                        {config.label}
                      </span>
                    </td>
                    <td className="py-2.5 px-2 text-gray-800 font-medium">
                      {registro.produto?.nome ||
                        registro.produto?.codigo_produto}
                    </td>
                    <td className="py-2.5 px-2 text-gray-500">
                      {descricaoOrigem(registro)}
                    </td>
                    <td className="py-2.5 px-2 text-gray-500">
                      {registro.localizacao?.localizacao ?? "Sem localização"}
                    </td>
                    <td
                      className={
                        "py-2.5 px-2 text-right font-semibold " + config.cor
                      }
                    >
                      {registro.quantidade === 0
                        ? "+0"
                        : sinal + registro.quantidade}
                    </td>
                    <td className="py-2.5 px-2 text-right text-gray-700">
                      {registro.estoque_atual}
                    </td>
                    <td className="py-2.5 px-2 text-gray-400 text-xs">
                      {formatarData(registro.data_hora)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
            <p className="text-xs text-gray-400">
              {paginacao.total} movimentação(ões) · página {paginacao.pagina} de{" "}
              {paginacao.total_paginas}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onPaginaChange(paginacao.pagina - 1)}
                disabled={paginacao.pagina <= 1}
                className="text-gray-500 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => onPaginaChange(paginacao.pagina + 1)}
                disabled={paginacao.pagina >= paginacao.total_paginas}
                className="text-gray-500 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
