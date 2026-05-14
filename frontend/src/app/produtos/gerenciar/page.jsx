"use client";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { ArrowLeft, Plus, Search, SlidersHorizontal } from "lucide-react";
import { useGerenciarProduto } from "@/hooks/produtos/useGerenciarProduto";

export default function GerenciarProdutos() {
  // Puxando todos os do Hook 
  const {
    setBusca,
    filtrosAbertos,
    setFiltrosAbertos,
    categoria,
    setCategoria,
    marca,
    setMarca,
    modelo,
    setModelo,
    categorias,
    marcas,
    modelos,
    produtosFiltrados,
    formatarPreco,
    filtroRef,
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
          <Link href="/produtos/cadastrar">
            <button className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-5 py-2.5 rounded-lg font-semibold shadow-md transition-all text-sm">
              <Plus className="w-4 h-4" /> Cadastrar Produto
            </button>
          </Link>
        </div>

        {/* Busca + Filtros */}
        <div className="flex items-center gap-3 mb-4">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Buscar por ID ou nome..."
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
            <SlidersHorizontal className="w-4 h-4" />
            Filtros
          </button>
        </div>

        {/* Painel de Filtros */}
        {filtrosAbertos && (
          <div ref={filtroRef} className="bg-white border border-gray-100 rounded-xl p-5 mb-6 shadow-sm">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Categoria</label>
                <select
                  value={categoria}
                  onChange={(e) => setCategoria(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  {categorias.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Marca</label>
                <select
                  value={marca}
                  onChange={(e) => setMarca(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  {marcas.map((m) => <option key={m}>{m}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Modelo</label>
                <select
                  value={modelo}
                  onChange={(e) => setModelo(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  {modelos.map((m) => <option key={m}>{m}</option>)}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Grid de Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {produtosFiltrados.map((p) => (
            <div
              key={p.id_produto}
              className="bg-white border border-gray-100 rounded-xl px-5 py-4 shadow-sm hover:shadow-md hover:border-blue-200 transition-all cursor-pointer"
            >
              <p className="text-sm font-semibold text-gray-800 leading-tight">{p.nome}</p>
              <p className="text-xs text-gray-400 mt-1">
                {[p.marca, p.categoria].filter(Boolean).join(" • ")}
              </p>
              <div className="flex items-center justify-between mt-3">
                <span className="text-sm font-bold text-blue-600">
                  {formatarPreco(p.preco_compra || p.preco_custo || 0)}
                </span>
                <span className="text-[10px] text-gray-400">ID: {p.id_produto}</span>
              </div>
            </div>
          ))}
        </div>

        {produtosFiltrados.length === 0 && (
          <p className="text-sm text-gray-500 mt-6 text-center">Nenhum produto encontrado.</p>
        )}

      </main>
    </>
  );
}