// Tela de Visualização de Venda
"use client";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { useVisualizarVenda } from "@/hooks/venda/useVisualizarVenda";
import {
  ArrowLeft,
  Pencil,
  MapPin,
  User,
  Package,
  Calendar,
  AlertTriangle,
  Receipt,
} from "lucide-react";

export default function VisualizarVenda() {
  const router = useRouter();
  const { id } = useParams();

  const {
    loading,
    venda,
    erro,
    formatarPreco,
    formatarData,
    formatarDataSimples,
  } = useVisualizarVenda(parseInt(id));

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
                onClick={() => router.push("/venda/gerenciar")}
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

  const isCancelada = venda.status_venda === "CANCELADA";

  const statusPagamentoStyle =
    venda.status_pagamento === "PAGO"
      ? { bg: "#f0fdf4", text: "#16a34a", border: "#bbf7d0" }
      : { bg: "#fefce8", text: "#a16207", border: "#fde047" };

  const statusVendaStyle = isCancelada
    ? { bg: "#fef2f2", text: "#dc2626", border: "#fca5a5" }
    : { bg: "#f0fdf4", text: "#16a34a", border: "#bbf7d0" };

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#f4f6fb] p-8 px-55">
        {/* Voltar */}
        <button
          onClick={() => router.push("/venda/gerenciar")}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Voltar para Vendas
        </button>

        <div className="flex flex-col gap-6 max-w-3xl mx-auto w-full">
          {/* Cabeçalho */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <div className="flex items-start justify-between mb-6">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <Receipt className="w-5 h-5 text-gray-400" />
                  <h1 className="text-2xl font-bold text-gray-800">
                    Venda {venda.id_venda}
                  </h1>
                </div>
                <p className="text-sm text-gray-400 ml-8">
                  {formatarData(venda.data_hora)}
                </p>
              </div>

              <div className="flex items-center gap-2">
                {/* Badges de status */}
                <span
                  className="inline-flex items-center px-3 py-1.5 rounded-full border text-[11px] font-semibold"
                  style={{
                    backgroundColor: statusVendaStyle.bg,
                    color: statusVendaStyle.text,
                    borderColor: statusVendaStyle.border,
                  }}
                >
                  {isCancelada ? "Cancelada" : "Efetuada"}
                </span>
                <span
                  className="inline-flex items-center px-3 py-1.5 rounded-full border text-[11px] font-semibold"
                  style={{
                    backgroundColor: statusPagamentoStyle.bg,
                    color: statusPagamentoStyle.text,
                    borderColor: statusPagamentoStyle.border,
                  }}
                >
                  {venda.status_pagamento === "PAGO" ? "Pago" : "Em Aberto"}
                </span>

                {/* Botão Atualizar — apenas se não cancelada */}
                {!isCancelada && (
                  <Link
                    href={`/venda/atualizar/${venda.id_venda}`}
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
                    Venda Cancelada
                  </p>
                  <p className="text-xs text-red-700 mt-1">
                    Esta venda foi cancelada. O estoque dos produtos foi
                    estornado automaticamente.
                  </p>
                </div>
              </div>
            )}

            {/* Informações */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Cliente */}
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-2 block">
                  Cliente
                </label>
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <User className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-gray-800">
                      {venda.cliente?.nome || "Sem cliente"}
                    </p>
                    <p className="text-xs text-gray-400">
                      {venda.cliente ? `ID: ${venda.cliente.id_cliente}` : "-"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Funcionário */}
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-2 block">
                  Funcionário
                </label>
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <User className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-gray-800">
                      {venda.funcionario?.nome || "-"}
                    </p>
                    <p className="text-xs text-gray-400">
                      {venda.funcionario
                        ? `ID: ${venda.funcionario.id_funcionario}`
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
                  <p className="text-lg font-bold text-green-600">
                    {formatarPreco(venda.valor_total || 0)}
                  </p>
                </div>
              </div>

              {/* Data de Vencimento */}
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-2 block">
                  Vencimento
                </label>
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <p className="text-sm font-semibold text-gray-800">
                    {venda.data_vencimento
                      ? formatarDataSimples(venda.data_vencimento)
                      : "Sem vencimento"}
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
                Produtos ({venda.itensvenda?.length || 0})
              </h2>
            </div>

            {venda.itensvenda && venda.itensvenda.length > 0 ? (
              <div className="border border-gray-100 rounded-lg overflow-hidden">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr className="text-xs font-semibold text-gray-500">
                      <th className="px-6 py-4">Produto</th>
                      <th className="px-6 py-4">Localização</th>
                      <th className="px-6 py-4 text-right">Quantidade</th>
                      <th className="px-6 py-4 text-right">Preço Unitário</th>
                      <th className="px-6 py-4 text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {venda.itensvenda.map((item) => (
                      <tr
                        key={`${item.fk_produto_id_produto}-${item.fk_localizacao_id}`}
                        className="hover:bg-gray-50"
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
                          {item.quantidade_vendida}
                        </td>
                        <td className="px-6 py-4 text-right text-gray-700">
                          {formatarPreco(item.preco_unitario || 0)}
                        </td>
                        <td className="px-6 py-4 text-right font-semibold text-green-600">
                          {formatarPreco(
                            (item.preco_unitario || 0) *
                              (item.quantidade_vendida || 0),
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Rodapé com total */}
                <div className="bg-gray-50 border-t border-gray-100 px-6 py-4 flex justify-end">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-gray-600">
                      Total:
                    </span>
                    <span className="text-xl font-bold text-green-600">
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
        </div>
      </main>
    </>
  );
}
