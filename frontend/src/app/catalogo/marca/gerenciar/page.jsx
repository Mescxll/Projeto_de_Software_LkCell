// app/catalogo/marca/gerenciar/page.jsx
"use client";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import LoadingGerenciar from "@/components/LoadingGerenciar";
import { useGerenciarMarca } from "@/hooks/catalogo/marca/useGerenciarMarca";
import {
  ArrowLeft,
  Plus,
  Search,
  Pencil,
  Trash2,
  Loader2,
  AlertTriangle,
  CheckCircle,
  Eye,
  Tag,
  Smartphone,
  Layers3,
} from "lucide-react";

export default function GerenciarMarcas() {
  const {
    loading,
    marcasFiltradas,
    busca,
    setBusca,
    modalDeletar,
    setModalDeletar,
    modalSucesso,
    setModalSucesso,
    modalErro,
    setModalErro,
    erroMsg,
    isDeleting,
    marcaSelecionada,
    setMarcaSelecionada,
    modalDetalhes,
    setModalDetalhes,
    marcaDetalhes,
    loadingDetalhes,
    handleVisualizarDetalhes,
    handleDeletar,
  } = useGerenciarMarca();

  const modelosDetalhes = marcaDetalhes?.modelos ?? [];
  const categoriasAssociadas = Array.from(
    new Map(
      modelosDetalhes
        .flatMap((modelo) => modelo.produtos ?? [])
        .map((produto) => produto.categoria)
        .filter(Boolean)
        .map((categoria) => [categoria.id_categoria, categoria]),
    ).values(),
  );

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
                Marcas
              </h1>
              <p className="text-xs text-gray-400">
                Gerencie as marcas do catálogo
              </p>
            </div>
          </div>
          <Link
            href="/catalogo/marca/cadastrar"
            className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-5 py-2.5 rounded-lg font-semibold shadow-md transition-all text-sm"
          >
            <Plus className="w-4 h-4" /> Cadastrar Marca
          </Link>
        </div>

        {/* Busca */}
        <div className="flex items-center gap-3 mb-4">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Buscar por nome..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 text-gray-800 rounded-lg bg-white text-sm focus:ring-2 focus:ring-blue-500 outline-none shadow-sm placeholder:text-gray-400"
            />
          </div>
        </div>

        {/* Tabela */}
        {loading ? (
          <LoadingGerenciar />
        ) : (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr className="text-xs font-semibold text-gray-500">
                  <th className="px-6 py-4">ID</th>
                  <th className="px-6 py-4">Nome</th>
                  <th className="px-6 py-4 text-center">Modelos</th>
                  <th className="px-6 py-4 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {marcasFiltradas.map((m) => (
                  <tr
                    key={m.id_marca}
                    className="text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 font-mono font-semibold text-gray-800">
                      {m.id_marca}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Tag className="w-4 h-4 text-blue-400" />
                        <span className="font-medium text-gray-800">
                          {m.nome}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100">
                        {m._count?.modelos ?? 0}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => handleVisualizarDetalhes(m)}
                          className="inline-flex items-center justify-center p-1.5 rounded-md text-green-500 hover:bg-green-50 transition-colors"
                          title="Visualizar modelos e categorias"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <Link
                          href={`/catalogo/marca/atualizar/${m.id_marca}`}
                          className="inline-flex items-center justify-center p-1.5 rounded-md text-blue-500 hover:bg-blue-50 transition-colors"
                          title="Editar"
                        >
                          <Pencil className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => {
                            setMarcaSelecionada(m);
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
            {marcasFiltradas.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-8">
                Nenhuma marca encontrada.
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
                  Marca
                </p>
                <h2 className="text-lg font-bold text-gray-800">
                  {marcaSelecionada?.nome}
                </h2>
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
              <div className="grid grid-cols-2 gap-4">
                <div className="border border-gray-100 rounded-xl overflow-hidden">
                  <div className="flex items-center gap-2 bg-gray-50 px-4 py-3 border-b border-gray-100">
                    <Smartphone className="w-4 h-4 text-blue-500" />
                    <h3 className="text-sm font-semibold text-gray-700">
                      Modelos ({modelosDetalhes.length})
                    </h3>
                  </div>
                  <div className="max-h-72 overflow-y-auto divide-y divide-gray-50">
                    {modelosDetalhes.length > 0 ? (
                      modelosDetalhes.map((modelo) => (
                        <div key={modelo.id_modelo} className="px-4 py-3">
                          <p className="text-sm font-medium text-gray-800">
                            {modelo.nome}
                          </p>
                          <p className="text-xs text-gray-400">
                            {modelo._count?.produtos ?? 0} produto(s)
                          </p>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500 text-center py-8">
                        Nenhum modelo associado.
                      </p>
                    )}
                  </div>
                </div>

                <div className="border border-gray-100 rounded-xl overflow-hidden">
                  <div className="flex items-center gap-2 bg-gray-50 px-4 py-3 border-b border-gray-100">
                    <Layers3 className="w-4 h-4 text-purple-500" />
                    <h3 className="text-sm font-semibold text-gray-700">
                      Categorias ({categoriasAssociadas.length})
                    </h3>
                  </div>
                  <div className="max-h-72 overflow-y-auto divide-y divide-gray-50">
                    {categoriasAssociadas.length > 0 ? (
                      categoriasAssociadas.map((categoria) => (
                        <div
                          key={categoria.id_categoria}
                          className="px-4 py-3"
                        >
                          <p className="text-sm font-medium text-gray-800">
                            {categoria.nome}
                          </p>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500 text-center py-8">
                        Nenhuma categoria associada.
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
              Excluir Marca
            </h2>
            <p className="text-sm text-gray-500 mb-1">
              Tem certeza que deseja excluir a marca{" "}
              <span className="font-semibold text-gray-800">
                {marcaSelecionada?.nome}
              </span>
              ?
            </p>
            <p className="text-xs text-gray-400 mb-6">
              Todos os modelos vinculados devem ser excluídos primeiro.
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
              Excluída com Sucesso!
            </h2>
            <p className="text-sm text-gray-500 mb-6">
              A marca foi removida do sistema.
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
