// app/catalogo/categoria/gerenciar/page.jsx
"use client";
import { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import LoadingGerenciar from "@/components/LoadingGerenciar";
import { useGerenciarCategoria } from "@/hooks/catalogo/categoria/useGerenciarCategoria";
import VisualizarCategoria from "@/components/catalogo/categoria/VisualizarCategoria";
import {
  ArrowLeft,
  Plus,
  Search,
  Pencil,
  Trash2,
  Loader2,
  AlertTriangle,
  CheckCircle,
  Folder,
  Eye,
} from "lucide-react";

export default function GerenciarCategorias() {
  const [visualizarId, setVisualizarId] = useState(null); 

  const {
    loading,
    categoriasFiltradas,
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
    categoriaSelecionada,
    setCategoriaSelecionada,
    handleDeletar,
  } = useGerenciarCategoria();

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
                Categorias
              </h1>
              <p className="text-xs text-gray-400">
                Gerencie as categorias de produtos
              </p>
            </div>
          </div>
          <Link
            href="/catalogo/categoria/cadastrar"
            className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-5 py-2.5 rounded-lg font-semibold shadow-md transition-all text-sm"
          >
            <Plus className="w-4 h-4" /> Cadastrar Categoria
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
                  <th className="px-6 py-4 text-center">Produtos</th>
                  <th className="px-6 py-4 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {categoriasFiltradas.map((c) => (
                  <tr
                    key={c.id_categoria}
                    className="text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 font-mono font-semibold text-gray-800">
                      {c.id_categoria}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Folder className="w-4 h-4 text-blue-400" />
                        <span className="font-medium text-gray-800">
                          {c.nome}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100">
                        {c._count?.produto ?? 0}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center gap-2">
                        
                        <button
                          onClick={() => setVisualizarId(c.id_categoria)}
                          className="inline-flex items-center justify-center p-1.5 rounded-md transition-colors text-green-500 hover:bg-green-50 icon-btn-green"
                          title="Ver detalhes"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        
                        <Link
                          href={`/catalogo/categoria/atualizar/${c.id_categoria}`}
                          className="inline-flex items-center justify-center p-1.5 rounded-md text-blue-500 hover:bg-blue-50 transition-colors"
                          title="Editar"
                        >
                          <Pencil className="w-4 h-4" />
                        </Link>

                        <button
                          onClick={() => {
                            setCategoriaSelecionada(c);
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
            {categoriasFiltradas.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-8">
                Nenhuma categoria encontrada.
              </p>
            )}
          </div>
        )}
      </main>

      {/*Modal de Visualizar Categoria */}
      {visualizarId && (
        <VisualizarCategoria 
          id={visualizarId} 
          onClose={() => setVisualizarId(null)} 
        />
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
              Excluir Categoria
            </h2>
            <p className="text-sm text-gray-500 mb-1">
              Tem certeza que deseja excluir a categoria{" "}
              <span className="font-semibold text-gray-800">
                {categoriaSelecionada?.nome}
              </span>
              ?
            </p>
            <p className="text-xs text-gray-400 mb-6">
              Esta ação não poderá ser desfeita.
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
              A categoria foi removida do sistema.
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