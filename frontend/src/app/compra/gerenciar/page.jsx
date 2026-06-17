// Tela de Gerenciamento de Compras (Visualização, Atualização e Exclusão)
"use client";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import LoadingGerenciar from "@/components/LoadingGerenciar";
import { useGerenciarCompra } from "@/hooks/compra/useGerenciarCompra";
import {
  ArrowLeft,
  Plus,
  Search,
  SlidersHorizontal,
  Loader2,
  AlertTriangle,
  CheckCircle,
  Eye,
  Pencil,
  XCircle,
} from "lucide-react";

export default function GerenciarCompras() {
  const {
    loading,
    setBusca,
    filtrosAbertos,
    setFiltrosAbertos,
    statusCompra,
    setStatusCompra,
    modalCancelar,
    setModalCancelar,
    modalSucesso,
    setModalSucesso,
    isCanceling,
    compraSelecionada,
    setCompraSelecionada,
    filtroRef,
    comprasFiltradas,
    handleCancelar,
    formatarPreco,
    formatarDataPura,
    formatarData,
    dataEntregaFiltro,
    setDataEntregaFiltro,
    dataCompraFiltro,
    setDataCompraFiltro,
  } = useGerenciarCompra();

  return (
    <>
      <Navbar />
      <main className="p-8 px-55 min-h-screen bg-[#f4f6fb]">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="p-1.5 hover:bg-gray-200 rounded-full transition-all"
            >
              <ArrowLeft className="w-5 h-5 text-gray-500" />
            </Link>
            <div>
              <h1 className="text-lg font-bold text-gray-800 leading-tight">
                Compras
              </h1>
              <p className="text-xs text-gray-400">
                Gerencie as compras realizadas
              </p>
            </div>
          </div>
          <Link
            href="/compra/cadastrar"
            className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-5 py-2.5 rounded-lg font-semibold shadow-md transition-all text-sm"
          >
            <Plus className="w-4 h-4" /> Cadastrar Compra
          </Link>
        </div>

        {/* Busca + Data + Filtros */}
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Buscar por ID, fornecedor ou produto..."
              className="w-full pl-9 pr-4 py-2 border border-gray-200 text-gray-800 rounded-lg bg-white text-sm focus:ring-2 focus:ring-blue-500 outline-none shadow-sm placeholder:text-gray-400"
              onChange={(e) => setBusca(e.target.value)}
            />
          </div>
          <button
            onClick={() => setFiltrosAbertos(!filtrosAbertos)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
              filtrosAbertos
                ? "bg-blue-50 border-blue-300 text-blue-600"
                : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" /> Filtros
          </button>
        </div>

        {/* Painel de Filtros */}
        {filtrosAbertos && (
          <div
            ref={filtroRef}
            className="bg-white border border-gray-100 rounded-xl p-5 mb-6 shadow-sm"
          >
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1.5 block">
                  Status Compra
                </label>
                <select
                  value={statusCompra}
                  onChange={(e) => setStatusCompra(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="TODOS">Todos</option>
                  <option value="EFETUADA">Ativa</option>
                  <option value="CANCELADA">Cancelada</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1.5 block">
                  Data da Compra
                </label>
                <input
                  type="date"
                  value={dataCompraFiltro}
                  onChange={(e) => setDataCompraFiltro(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1.5 block">
                  Prazo de Entrega
                </label>
                <input
                  type="date"
                  value={dataEntregaFiltro}
                  onChange={(e) => setDataEntregaFiltro(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* Tabela */}
        {loading ? (
          <LoadingGerenciar />
        ) : (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr className="text-xs font-semibold text-gray-500">
                  <th className="px-6 py-4">ID Compra</th>
                  <th className="px-6 py-4">Fornecedor</th>
                  <th className="px-6 py-4">Valor Total</th>
                  <th className="px-6 py-4">Prazo de Entrega</th>
                  <th className="px-6 py-4">Status Compra</th>
                  <th className="px-6 py-4">Data e Hora</th>
                  <th className="px-6 py-4 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {comprasFiltradas.map((c) => (
                  <tr
                    key={c.id_compra}
                    className={`transition-colors text-sm text-gray-700 ${
                      c.status_compra === "CANCELADA"
                        ? "bg-red-100/80 text-red-900/70 saturate-60"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    <td className="px-6 py-4 font-mono font-semibold text-gray-800">
                      {c.id_compra}
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-800">
                        {c.fornecedor?.razao_social || "-"}
                      </p>
                      <p className="text-xs text-gray-400">
                        ID: {c.fornecedor?.id_fornecedor || "-"}
                      </p>
                    </td>
                    <td className="px-6 py-4 font-semibold text-green-600">
                      {formatarPreco(c.valor_total || 0)}
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {c.prazo_entrega
                        ? formatarDataPura(c.prazo_entrega)
                        : "-"}
                    </td>

                    {/* Status Compra */}
                    <td className="px-6 py-4">
                      <span
                        className="inline-flex items-center justify-center px-3 py-1.5 rounded-full border text-[11px] font-semibold"
                        style={
                          c.status_compra === "CANCELADA"
                            ? {
                                backgroundColor: "#fef2f2",
                                color: "#dc2626",
                                borderColor: "#fca5a5",
                              }
                            : {
                                backgroundColor: "#f0fdf4",
                                color: "#16a34a",
                                borderColor: "#bbf7d0",
                              }
                        }
                      >
                        {c.status_compra === "CANCELADA"
                          ? "Cancelada"
                          : "Ativa"}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-gray-500">
                      {formatarData(c.data_hora)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center gap-2">
                        <Link
                          href={`/compra/visualizar/${c.id_compra}`}
                          className="inline-flex items-center justify-center p-1.5 rounded-md transition-colors text-green-500 icon-btn-green"
                          title="Ver detalhes"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>

                        {c.status_compra !== "CANCELADA" && (
                          <Link
                            href={`/compra/atualizar/${c.id_compra}`}
                            className="inline-flex items-center justify-center p-1.5 rounded-md transition-colors text-blue-500 icon-btn-blue"
                            title="Atualizar compra"
                          >
                            <Pencil className="w-4 h-4" />
                          </Link>
                        )}

                        {c.status_compra !== "CANCELADA" && (
                          <button
                            onClick={() => {
                              setCompraSelecionada(c);
                              setModalCancelar(true);
                            }}
                            className="inline-flex items-center justify-center p-1.5 rounded-md transition-colors text-red-500 icon-btn-red"
                            title="Cancelar compra"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {comprasFiltradas.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-8">
                Nenhuma compra encontrada.
              </p>
            )}
          </div>
        )}
      </main>

      {/* Modal Confirmar Cancelamento */}
      {modalCancelar && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-sm text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle className="w-9 h-9 text-red-500" />
              </div>
            </div>
            <h2 className="text-lg font-bold text-gray-800 mb-2">
              Cancelar Compra
            </h2>
            <p className="text-sm text-gray-500 mb-1">
              Tem certeza de que deseja cancelar a compra{" "}
              <span className="font-semibold text-gray-800">
                {compraSelecionada?.id_compra}
              </span>
              ?
            </p>
            <p className="text-xs text-gray-400 mb-6">
              O estoque será estornado automaticamente.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setModalCancelar(false)}
                className="flex-1 py-2.5 rounded-lg border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-all"
              >
                Voltar
              </button>
              <button
                onClick={handleCancelar}
                disabled={isCanceling}
                className={`flex-1 flex items-center justify-center gap-2 text-white py-2.5 rounded-lg font-semibold text-sm transition-all
                  ${isCanceling ? "bg-red-400 cursor-not-allowed" : "bg-red-500 hover:bg-red-600"}`}
              >
                {isCanceling ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Cancelando...
                  </>
                ) : (
                  "Confirmar"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Sucesso */}
      {modalSucesso && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-sm text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="w-9 h-9 text-green-500" />
              </div>
            </div>
            <h2 className="text-lg font-bold text-gray-800 mb-1">
              Compra Cancelada!
            </h2>
            <p className="text-xs text-gray-400 mb-6">
              O estoque foi estornado com sucesso.
            </p>
            <button
              onClick={() => setModalSucesso(false)}
              className="w-full py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold text-sm transition-all"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </>
  );
}
