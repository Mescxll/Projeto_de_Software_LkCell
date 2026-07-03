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
  MapPin,
} from "lucide-react";
import { Fragment } from "react";

const STATUS_CONFIG = {
  normal: {
    label: "Normal",
    cor: "text-green-700",
    bg: "bg-green-50",
    border: "border-green-200",
  },
  abaixo_minimo: {
    label: "Abaixo do mínimo",
    cor: "text-amber-700",
    bg: "bg-amber-50",
    border: "border-amber-200",
  },
  acima_ideal: {
    label: "Acima do ideal",
    cor: "text-blue-700",
    bg: "bg-blue-50",
    border: "border-blue-200",
  },
};

function Badge({ status }) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.normal;
  return (
    <span
      className={`inline-flex items-center text-[11px] font-semibold px-2.5 py-1 rounded-full border ${config.cor} ${config.bg} ${config.border}`}
    >
      {config.label}
    </span>
  );
}

function AlertasLocalizacao({ localizacoes }) {
  const abaixoMinimo = localizacoes.filter(
    (l) => l.status === "abaixo_minimo",
  ).length;
  const acimaIdeal = localizacoes.filter(
    (l) => l.status === "acima_ideal",
  ).length;

  if (abaixoMinimo === 0 && acimaIdeal === 0) return null;

  return (
    <div className="flex items-center gap-2 mt-1">
      {abaixoMinimo > 0 && (
        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-600">
          <TriangleAlert className="w-3 h-3" />
          {abaixoMinimo} {abaixoMinimo > 1 ? "locais" : "local"} abaixo do
          mínimo
        </span>
      )}
      {abaixoMinimo > 0 && acimaIdeal > 0 && (
        <span className="text-gray-300 text-xs">·</span>
      )}
      {acimaIdeal > 0 && (
        <span className="text-[11px] font-medium text-blue-600">
          {acimaIdeal} {acimaIdeal > 1 ? "locais" : "local"} acima do ideal
        </span>
      )}
    </div>
  );
}

function CelulaParametros({ minimo, ideal }) {
  return (
    <div className="flex items-center justify-center gap-1.5 text-xs text-gray-500">
      <span className="font-medium text-gray-700">{minimo ?? "—"}</span>
      <span className="text-gray-300">/</span>
      <span className="font-medium text-gray-700">{ideal ?? "—"}</span>
    </div>
  );
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
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      {/* ── Barra de ferramentas ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 border-b border-gray-100">
        <div className="relative flex-1 min-w-[220px] max-w-xs">
          <Search className="w-4 h-4 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            value={busca}
            onChange={(e) => onBuscaChange(e.target.value)}
            placeholder="Buscar produto ou código..."
            className="w-full text-sm text-gray-800 border border-gray-200 rounded-lg pl-9 pr-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={filtroLocalizacao}
            onChange={(e) => onFiltroLocalizacaoChange(e.target.value)}
            className="text-sm border border-gray-200 rounded-lg px-3 py-2 text-gray-600 outline-none focus:ring-2 focus:ring-blue-500"
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
            className="text-sm border border-gray-200 rounded-lg px-3 py-2 text-gray-600 outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos os status</option>
            <option value="abaixo_minimo">Abaixo do mínimo</option>
            <option value="acima_ideal">Acima do ideal</option>
            <option value="normal">Normal</option>
          </select>

          <Link
            href="/estoque/movimentacoes"
            className="flex items-center gap-1.5 bg-white text-gray-600 border border-gray-200 text-sm font-medium rounded-lg px-3.5 py-2 hover:bg-gray-50 transition-colors"
          >
            <History className="w-3.5 h-3.5" />
            Movimentações
          </Link>

          <button
            onClick={onTransferirGeral}
            className="flex items-center gap-1.5 bg-gray-500 hover:bg-gray-600 text-white text-sm font-medium rounded-lg px-3.5 py-2 transition-colors"
          >
            <ArrowLeftRight className="w-3.5 h-3.5" />
            Transferir
          </button>
        </div>
      </div>

      {/* ── Estados ── */}
      {loading && (
        <p className="text-sm text-gray-400 py-10 text-center">
          Carregando estoque...
        </p>
      )}
      {!loading && erroMsg && (
        <p className="text-sm text-red-500 py-10 text-center">{erroMsg}</p>
      )}
      {!loading && !erroMsg && produtos.length === 0 && (
        <p className="text-sm text-gray-400 py-10 text-center">
          Nenhum produto encontrado para os filtros selecionados.
        </p>
      )}

      {/* ── Tabela ── */}
      {!loading && !erroMsg && produtos.length > 0 && (
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide border-b border-gray-100 bg-gray-50">
              <th className="py-3 px-3 w-8" />
              <th className="py-3 px-3">Produto</th>
              <th className="py-3 px-3">Categoria</th>
              <th className="py-3 px-3 text-right">Qtd. Total</th>
              <th className="py-3 px-3 text-center">Mín. / Ideal</th>
              <th className="py-3 px-3">Status</th>
              <th className="py-3 px-3 text-right">Ações</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-50">
            {produtos.map((produto) => {
              const expandido = expandidos.has(produto.id_produto);

              return (
                <Fragment key={produto.id_produto}>
                  {/* ── Linha do produto ── */}
                  <tr
                    className={`hover:bg-gray-50 transition-colors ${expandido ? "bg-blue-50/30" : ""}`}
                  >
                    <td className="py-3 px-3">
                      <button
                        onClick={() => onToggleExpandido(produto.id_produto)}
                        className="p-1 rounded text-gray-400 hover:text-blue-500 hover:bg-blue-50 transition-colors"
                        title={
                          expandido
                            ? "Recolher localizações"
                            : "Expandir localizações"
                        }
                      >
                        {expandido ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                      </button>
                    </td>

                    <td className="py-3 px-3">
                      <p className="font-semibold text-gray-800">
                        {produto.descricao || produto.codigo_produto}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5 font-mono">
                        {produto.codigo_produto}
                      </p>
                      {/* Alertas ficam na célula do produto — evita
                          alturas inconsistentes nas outras colunas */}
                      <AlertasLocalizacao localizacoes={produto.localizacoes} />
                    </td>

                    <td className="py-3 px-3 text-gray-500 align-top">
                      {produto.categoria ?? "—"}
                    </td>

                    <td className="py-3 px-3 text-right align-top">
                      <span className="font-semibold text-gray-800 text-base">
                        {produto.quantidade_total}
                      </span>
                    </td>

                    <td className="py-3 px-3 text-center align-top">
                      <CelulaParametros
                        minimo={produto.estoque_minimo}
                        ideal={produto.estoque_ideal}
                      />
                    </td>

                    <td className="py-3 px-3 align-top">
                      <Badge status={produto.status} />
                    </td>

                    <td className="py-3 px-3 text-right align-top">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => onVerHistorico(produto)}
                          className="p-1.5 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                          title="Ver histórico"
                        >
                          <History className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onAjustarParametros(produto)}
                          className="p-1.5 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                          title="Ajustar parâmetros"
                        >
                          <Settings className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>

                  {/* ── Linhas de localização (expandido) ── */}
                  {expandido &&
                    produto.localizacoes.map((loc, i) => (
                      <tr
                        key={`${produto.id_produto}-${loc.id_localizacao ?? i}`}
                        className="bg-blue-50/20 border-b border-blue-50"
                      >
                        <td className="py-2 px-3" />

                        <td className="py-2 px-3" colSpan={2}>
                          <span className="inline-flex items-center gap-1.5 text-xs text-gray-500">
                            <MapPin className="w-3 h-3 text-blue-400 flex-shrink-0" />
                            {loc.localizacao}
                          </span>
                        </td>

                        <td className="py-2 px-3 text-right">
                          <span className="text-sm font-semibold text-gray-700">
                            {loc.estoque_atual}
                          </span>
                        </td>

                        <td className="py-2 px-3" />

                        <td className="py-2 px-3">
                          <Badge status={loc.status} />
                        </td>

                        <td className="py-2 px-3" />
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
