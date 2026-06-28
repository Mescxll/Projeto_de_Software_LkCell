// app/catalogo/modelo/gerenciar/page.jsx
"use client";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import LoadingGerenciar from "@/components/LoadingGerenciar";
import { useGerenciarModelo } from "@/hooks/catalogo/modelo/useGerenciarModelo";
import {
  ArrowLeft,
  Plus,
  Search,
  SlidersHorizontal,
  Pencil,
  Trash2,
  Loader2,
  AlertTriangle,
  CheckCircle,
  Eye,
  Smartphone,
  Tag,
} from "lucide-react";

export default function GerenciarModelos() {
  const {
    loading,
    modelosFiltrados,
    marcas,
    busca,
    setBusca,
    marcaFiltro,
    setMarcaFiltro,
    filtrosAbertos,
    setFiltrosAbertos,
    modalDeletar,
    setModalDeletar,
    modalSucesso,
    setModalSucesso,
    modalErro,
    setModalErro,
    erroMsg,
    isDeleting,
    modeloSelecionado,
    setModeloSelecionado,
    modalDetalhes,
    setModalDetalhes,
    modeloDetalhes,
    loadingDetalhes,
    handleVisualizarDetalhes,
    handleDeletar,
  } = useGerenciarModelo();

  const produtosDetalhes = modeloDetalhes?.produtos ?? [];

  return (
    <>
      <Navbar />
      <main className="p-8 px-55 min-h-screen bg-[#f4f6fb]">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Link
              href="/catalogo"
              className="p-1.5 hover:bg-gray-200 rounded-full transition-all"
            >
              <ArrowLeft className="w-5 h-5 text-gray-500" />
            </Link>
            <div>
              <h1 className="text-lg font-bold text-gray-800 leading-tight">
                Modelos
              </h1>
              <p className="text-xs text-gray-400">
                Gerencie os modelos do catálogo
              </p>
            </div>
          </div>
          <Link
            href="/catalogo/modelo/cadastrar"
            className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-5 py-2.5 rounded-lg font-semibold shadow-md transition-all text-sm"
          >
            <Plus className="w-4 h-4" /> Cadastrar Modelo
          </Link>
        </div>

        {/* Busca + Filtros */}
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Buscar por nome ou marca..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 text-gray-800 rounded-lg bg-white text-sm focus:ring-2 focus:ring-blue-500 outline-none shadow-sm placeholder:text-gray-400"
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
          <div className="bg-white border border-gray-100 rounded-xl p-5 mb-6 shadow-sm">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1.5 block">
                  Marca
                </label>
                <select
                  value={marcaFiltro}
                  onChange={(e) => setMarcaFiltro(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="">Todas as marcas</option>
                  {marcas.map((m) => (
                    <option key={m.id_marca} value={m.id_marca}>
                      {m.nome}
                    </option>
                  ))}
                </select>
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
                  <th className="px-6 py-4">ID</th>
                  <th className="px-6 py-4">Modelo</th>
                  <th className="px-6 py-4">Marca</th>
                  <th className="px-6 py-4 text-center">Produtos</th>
                  <th className="px-6 py-4 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {modelosFiltrados.map((m) => (
                  <tr
                    key={m.id_modelo}
                    className="text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 font-mono font-semibold text-gray-800">
                      {m.id_modelo}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Smartphone className="w-4 h-4 text-blue-400" />
                        <span className="font-medium text-gray-800">
                          {m.nome}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
                        <Tag className="w-3 h-3" />
                        {m.marca?.nome ?? "—"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100">
                        {m._count?.produtos ?? 0}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => handleVisualizarDetalhes(m)}
                          className="inline-flex items-center justify-center p-1.5 rounded-md text-green-500 hover:bg-green-50 transition-colors"
                          title="Visualizar detalhes"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <Link
                          href={`/catalogo/modelo/atualizar/${m.id_modelo}`}
                          className="inline-flex items-center justify-center p-1.5 rounded-md text-blue-500 hover:bg-blue-50 transition-colors"
                          title="Editar"
                        >
                          <Pencil className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => {
                            setModeloSelecionado(m);
                            setModalDeletar(true);
                          }}
                          className="inline-flex items-center justify-center p-1.5 rounded-md text-red-500 hover:bg-red-50 transition-colors"
                          title="Excluir"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {modelosFiltrados.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-8">
                Nenhum modelo encontrado.
              </p>
            )}
          </div>
        )}
      </main>

      {/* Modal Detalhes */}
      {modalDetalhes && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-2xl">
            <div className="flex items-start justify-between gap-4 mb-5">
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase">
                  Modelo
                </p>
                <h2 className="text-lg font-bold text-gray-800">
                  {modeloSelecionado?.nome}
                </h2>
                <p className="text-xs text-gray-400 mt-1">
                  Marca: {modeloDetalhes?.marca?.nome ?? modeloSelecionado?.marca?.nome ?? "—"}
                </p>
              </div>
              <button
                onClick={() => setModalDetalhes(false)}
                className="px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-all"
              >
                Fechar
              </button>
            </div>

            {loadingDetalhes ? (
              <div className="flex items-center justify-center gap-2 py-10 text-sm text-gray-500">
                <Loader2 className="w-4 h-4 animate-spin" />
                Carregando detalhes...
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                <div className="border border-gray-100 rounded-xl overflow-hidden">
                  <div className="flex items-center gap-2 bg-gray-50 px-4 py-3 border-b border-gray-100">
                    <Tag className="w-4 h-4 text-blue-500" />
                    <h3 className="text-sm font-semibold text-gray-700">
                      Informações
                    </h3>
                  </div>
                  <div className="px-4 py-4 space-y-2">
                    <p className="text-sm text-gray-700">
                      <span className="font-semibold">Marca:</span>{" "}
                      {modeloDetalhes?.marca?.nome ?? "—"}
                    </p>
                    <p className="text-sm text-gray-700">
                      <span className="font-semibold">Total de produtos:</span>{" "}
                      {modeloDetalhes?._count?.produtos ?? 0}
                    </p>
                  </div>
                </div>

                <div className="border border-gray-100 rounded-xl overflow-hidden">
                  <div className="flex items-center gap-2 bg-gray-50 px-4 py-3 border-b border-gray-100">
                    <Smartphone className="w-4 h-4 text-blue-500" />
                    <h3 className="text-sm font-semibold text-gray-700">
                      Produtos ({produtosDetalhes.length})
                    </h3>
                  </div>
                  <div className="max-h-72 overflow-y-auto divide-y divide-gray-50">
                    {produtosDetalhes.length > 0 ? (
                      produtosDetalhes.map((produto) => (
                        <div key={produto.id_produto} className="px-4 py-3">
                          <p className="text-sm font-medium text-gray-800">
                            {produto.nome}
                          </p>
                          <p className="text-xs text-gray-400">
                            {produto.codigo_produto || "Sem código"}
                          </p>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500 text-center py-8">
                        Nenhum produto associado.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal Confirmar Exclusão */}
      {modalDeletar && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-sm text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle className="w-9 h-9 text-red-500" />
              </div>
            </div>
            <h2 className="text-lg font-bold text-gray-800 mb-2">
              Excluir Modelo
            </h2>
            <p className="text-sm text-gray-500 mb-1">
              Tem certeza que deseja excluir{" "}
              <span className="font-semibold text-gray-800">
                {modeloSelecionado?.nome}
              </span>{" "}
              da marca{" "}
              <span className="font-semibold text-gray-800">
                {modeloSelecionado?.marca?.nome}
              </span>
              ?
            </p>
            <p className="text-xs text-gray-400 mb-6">
              Produtos vinculados devem ser removidos primeiro.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setModalDeletar(false)}
                disabled={isDeleting}
                className="flex-1 py-2.5 rounded-lg border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-all disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeletar}
                disabled={isDeleting}
                className="flex-1 flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white py-2.5 rounded-lg font-semibold text-sm transition-all"
              >
                {isDeleting && <Loader2 className="w-4 h-4 animate-spin" />}
                Confirmar
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
            <h2 className="text-lg font-bold text-gray-800 mb-2">
              Excluído com Sucesso!
            </h2>
            <p className="text-sm text-gray-500 mb-6">
              O modelo foi removido do sistema.
            </p>
            <button
              onClick={() => setModalSucesso(false)}
              className="w-full py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold text-sm transition-all"
            >
              Fechar
            </button>
          </div>
        </div>
      )}

      {/* Modal Erro */}
      {modalErro && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-sm text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle className="w-9 h-9 text-red-500" />
              </div>
            </div>
            <h2 className="text-lg font-bold text-gray-800 mb-2">Erro</h2>
            <p className="text-sm text-gray-500 mb-6">{erroMsg}</p>
            <button
              onClick={() => setModalErro(false)}
              className="w-full py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold text-sm transition-all"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </>
  );
}