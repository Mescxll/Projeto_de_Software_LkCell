// Tela de Visualização de Categoria
"use client";
import { useVisualizarCategoria } from "@/hooks/catalogo/categoria/useVisualizarCategoria";
import { X, Package, FolderOpen, Tag, Barcode, AlertTriangle } from "lucide-react";

export default function VisualizarCategoria({ id, onClose }) {
  // Passamos o ID recebido da prop direto para o hook
  const { loading, categoria, erro, formatarPreco } = useVisualizarCategoria(id);

  // Fundo escuro do modal que fecha ao clicar fora
  const handleFundoClick = (e) => {
    if (e.target.id === "fundo-modal") onClose();
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow-lg">
          <p className="text-gray-500 font-medium">Carregando categoria...</p>
        </div>
      </div>
    );
  }

  if (erro || !categoria) {
    return (
      <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center" id="fundo-modal" onClick={handleFundoClick}>
        <div className="bg-white p-8 rounded-xl shadow-lg text-center max-w-sm w-full relative">
          <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-lg font-bold text-gray-800 mb-2">Erro ao buscar</h2>
          <p className="text-sm text-gray-600 mb-6">Não foi possível carregar os dados desta categoria.</p>
          <button onClick={onClose} className="bg-blue-500 text-white px-6 py-2 rounded-lg font-semibold w-full">
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
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 backdrop-blur-sm"
    >
      {/* Container do Modal (com barra de rolagem se ficar muito grande) */}
      <div className="bg-[#f4f6fb] rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto relative flex flex-col">
        
        {/* Cabeçalho Fixo do Modal */}
        <div className="bg-white sticky top-0 z-10 border-b border-gray-100 p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FolderOpen className="w-6 h-6 text-blue-500" />
            <div>
              <h1 className="text-xl font-bold text-gray-800">{categoria.nome}</h1>
              <p className="text-xs text-gray-400">ID: #{categoria.id_categoria}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Corpo do Modal */}
        <div className="p-6 flex flex-col gap-6">
          {/* Informações Resumidas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-3">
              <Tag className="w-8 h-8 text-blue-100 fill-blue-500 p-1.5 bg-blue-50 rounded-lg" />
              <div>
                <p className="text-xs text-gray-400 font-semibold uppercase">Nome</p>
                <p className="text-sm font-bold text-gray-800">{categoria.nome}</p>
              </div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-3">
              <Package className="w-8 h-8 text-green-100 fill-green-500 p-1.5 bg-green-50 rounded-lg" />
              <div>
                <p className="text-xs text-gray-400 font-semibold uppercase">Total de Produtos</p>
                <p className="text-sm font-bold text-gray-800">{categoria.produto?.length || 0} vinculados</p>
              </div>
            </div>
          </div>

          {/* Produtos Vinculados */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Package className="w-5 h-5 text-gray-400" /> Produtos
            </h2>

            {categoria.produto && categoria.produto.length > 0 ? (
              <div className="border border-gray-100 rounded-lg overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr className="text-xs font-semibold text-gray-500">
                      <th className="px-4 py-3">Produto</th>
                      <th className="px-4 py-3">Código</th>
                      <th className="px-4 py-3 text-right">Custo</th>
                      <th className="px-4 py-3 text-right">Venda</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {categoria.produto.map((prod) => (
                      <tr key={prod.id_produto} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <p className="font-semibold text-gray-800">{prod.nome}</p>
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center gap-1.5 text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                            <Barcode className="w-3 h-3" /> {prod.codigo_produto}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right text-gray-600">{formatarPreco(prod.preco_custo)}</td>
                        <td className="px-4 py-3 text-right font-semibold text-green-600">{formatarPreco(prod.preco_venda)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-gray-400 text-center py-6">Nenhum produto vinculado.</p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}