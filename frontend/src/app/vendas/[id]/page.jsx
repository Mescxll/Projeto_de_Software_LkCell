// Tela de Visualização de Venda
"use client";
import { useRouter, useParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import { useVisualizarVenda } from "@/hooks/venda/useVisualizarVenda";
import {
  ArrowLeft,
  DollarSign,
  Package,
  User,
  Calendar,
  FileText,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";

export default function VisualizarVenda() {
  const router = useRouter();
  const { id } = useParams();

  const { loading, venda, erro, formatarPreco, formatarData, formatarDataSimples } =
    useVisualizarVenda(parseInt(id));

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-[#f4f6fb] flex items-center justify-center">
          <p className="text-gray-400 text-sm">Carregando venda...</p>
        </main>
      </>
    );
  }

  if (erro || !venda) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-[#f4f6fb] p-8 px-55">
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-lg font-bold text-gray-800 mb-2">
                Venda não encontrada
              </h2>
              <p className="text-sm text-gray-600 mb-6">
                A venda que você está procurando não existe.
              </p>
              <button
                onClick={() => router.push("/vendas/gerenciar")}
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2.5 rounded-lg font-semibold transition-all text-sm"
              >
                Voltar para Vendas
              </button>
            </div>
          </div>
        </main>
      </>
    );
  }

  const statusPagamentoColor =
    venda.status_pagamento === "PAGO"
      ? { bg: "#f0fdf4", text: "#16a34a", border: "#bbf7d0" }
      : { bg: "#fefce8", text: "#a16207", border: "#fde047" };

  const statusVendaColor =
    venda.status_venda === "CANCELADA"
      ? { bg: "#fef2f2", text: "#dc2626", border: "#fca5a5" }
      : { bg: "#f0fdf4", text: "#16a34a", border: "#bbf7d0" };

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#f4f6fb] p-8 px-55">
        {/* Voltar */}
        <button
          onClick={() => router.push("/vendas/gerenciar")}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Voltar para Vendas
        </button>

        <div className="flex flex-col gap-6 max-w-4xl">
          {/* Cabeçalho com ID e Status */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  Venda #{venda.id_venda}
                </h1>
                <p className="text-sm text-gray-400 mt-1">
                  {formatarData(venda.data_hora)}
                </p>
              </div>
              <div className="flex gap-3">
                <div className="text-center">
                  <span
                    className="inline-flex items-center justify-center px-4 py-2 rounded-full border text-sm font-semibold"
                    style={{
                      backgroundColor: statusPagamentoColor.bg,
                      color: statusPagamentoColor.text,
                      borderColor: statusPagamentoColor.border,
                    }}
                  >
                    {venda.status_pagamento === "PAGO" ? "Pago" : "Em Aberto"}
                  </span>
                </div>
                <div className="text-center">
                  <span
                    className="inline-flex items-center justify-center px-4 py-2 rounded-full border text-sm font-semibold"
                    style={{
                      backgroundColor: statusVendaColor.bg,
                      color: statusVendaColor.text,
                      borderColor: statusVendaColor.border,
                    }}
                  >
                    {venda.status_venda === "CANCELADA" ? "Cancelada" : "Efetuada"}
                  </span>
                </div>
              </div>
            </div>

            {/* Informações Básicas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Cliente */}
              {venda.cliente ? (
                <div>
                  <label className="text-xs font-semibold text-gray-600">Cliente</label>
                  <div className="flex items-center gap-2 mt-2">
                    <User className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-sm font-semibold text-gray-800">
                        {venda.cliente.nome}
                      </p>
                      <p className="text-xs text-gray-400">
                        ID: {venda.cliente.id_cliente}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <label className="text-xs font-semibold text-gray-600">Cliente</label>
                  <p className="text-sm text-gray-400 mt-2">Sem cliente registrado</p>
                </div>
              )}

              {/* Funcionário */}
              <div>
                <label className="text-xs font-semibold text-gray-600">Funcionário</label>
                <div className="flex items-center gap-2 mt-2">
                  <User className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-sm font-semibold text-gray-800">
                      {venda.funcionario?.nome || "-"}
                    </p>
                    <p className="text-xs text-gray-400">
                      ID: {venda.funcionario?.id_funcionario || "-"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Valor Total */}
              <div>
                <label className="text-xs font-semibold text-gray-600">Valor Total</label>
                <div className="flex items-center gap-2 mt-2">
                  <DollarSign className="w-4 h-4 text-green-500" />
                  <p className="text-lg font-bold text-green-600">
                    {formatarPreco(venda.valor_total || 0)}
                  </p>
                </div>
              </div>

              {/* Data de Vencimento */}
              <div>
                <label className="text-xs font-semibold text-gray-600">
                  Data de Vencimento
                </label>
                <div className="flex items-center gap-2 mt-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <p className="text-sm text-gray-800">
                    {venda.data_vencimento
                      ? formatarDataSimples(venda.data_vencimento)
                      : "Sem vencimento"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Itens da Venda */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <h2 className="text-xl font-bold text-gray-800 mb-6">
              Produtos ({venda.itensvenda?.length || 0})
            </h2>

            {venda.itensvenda && venda.itensvenda.length > 0 ? (
              <div className="border border-gray-100 rounded-lg overflow-hidden">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr className="text-xs font-semibold text-gray-500">
                      <th className="px-6 py-4">Código</th>
                      <th className="px-6 py-4">Produto</th>
                      <th className="px-6 py-4">Categoria</th>
                      <th className="px-6 py-4 text-right">Quantidade</th>
                      <th className="px-6 py-4 text-right">Preço Unitário</th>
                      <th className="px-6 py-4 text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {venda.itensvenda.map((item) => (
                      <tr key={item.fk_produto_id_produto} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <span className="font-mono text-xs text-gray-500">
                            {item.produto?.codigo_produto || "-"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-semibold text-gray-800">
                            {item.produto?.nome || "Produto não disponível"}
                          </p>
                          {item.produto?.modelo && (
                            <p className="text-xs text-gray-400">
                              {item.produto.modelo.marca?.nome} {item.produto.modelo.nome}
                            </p>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-gray-700">
                            {item.produto?.categoria?.nome || "-"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right font-medium text-gray-800">
                          {item.quantidade_vendida}
                        </td>
                        <td className="px-6 py-4 text-right text-gray-700">
                          {formatarPreco(item.preco_unitario || 0)}
                        </td>
                        <td className="px-6 py-4 text-right font-semibold text-green-600">
                          {formatarPreco(
                            (item.preco_unitario || 0) * (item.quantidade_vendida || 0)
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Resumo Final */}
                <div className="bg-gray-50 border-t border-gray-100 px-6 py-4 flex justify-end">
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-semibold text-gray-600">Total:</span>
                    <span className="text-2xl font-bold text-green-600">
                      {formatarPreco(venda.valor_total || 0)}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-400 text-center py-8">
                Esta venda não possui itens.
              </p>
            )}
          </div>

          {/* Botões de Ação */}
          <div className="flex gap-3 justify-end mb-8">
            <button
              onClick={() => router.push("/vendas/gerenciar")}
              className="px-6 py-2.5 border border-gray-200 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-all"
            >
              Voltar
            </button>
            {venda.status_venda !== "CANCELADA" && (
              <button
                onClick={() => router.push(`/vendas/atualizar/${venda.id_venda}`)}
                className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-6 py-2.5 rounded-lg font-semibold transition-all text-sm"
              >
                Atualizar
              </button>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
