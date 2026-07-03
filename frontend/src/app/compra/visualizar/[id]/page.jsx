// Tela de Visualização de Compra
"use client";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { useVisualizarCompra } from "@/hooks/compra/useVisualizarCompra";
import {
  ArrowLeft,
  Pencil,
  Truck,
  Package,
  Calendar,
  AlertTriangle,
  Receipt,
  MapPin,
} from "lucide-react";

export default function VisualizarCompra() {
  const router = useRouter();
  const { id } = useParams();

  const {
    loading,
    compra,
    erro,
    formatarPreco,
    formatarData,
    formatarDataSimples,
  } = useVisualizarCompra(parseInt(id));

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-[#f4f6fb] flex items-center justify-center">
          <p className="text-gray-400 text-sm">Carregando compra...</p>
        </main>
      </>
    );
  }

  if (erro || !compra) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-[#f4f6fb] p-8 px-55">
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-lg font-bold text-gray-800 mb-2">
                Compra não encontrada
              </h2>
              <p className="text-sm text-gray-600 mb-6">
                A compra que você está procurando não existe.
              </p>
              <button
                onClick={() => router.push("/compra/gerenciar")}
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2.5 rounded-lg font-semibold transition-all text-sm"
              >
                Voltar para Compras
              </button>
            </div>
          </div>
        </main>
      </>
    );
  }

  const isCancelada = compra.status_compra === "CANCELADA";

  const statusCompraStyle = isCancelada
    ? { bg: "#fef2f2", text: "#dc2626", border: "#fca5a5" }
    : { bg: "#f0fdf4", text: "#16a34a", border: "#bbf7d0" };

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#f4f6fb] p-8 px-55">
        {/* Voltar */}
        <button
          onClick={() => router.push("/compra/gerenciar")}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Voltar para Compras
        </button>

        <div className="flex flex-col gap-6 max-w-3xl mx-auto w-full">
          {/* Cabeçalho */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <div className="flex items-start justify-between mb-6">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <Receipt className="w-5 h-5 text-gray-400" />
                  <h1 className="text-2xl font-bold text-gray-800">
                    Compra {compra.id_compra}
                  </h1>
                </div>
                <p className="text-sm text-gray-400 ml-8">
                  {formatarData(compra.data_hora)}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className="inline-flex items-center px-3 py-1.5 rounded-full border text-[11px] font-semibold"
                  style={{
                    backgroundColor: statusCompraStyle.bg,
                    color: statusCompraStyle.text,
                    borderColor: statusCompraStyle.border,
                  }}
                >
                  {isCancelada ? "Cancelada" : "Ativa"}
                </span>

                {!isCancelada && (
                  <Link
                    href={`/compra/atualizar/${compra.id_compra}`}
                    className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold transition-all text-sm ml-2"
                  >
                    <Pencil className="w-4 h-4" /> Atualizar
                  </Link>
                )}
              </div>
            </div>

            {/* Aviso se cancelada */}
            {isCancelada && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex gap-3">
                <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-red-900">
                    Compra Cancelada
                  </p>
                  <p className="text-xs text-red-700 mt-1">
                    Esta compra foi cancelada. O estoque dos produtos foi
                    estornado automaticamente.
                  </p>
                </div>
              </div>
            )}

            {/* Informações */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Fornecedor */}
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-2 block">
                  Fornecedor
                </label>
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <Truck className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-gray-800">
                      {compra.fornecedor?.razao_social || "-"}
                    </p>
                    <p className="text-xs text-gray-400">
                      {compra.fornecedor
                        ? `ID: ${compra.fornecedor.id_fornecedor}`
                        : "-"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Valor Total */}
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-2 block">
                  Valor Total
                </label>
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <p className="text-lg font-bold text-blue-600">
                    {formatarPreco(compra.valor_total || 0)}
                  </p>
                </div>
              </div>

              {/* Data da Compra */}
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-2 block">
                  Data da Compra
                </label>
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <p className="text-sm font-semibold text-gray-800">
                    {formatarData(compra.data_hora)}
                  </p>
                </div>
              </div>

              {/* Prazo de Entrega */}
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-2 block">
                  Prazo de Entrega
                </label>
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <p className="text-sm font-semibold text-gray-800">
                    {compra.prazo_entrega
                      ? formatarDataSimples(compra.prazo_entrega)
                      : "Sem prazo definido"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Produtos */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <div className="flex items-center gap-2 mb-6">
              <Package className="w-5 h-5 text-gray-400" />
              <h2 className="text-xl font-bold text-gray-800">
                Produtos ({compra.itenscompra?.length || 0})
              </h2>
            </div>

            {compra.itenscompra && compra.itenscompra.length > 0 ? (
              <div className="border border-gray-100 rounded-lg overflow-hidden">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr className="text-xs font-semibold text-gray-500">
                      <th className="px-6 py-4">Produto</th>
                      <th className="px-6 py-4">Localização</th>
                      <th className="px-6 py-4 text-right">Quantidade</th>
                      <th className="px-6 py-4 text-right">Preço de Compra</th>
                      <th className="px-6 py-4 text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {compra.itenscompra.map((item) => (
                      <tr
                        key={`${item.fk_produto_id_produto}-${item.fk_localizacao_id}`}
                      >
                        <td className="px-6 py-4">
                          <p className="font-semibold text-gray-800">
                            {item.produto?.descricao ||
                              item.produto?.nome ||
                              "Produto não disponível"}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            Código: {item.produto?.codigo_produto || "-"}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          {item.localizacao ? (
                            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                              <MapPin className="w-3 h-3" />
                              {item.localizacao}
                            </span>
                          ) : (
                            <span className="text-xs text-gray-300">—</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right font-medium text-gray-800">
                          {item.quantidade}
                        </td>
                        <td className="px-6 py-4 text-right text-gray-700">
                          {formatarPreco(item.preco_compra || 0)}
                        </td>
                        <td className="px-6 py-4 text-right font-semibold text-blue-600">
                          {formatarPreco(
                            (item.preco_compra || 0) * (item.quantidade || 0),
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="bg-gray-50 border-t border-gray-100 px-6 py-4 flex justify-end">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-gray-600">
                      Total:
                    </span>
                    <span className="text-xl font-bold text-blue-600">
                      {formatarPreco(compra.valor_total || 0)}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-400 text-center py-8">
                Esta compra não possui itens.
              </p>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
