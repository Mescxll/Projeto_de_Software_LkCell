// Tela de Gerenciamento de Produtos (Atualização e Exclusão)
"use client";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import LoadingGerenciar from "@/components/LoadingGerenciar";
import { ArrowLeft, Plus, Search, SlidersHorizontal, Pencil, Trash2, Loader2, AlertTriangle, CheckCircle } from "lucide-react";
import { useGerenciarProduto } from "@/hooks/produto/useGerenciarProduto";

export default function GerenciarProdutos() {
  const {
    loading, setBusca,
    filtrosAbertos, setFiltrosAbertos,
    categoria, setCategoria,
    marca, setMarca,
    modelo, setModelo,
    categorias, marcas, modelos,
    produtosFiltrados, formatarPreco,
    filtroRef, menuAberto, setMenuAberto,
    menuRef, modalConfirmar, setModalConfirmar,
    modalSucesso, setModalSucesso,
    isDeleting, produtoSelecionado, setProdutoSelecionado,
    handleExcluir,
  } = useGerenciarProduto();

  return (
    <>
      <Navbar />
      <main className="p-8 px-55 min-h-screen bg-[#f4f6fb]">

        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Link href="/" className="p-1.5 hover:bg-gray-200 rounded-full transition-all">
              <ArrowLeft className="w-5 h-5 text-gray-500" />
            </Link>
            <div>
              <h1 className="text-lg font-bold text-gray-800 leading-tight">Produtos</h1>
              <p className="text-xs text-gray-400">Gerencie os produtos do sistema</p>
            </div>
          </div>
          <Link href="/produto/cadastrar">
            <button className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-5 py-2.5 rounded-lg font-semibold shadow-md transition-all text-sm">
              <Plus className="w-4 h-4" /> Cadastrar Produto
            </button>
          </Link>
        </div>

        {/* Busca + Filtros */}
        <div className="flex items-center gap-3 mb-4">
          <div className="relative w-full max-w-xl">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar por Descrição, Categoria ou Código do produto..."
              className="w-full pl-9 pr-4 py-2 border border-gray-200 text-gray-800 rounded-lg bg-white text-sm focus:ring-2 focus:ring-blue-500 outline-none shadow-sm placeholder:text-gray-400"
              onChange={(e) => setBusca(e.target.value)}
            />
          </div>
          <button
            onClick={() => setFiltrosAbertos(!filtrosAbertos)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
              filtrosAbertos ? "bg-blue-50 border-blue-300 text-blue-600" : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" /> Filtros
          </button>
        </div>

        {/* Painel de Filtros */}
        {filtrosAbertos && (
          <div ref={filtroRef} className="bg-white border border-gray-100 rounded-xl p-5 mb-6 shadow-sm">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Categoria</label>
                <select value={categoria} onChange={(e) => setCategoria(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 focus:ring-2 focus:ring-blue-500 outline-none">
                  {categorias.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Marca</label>
                <select value={marca} onChange={(e) => setMarca(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 focus:ring-2 focus:ring-blue-500 outline-none">
                  {marcas.map((m) => <option key={m}>{m}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Modelo</label>
                <select value={modelo} onChange={(e) => setModelo(e.target.value)}
                  disabled={marca === "Todas"}
                  className={`w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none
                      ${marca === "Todas" ? "bg-gray-50 cursor-not-allowed text-gray-400" : "text-gray-700"}`}
                  >
                    {marca === "Todas" ? (
                      <option value="Todos">Selecione uma marca primeiro</option>
                    ) : (
                      modelos.map((m) => <option key={m}>{m}</option>)
                    )}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Loading */}
        {loading ? <LoadingGerenciar /> : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 auto-rows-fr">
              {produtosFiltrados.map((p) => (
                <div
                  key={p.id_produto}
                  className="relative bg-white border border-gray-100 rounded-xl px-5 py-4 shadow-sm hover:shadow-md hover:border-blue-200 transition-all cursor-pointer h-full flex flex-col"
                  onClick={() => setMenuAberto(menuAberto === p.id_produto ? null : p.id_produto)}
                >
                  <p className="text-sm font-semibold text-gray-800 leading-tight">{p.descricao}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {[p.modelo?.marca?.nome, p.categoria?.nome, p.modelo?.nome].filter(Boolean).join(" • ")}
                  </p>
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-sm font-bold text-blue-600">
                      {formatarPreco(p.preco_venda || p.preco_compra || p.preco_custo || 0)}
                    </span>
                    <span className="text-[10px] text-gray-400">ID: {p.id_produto}</span>
                  </div>

                  {/* Menu de ações */}
                  {menuAberto === p.id_produto && (
                    <div
                      ref={menuRef}
                      className="absolute top-14 left-1/2 -translate-x-1/2 bg-white border border-gray-100 rounded-xl shadow-lg z-10 overflow-hidden w-36"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Link href={`/produto/atualizar/${p.id_produto}`}>
                        <button className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-blue-500 hover:bg-blue-50 transition-colors">
                          <Pencil className="w-4 h-4" /> Atualizar
                        </button>
                      </Link>
                      <button
                        onClick={() => { setProdutoSelecionado(p); setModalConfirmar(true); }}
                        className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" /> Excluir
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {produtosFiltrados.length === 0 && (
              <p className="text-sm text-gray-500 mt-6 text-center">Nenhum produto encontrado.</p>
            )}
          </>
        )}
      </main>

      {/* Modal Confirmar Exclusão */}
      {modalConfirmar && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-sm text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle className="w-9 h-9 text-red-500" />
              </div>
            </div>
            <h2 className="text-lg font-bold text-gray-800 mb-2">Confirmar Exclusão</h2>
            <p className="text-sm text-gray-500 mb-1">
              Tem certeza de que deseja excluir o produto{" "}
              <span className="font-semibold text-gray-800">{produtoSelecionado?.descricao}</span>?
            </p>
            <p className="text-xs text-gray-400 mb-6">Esta ação não pode ser desfeita.</p>
            <div className="flex gap-3">
              <button onClick={() => setModalConfirmar(false)}
                className="flex-1 py-2.5 rounded-lg border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-all">
                Cancelar
              </button>
              <button onClick={handleExcluir} disabled={isDeleting}
                className={`flex-1 flex items-center justify-center gap-2 text-white py-2.5 rounded-lg font-semibold text-sm transition-all
                  ${isDeleting ? "bg-red-400 cursor-not-allowed" : "bg-red-500 hover:bg-red-600"}`}>
                {isDeleting ? <><Loader2 className="w-4 h-4 animate-spin" /> Excluindo...</> : "Confirmar"}
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
            <h2 className="text-lg font-bold text-gray-800 mb-1">Sucesso!</h2>
            <p className="text-xs text-gray-400 mb-6">Produto excluído com sucesso.</p>
            <button onClick={() => setModalSucesso(false)}
              className="w-full py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold text-sm transition-all">
              Fechar
            </button>
          </div>
        </div>
      )}
    </>
  );
}