"use client";

import Link from "next/link";
import {
  Search,
  ArrowLeftRight,
  History,
  Settings,
  ChevronDown,
  ChevronRight,
  TriangleAlert,
} from "lucide-react";
import { Fragment } from "react";

const STATUS_CONFIG = {
  normal: { label: "Normal", cor: "text-green-700", bg: "bg-green-700/10" },
  abaixo_minimo: {
    label: "Abaixo do mínimo",
    cor: "text-amber-600",
    bg: "bg-amber-600/10",
  },
  acima_ideal: {
    label: "Acima do ideal",
    cor: "text-amber-600",
    bg: "bg-amber-600/10",
  },
};

function Badge({ status }) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.normal;
  return (
    <span
      className={
        "text-[11px] font-medium px-2.5 py-1 rounded-full " +
        config.cor +
        " " +
        config.bg
      }
    >
      {config.label}
    </span>
  );
}

// Conta quantas localizações estão em cada status problemático.
// Usado para sinalizar no quantidade total quando o total "parece ok"
// mas existe ao menos uma localização individual em alerta —
// já que o status do produto reflete o pior caso, não a soma.
function contarLocalizacoesProblematicas(localizacoes) {
  const abaixoMinimo = localizacoes.filter(
    (l) => l.status === "abaixo_minimo",
  ).length;
  const acimaIdeal = localizacoes.filter(
    (l) => l.status === "acima_ideal",
  ).length;
  return { abaixoMinimo, acimaIdeal };
}

export default function EstoqueTabela({
  produtos,
  loading,
  erroMsg,
  localizacoes,
  busca,
  onBuscaChange,
  filtroLocalizacao,
  onFiltroLocalizacaoChange,
  filtroStatus,
  onFiltroStatusChange,
  expandidos,
  onToggleExpandido,
  onAjustarParametros,
  onVerHistorico,
  onTransferirGeral,
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="relative flex-1 min-w-[220px] max-w-xs">
          <Search className="w-4 h-4 text-gray-400 absolute left-2.5 top-2.5" />
          <input
            value={busca}
            onChange={(e) => onBuscaChange(e.target.value)}
            placeholder="Buscar por produto ou código"
            className="w-full text-sm border border-gray-200 rounded-lg pl-8 pr-3 py-2 outline-none focus:border-blue-400"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={filtroLocalizacao}
            onChange={(e) => onFiltroLocalizacaoChange(e.target.value)}
            className="text-sm border border-gray-200 rounded-lg px-3 py-2 text-gray-600 outline-none focus:border-blue-400"
          >
            <option value="">Todas as localizações</option>
            {localizacoes.map((l) => (
              <option key={l.id_localizacao} value={l.id_localizacao}>
                {l.localizacao}
              </option>
            ))}
          </select>

          <select
            value={filtroStatus ?? ""}
            onChange={(e) => onFiltroStatusChange(e.target.value || null)}
            className="text-sm border border-gray-200 rounded-lg px-3 py-2 text-gray-600 outline-none focus:border-blue-400"
          >
            <option value="">Todos os status</option>
            <option value="abaixo_minimo">Abaixo do mínimo</option>
            <option value="acima_ideal">Acima do ideal</option>
            <option value="normal">Normal</option>
          </select>

          <Link
            href="/estoque/movimentacoes"
            className="flex items-center gap-1.5 bg-white text-gray-600 border border-gray-200 text-sm font-medium rounded-lg px-3.5 py-2 hover:bg-gray-50"
          >
            <History className="w-3.5 h-3.5" />
            Movimentações
          </Link>

          <button
            onClick={onTransferirGeral}
            className="flex items-center gap-1.5 bg-gray-400 text-white text-sm font-medium rounded-lg px-3.5 py-2 hover:bg-gray-500"
          >
            <ArrowLeftRight className="w-3.5 h-3.5" />
            Transferir
          </button>
        </div>
      </div>

      {loading && (
        <p className="text-sm text-gray-400 py-6 text-center">
          Carregando estoque...
        </p>
      )}

      {!loading && erroMsg && (
        <p className="text-sm text-red-500 py-6 text-center">{erroMsg}</p>
      )}

      {!loading && !erroMsg && produtos.length === 0 && (
        <p className="text-sm text-gray-400 py-6 text-center">
          Nenhum produto encontrado para os filtros selecionados.
        </p>
      )}

      {!loading && !erroMsg && produtos.length > 0 && (
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="text-left text-gray-400 border-b border-gray-100">
              <th className="py-2 px-2 font-medium w-8"></th>
              <th className="py-2 px-2 font-medium">Produto</th>
              <th className="py-2 px-2 font-medium">Categoria</th>
              <th className="py-2 px-2 font-medium">Quantidade total</th>
              <th className="w-28 font-medium">Mínimo - Ideal</th>
              <th className="py-2 px-2 font-medium">Status</th>
              <th className="py-2 px-2 font-medium text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {produtos.map((produto) => {
              const expandido = expandidos.has(produto.id_produto);

              return (
                <Fragment key={produto.id_produto}>
                  <tr className="border-b border-gray-50">
                    <td className="py-2.5 px-2">
                      <button
                        onClick={() => onToggleExpandido(produto.id_produto)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        {expandido ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                      </button>
                    </td>
                    <td className="py-2.5 px-2 text-gray-800 font-medium">
                      {produto.nome || produto.codigo_produto}
                    </td>
                    <td className="py-2.5 px-2 text-gray-500">
                      {produto.categoria ?? "—"}
                    </td>
                    <td className="py-2.5 px-2 text-gray-800">
                      {produto.saldo_total}
                      {(() => {
                        const { abaixoMinimo, acimaIdeal } =
                          contarLocalizacoesProblematicas(produto.localizacoes);
                        if (abaixoMinimo === 0 && acimaIdeal === 0) return null;
                        return (
                          <span className="ml-1.5 text-[11px] text-amber-600 font-medium">
                            {abaixoMinimo > 0 && (
                              <>
                                <TriangleAlert
                                  size={13}
                                  className="inline mr-1"
                                />
                                {`${abaixoMinimo} ${abaixoMinimo > 1 ? "locais" : "local"} abaixo${abaixoMinimo > 1 ? "s" : ""} do mínimo`}
                              </>
                            )}

                            {abaixoMinimo > 0 && acimaIdeal > 0 && " · "}

                            {acimaIdeal > 0 && (
                              <>
                                {`${acimaIdeal} ${acimaIdeal > 1 ? "locais" : "local"} acima${acimaIdeal > 1 ? "s" : ""} do ideal`}
                              </>
                            )}
                          </span>
                        );
                      })()}
                    </td>
                    <td className="w-28  py-2.5 px-2 text-gray-500">
                      {produto.estoque_minimo ?? "—"} -{" "}
                      {produto.estoque_ideal ?? "—"}
                    </td>
                    <td className="py-2.5 px-2">
                      <Badge status={produto.status} />
                    </td>
                    <td className="py-2.5 px-2 text-right whitespace-nowrap">
                      <button
                        onClick={() => onVerHistorico(produto)}
                        className="text-gray-400 hover:text-gray-600 mr-3"
                        title="Ver histórico"
                      >
                        <History className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onAjustarParametros(produto)}
                        className="text-gray-400 hover:text-gray-600"
                        title="Ajustar parâmetros"
                      >
                        <Settings className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>

                  {expandido &&
                    produto.localizacoes.map((loc, i) => (
                      <tr
                        key={
                          produto.id_produto + "-" + (loc.id_localizacao ?? i)
                        }
                        className="bg-gray-50/60 border-b border-gray-50"
                      >
                        <td className="py-2 px-2"></td>
                        <td
                          className="py-2 px-2 text-gray-500 text-xs pl-1"
                          colSpan={2}
                        >
                          ↳ {loc.localizacao}
                        </td>
                        <td className="py-2 px-2 text-gray-700 text-xs">
                          {loc.estoque_atual}
                        </td>
                        <td className="py-2 px-2"></td>
                        <td className="py-2 px-2">
                          <Badge status={loc.status} />
                        </td>
                        <td className="py-2 px-2"></td>
                      </tr>
                    ))}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}
