// src/components/catalogo/categoria/VisualizarCategoria.jsx
"use client";
import Link from "next/link"; // Adicionado o import do Link
import { useVisualizarCategoria } from "@/hooks/catalogo/categoria/useVisualizarCategoria";
import { 
    X, 
    Package, 
    FolderOpen, 
    Tag, 
    Barcode, 
    AlertTriangle, 
    Eye 
} from "lucide-react";

export default function VisualizarCategoria({ id, onClose }) {
  const { loading, categoria, erro } = useVisualizarCategoria(id);

  const handleFundoClick = (e) => {
    if (e.target.id === "fundo-modal") onClose();
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow-lg flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500 font-medium text-sm">Buscando detalhes...</p>
        </div>
      </div>
    );
  }

  if (erro || !categoria) {
    return (
      <div 
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" 
        id="fundo-modal" 
        onClick={handleFundoClick}
      >
        <div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-sm w-full relative">
          <button 
            onClick={onClose} 
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors bg-gray-100 hover:bg-gray-200 p-1.5 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-lg font-bold text-gray-800 mb-2">Erro ao buscar</h2>
          <p className="text-sm text-gray-500 mb-6">Não foi possível carregar os dados desta categoria.</p>
          <button 
            onClick={onClose} 
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2.5 rounded-lg font-semibold w-full transition-all"
          >
            Fechar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      id="fundo-modal" 
      onClick={handleFundoClick}
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6"
    >
      <div className="bg-[#f4f6fb] rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto relative flex flex-col">
        
        <div className="bg-white sticky top-0 z-10 border-b border-gray-100 p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-50 rounded-lg">
              <FolderOpen className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">{categoria.nome}</h1>
              <p className="text-xs font-medium text-gray-400 mt-0.5">ID da Categoria: #{categoria.id_categoria}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
            title="Fechar"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <div className="p-6 flex flex-col gap-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
              <div className="p-3 bg-blue-50 rounded-lg">
                <Tag className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider mb-0.5">Nome</p>
                <p className="text-sm font-bold text-gray-800">{categoria.nome}</p>
              </div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
              <div className="p-3 bg-green-50 rounded-lg">
                <Package className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider mb-0.5">Total de Produtos</p>
                <p className="text-sm font-bold text-gray-800">{categoria.produto?.length || 0} produto(s) vinculados</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
            <div className="p-5 border-b border-gray-100 flex items-center gap-2">
              <Package className="w-5 h-5 text-gray-400" />
              <h2 className="text-lg font-bold text-gray-800">
                Produtos
              </h2>
            </div>

            {categoria.produto && categoria.produto.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr className="text-xs font-semibold text-gray-500">
                      <th className="px-6 py-4">Produto</th>
                      <th className="px-6 py-4">Código</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {categoria.produto.map((prod) => (
                      <tr key={prod.id_produto} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <p className="font-semibold text-gray-800">{prod.nome || "Sem nome"}</p>
                          {prod.descricao && (
                            <p className="text-xs text-gray-400 mt-1 line-clamp-1">{prod.descricao}</p>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-gray-600 bg-gray-100 border border-gray-200 px-2.5 py-1 rounded-md">
                            <Barcode className="w-3.5 h-3.5" />
                            {prod.codigo_produto}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-12 flex flex-col items-center justify-center text-center px-4">
                <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-3">
                  <Package className="w-6 h-6 text-gray-300" />
                </div>
                <p className="text-sm font-medium text-gray-500">Nenhum produto vinculado.</p>
                <p className="text-xs text-gray-400 mt-1">Os produtos associados a esta categoria aparecerão aqui.</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}