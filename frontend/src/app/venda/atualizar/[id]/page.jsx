// Tela de Atualização de Venda
"use client";
import { useRouter, useParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import { useAtualizarVenda } from "@/hooks/venda/useAtualizarVenda";
import SearchableSelect from "@/components/SearchableSelect";
import {
  ArrowLeft,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Loader2,
  Save,
  User,
  Trash2,
  Plus,
  Package,
  MapPin,
} from "lucide-react";

export default function AtualizarVenda() {
  const router = useRouter();
  const { id } = useParams();

  const {
    loading,
    venda,
    erro,
    statusPagamentoNovo,
    setStatusPagamentoNovo,
    dataVencimento,
    setDataVencimento,
    itens,
    produtos,
    itemForm,
    estoquesPorLocalizacao,
    loadingEstoque,
    estoqueDisponivel,
    modalConfirmar,
    setModalConfirmar,
    modalCancelar,
    setModalCancelar,
    modalSucesso,
    modalSucessoCancelamento,
    modalErro,
    setModalErro,
    erroMsg,
    isSubmitting,
    isCancelling,
    calcularTotal,
    handleChangeItem,
    handleChangeQuantidade,
    handleRemoverItem,
    handleAdicionarItem,
    handleSalvar,
    handleConfirmar,
    handleCancelarVenda,
    formatarPreco,
    formatarData,
  } = useAtualizarVenda(parseInt(id));

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

  const selectClass =
    "w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-800 focus:ring-2 focus:ring-blue-500 outline-none bg-white";
  const inputClass =
    "w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-800 focus:ring-2 focus:ring-blue-500 outline-none bg-white";

  const statusPagamentoColor =
    venda.status_pagamento === "PAGO"
      ? { bg: "#f0fdf4", text: "#16a34a", border: "#bbf7d0" }
      : { bg: "#fefce8", text: "#a16207", border: "#fde047" };

  const statusVendaColor =
    venda.status_venda === "CANCELADA"
      ? { bg: "#fef2f2", text: "#dc2626", border: "#fca5a5" }
      : { bg: "#f0fdf4", text: "#16a34a", border: "#bbf7d0" };

  // Limite de quantidade baseado no estoque da localização selecionada para o form de adição
  const qtdExcedida =
    estoqueDisponivel !== null &&
    itemForm.quantidade_vendida !== "" &&
    parseInt(itemForm.quantidade_vendida) > estoqueDisponivel;

  const opcoesProdutos = produtos.map((p) => ({
    value: p.id_produto,
    label: p.descricao || p.codigo_produto, // Boa prática: deixar um fallback robusto
  }));

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#f4f6fb] p-8 px-55">
        <button
          onClick={() => router.push("/venda/gerenciar")}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Voltar para Vendas
        </button>

        <div className="flex flex-col gap-6 max-w-5xl mx-auto w-full">
          {/* Cabeçalho */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  Atualizar Venda {venda.id_venda}
                </h1>
                <p className="text-sm text-gray-400 mt-1">
                  {formatarData(venda.data_hora)}
                </p>
              </div>
              <div className="flex gap-2">
                <span
                  className="inline-flex items-center justify-center px-3 py-1.5 rounded-full border text-[11px] font-semibold"
                  style={{
                    backgroundColor: statusVendaColor.bg,
                    color: statusVendaColor.text,
                    borderColor: statusVendaColor.border,
                  }}
                >
                  {venda.status_venda === "CANCELADA"
                    ? "Cancelada"
                    : "Efetuada"}
                </span>
              </div>
            </div>

            {venda.status_venda === "CANCELADA" && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex gap-3">
                <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-red-900">
                    Venda Cancelada
                  </p>
                  <p className="text-xs text-red-700 mt-1">
                    Esta venda foi cancelada e não pode ser modificada. Qualquer
                    alteração requer o cadastro de uma nova venda.
                  </p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 pb-6 border-b border-gray-100">
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-2 block">
                  Cliente  <span className="text-red-400">*</span>
                </label>
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <User className="w-4 h-4 text-gray-400" />
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

              <div>
                <label className="text-xs font-semibold text-gray-600 mb-2 block">
                  Funcionário  <span className="text-red-400">*</span>
                </label>
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <User className="w-4 h-4 text-gray-400" />
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

              <div>
                <label className="text-xs font-semibold text-gray-600 mb-2 block">
                  Data de Vencimento
                </label>
                {venda.status_pagamento === "PAGO" ? (
                  /* Se estiver PAGO, mostra a caixinha de aviso simulando um input bloqueado */
                  <div className="w-full px-4 py-2.5 border border-gray-100 rounded-lg text-sm font-medium text-green-700 bg-green-50 flex items-center gap-2 cursor-not-allowed">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Venda já paga
                  </div>
                ) : (
                  /* Se estiver EM_ABERTO, mostra o input de data normal */
                  <input
                    type="date"
                    value={dataVencimento}
                    onChange={(e) => setDataVencimento(e.target.value)}
                    disabled={venda.status_venda === "CANCELADA"}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-800 focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed"
                  />
                )}
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-600 mb-2 block">
                  Valor Total
                </label>
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <p className="text-lg font-bold text-green-600">
                    {formatarPreco(calcularTotal())}
                  </p>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-600 mb-2 block">
                  Status Pagamento Atual
                </label>
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <span
                    className="inline-flex items-center justify-center px-3 py-1.5 rounded-full border text-[11px] font-semibold"
                    style={{
                      backgroundColor: statusPagamentoColor.bg,
                      color: statusPagamentoColor.text,
                      borderColor: statusPagamentoColor.border,
                    }}
                  >
                    {venda.status_pagamento === "PAGO" ? "Pago" : "Em Aberto"}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1.5 block">
                Novo Status de Pagamento <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <select
                  value={statusPagamentoNovo}
                  onChange={(e) => setStatusPagamentoNovo(e.target.value)}
                  disabled={venda.status_venda === "CANCELADA"}
                  className={`pl-9 ${selectClass} ${
                    venda.status_venda === "CANCELADA"
                      ? "bg-gray-50 cursor-not-allowed"
                      : ""
                  }`}
                >
                  {venda.status_pagamento === "PAGO" ? (
                    <>
                      <option value="PAGO">Pago</option>
                    </>
                  ) : (
                    <>
                      <option value="EM_ABERTO">Em Aberto</option>
                      <option value="PAGO">Pago</option>
                    </>
                  )}
                </select>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <h2 className="text-xl font-bold text-gray-800 mb-1">
              Status da Venda
            </h2>
            <p className="text-xs text-gray-400 mb-6">
              O cancelamento é irreversível e estornará o estoque
              automaticamente.
            </p>

            <div className="flex items-center justify-between p-4 rounded-lg border border-gray-100 bg-gray-50">
              <div>
                <p className="text-sm font-semibold text-gray-700">
                  Situação atual:{" "}
                  <span
                    className={
                      venda.status_venda === "CANCELADA"
                        ? "text-red-600"
                        : "text-green-600"
                    }
                  >
                    {venda.status_venda === "CANCELADA"
                      ? "Cancelada"
                      : "Efetuada"}
                  </span>
                </p>
              </div>

              <button
                onClick={() => setModalCancelar(true)}
                disabled={venda.status_venda === "CANCELADA" || isCancelling}
                className="flex items-center gap-2 bg-red-500 hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-5 py-2.5 rounded-lg font-semibold transition-all text-sm"
              >
                {isCancelling && <Loader2 className="w-4 h-4 animate-spin" />}
                Cancelar Venda
              </button>
            </div>
          </div>
          {/* Produtos */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-gray-400" />
                <h2 className="text-xl font-bold text-gray-800">
                  Produtos ({itens.length})
                </h2>
              </div>
            </div>
            <p className="text-xs text-gray-400 mb-6">
              Adicione, remova ou ajuste as quantidades dos produtos desta
              venda.
            </p>

            {/* Adicionar produto */}
            {venda.status_venda !== "CANCELADA" && (
              <div className="mb-6">
                <div className="grid grid-cols-1 md:grid-cols-6 gap-3 mb-3">
                  {/* Produto */}
                  <div className="md:col-span-2">
                    <label className="text-xs font-semibold text-gray-600 mb-1.5 block">
                      Produto <span className="text-red-400">*</span>
                    </label>
                    <SearchableSelect
                      name="fk_produto_id_produto"
                      options={opcoesProdutos}
                      value={itemForm.fk_produto_id_produto}
                      placeholder="Selecione um produto..."
                      icon={<Package className="w-4 h-4" />}
                      onChange={(val) =>
                        handleChangeItem({
                          target: { name: "fk_produto_id_produto", value: val },
                        })
                      }
                    />
                  </div>

                  {/* Localização */}
                  <div className="md:col-span-2">
                    <label className="text-xs font-semibold text-gray-600 mb-1.5 block">
                      Localização <span className="text-red-400">*</span>
                    </label>

                    {!itemForm.fk_produto_id_produto && (
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 w-4 h-4" />
                        <select
                          disabled
                          className="w-full pl-9 px-4 py-2.5 border border-gray-100 rounded-lg text-sm text-gray-300 bg-gray-50 outline-none cursor-not-allowed"
                        >
                          <option>Selecione um produto</option>
                        </select>
                      </div>
                    )}

                    {itemForm.fk_produto_id_produto && loadingEstoque && (
                      <div className="flex items-center gap-2 px-4 py-2.5 border border-gray-100 rounded-lg bg-gray-50">
                        <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                        <span className="text-sm text-gray-400">
                          Consultando...
                        </span>
                      </div>
                    )}

                    {itemForm.fk_produto_id_produto &&
                      !loadingEstoque &&
                      estoquesPorLocalizacao.length === 0 && (
                        <div className="flex items-center gap-2 px-4 py-2.5 border border-orange-200 rounded-lg bg-orange-50">
                          <AlertTriangle className="w-4 h-4 text-orange-400 shrink-0" />
                          <span className="text-sm text-orange-600">
                            Sem estoque
                          </span>
                        </div>
                      )}

                    {itemForm.fk_produto_id_produto &&
                      !loadingEstoque &&
                      estoquesPorLocalizacao.length > 0 && (
                        <div className="relative">
                          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                          <select
                            name="fk_localizacao_id"
                            value={itemForm.fk_localizacao_id}
                            onChange={handleChangeItem}
                            className={`pl-9 ${selectClass}`}
                          >
                            <option value="">Selecione...</option>
                            {estoquesPorLocalizacao.map((loc) => (
                              <option
                                key={loc.id_localizacao}
                                value={loc.id_localizacao}
                              >
                                {loc.localizacao} ({loc.estoque_atual} disp.)
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                  </div>

                  {/* Preço Unitário — read-only, preenchido ao selecionar produto */}
                  <div>
                    <label className="text-xs font-semibold text-gray-600 mb-1.5 block">
                      Preço Unit. <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      readOnly
                      value={
                        itemForm.preco_unitario
                          ? formatarPreco(itemForm.preco_unitario)
                          : ""
                      }
                      placeholder="R$ 0,00"
                      className="w-full px-4 py-2.5 border border-gray-100 rounded-lg text-sm text-gray-500 bg-gray-50 outline-none cursor-default"
                    />
                  </div>

                  {/* Quantidade */}
                  <div>
                    <label className="text-xs font-semibold text-gray-600 mb-1.5 block">
                      Qtd. <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      name="quantidade_vendida"
                      placeholder="0"
                      value={itemForm.quantidade_vendida}
                      onChange={handleChangeItem}
                      disabled={!itemForm.fk_localizacao_id}
                      className={
                        !itemForm.fk_localizacao_id
                          ? "w-full px-4 py-2.5 border border-gray-100 rounded-lg text-sm text-gray-300 bg-gray-50 outline-none cursor-not-allowed"
                          : qtdExcedida
                            ? "w-full px-4 py-2.5 border border-red-300 rounded-lg text-sm text-red-700 bg-red-50 focus:ring-2 focus:ring-red-400 outline-none"
                            : inputClass
                      }
                    />
                    {itemForm.fk_localizacao_id &&
                      estoqueDisponivel !== null && (
                        <p
                          className={`text-xs mt-1 ${qtdExcedida ? "text-red-500" : "text-gray-400"}`}
                        >
                          {qtdExcedida
                            ? `Excede o estoque (máx. ${estoqueDisponivel})`
                            : `Disponível: ${estoqueDisponivel}`}
                        </p>
                      )}
                  </div>
                </div>

                {/* Botão abaixo à esquerda */}
                <div className="flex justify-start">
                  <button
                    onClick={handleAdicionarItem}
                    disabled={
                      !itemForm.fk_produto_id_produto ||
                      !itemForm.fk_localizacao_id ||
                      !itemForm.quantidade_vendida ||
                      qtdExcedida ||
                      estoquesPorLocalizacao.length === 0
                    }
                    className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-4 py-2.5 rounded-lg font-semibold transition-all text-sm"
                  >
                    <Plus className="w-4 h-4" /> Adicionar
                  </button>
                </div>
              </div>
            )}

            {itens.length > 0 ? (
              <div className="border border-gray-100 rounded-lg overflow-hidden">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr className="text-xs font-semibold text-gray-500">
                      <th className="px-6 py-4">Produto</th>
                      <th className="px-6 py-4">Localização</th>
                      <th className="px-6 py-4 text-right">Quantidade</th>
                      <th className="px-6 py-4 text-right">Preço Unitário</th>
                      <th className="px-6 py-4 text-right">Subtotal</th>
                      {venda.status_venda !== "CANCELADA" && (
                        <th className="px-6 py-4 text-center">Ação</th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {itens.map((item) => (
                      <tr
                        key={`${item.fk_produto_id_produto}-${item.fk_localizacao_id}`}
                        className="hover:bg-gray-50"
                      >
                        <td className="px-6 py-4">
                          <p className="font-semibold text-gray-800">
                            {item.produto?.descricao ||
                              item.produto?.nome ||
                              "—"}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full">
                            <MapPin className="w-3 h-3" />
                            {item.localizacao}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          {venda.status_venda === "CANCELADA" ? (
                            <span className="font-medium text-gray-800">
                              {item.quantidade_vendida}
                            </span>
                          ) : (
                            <input
                              type="number"
                              min="1"
                              value={item.quantidade_vendida}
                              onChange={(e) =>
                                handleChangeQuantidade(
                                  item.fk_produto_id_produto,
                                  item.fk_localizacao_id,
                                  e.target.value,
                                )
                              }
                              className="w-20 px-2 py-1.5 border border-gray-200 rounded-lg text-sm text-right text-gray-800 focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                          )}
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
                        {venda.status_venda !== "CANCELADA" && (
                          <td className="px-6 py-4 text-center">
                            <button
                              onClick={() =>
                                handleRemoverItem(
                                  item.fk_produto_id_produto,
                                  item.fk_localizacao_id,
                                )
                              }
                              className="inline-flex items-center justify-center p-1.5 rounded-md text-red-500 hover:bg-red-50 transition-colors"
                              title="Remover item"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="bg-gray-50 border-t border-gray-100 px-6 py-4 flex justify-end">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-gray-600">
                      Total:
                    </span>
                    <span className="text-xl font-bold text-green-600">
                      {formatarPreco(calcularTotal())}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-400 text-center py-8">
                Nenhum produto adicionado.
              </p>
            )}
          </div>
          <div className="flex gap-3 justify-end mb-8 w-full">
            <button
              onClick={() => router.push(`/venda/gerenciar`)}
              className="flex-1 py-2.5 border border-gray-200 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-all"
            >
              Cancelar
            </button>
            <button
              onClick={handleSalvar}
              disabled={
                isSubmitting ||
                !statusPagamentoNovo ||
                venda.status_venda === "CANCELADA"
              }
              className="flex-1 flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white py-2.5 rounded-lg font-semibold transition-all text-sm"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              <Save className="w-4 h-4" /> Atualizar Venda
            </button>
          </div>
        </div>
      </main>

      {/* Modal Confirmar Atualização */}
      {modalConfirmar && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-sm text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
                <AlertTriangle className="w-9 h-9 text-blue-500" />
              </div>
            </div>
            <h2 className="text-lg font-bold text-gray-800 mb-2">
              Confirmar Atualização
            </h2>
            <p className="text-sm text-gray-600 mb-6">
              Tem certeza que deseja atualizar essa venda?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setModalConfirmar(false)}
                disabled={isSubmitting}
                className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-all disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmar}
                disabled={isSubmitting}
                className="flex-1 flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white px-4 py-2.5 rounded-lg font-semibold transition-all text-sm"
              >
                {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
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
              Atualizado com Sucesso!
            </h2>
            <p className="text-sm text-gray-600 mb-6">
              Os dados da venda foram atualizados.
            </p>
            <button
              onClick={() => router.push(`/venda/gerenciar`)}
              className="w-full bg-green-500 hover:bg-green-600 text-white py-2.5 rounded-lg font-semibold transition-all"
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
            <p className="text-sm text-gray-600 mb-6">{erroMsg}</p>
            <button
              onClick={() => setModalErro(false)}
              className="w-full bg-red-500 hover:bg-red-600 text-white py-2.5 rounded-lg font-semibold transition-all"
            >
              Fechar
            </button>
          </div>
        </div>
      )}

      {/* Modal Confirmar Cancelamento */}
      {modalCancelar && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-sm text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle className="w-9 h-9 text-red-500" />
              </div>
            </div>
            <h2 className="text-lg font-bold text-gray-800 mb-2">
              Cancelar Venda?
            </h2>
            <p className="text-sm text-gray-600 mb-6">
              Esta ação é <strong>irreversível</strong>. O estoque de todos os
              produtos será estornado automaticamente.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setModalCancelar(false)}
                disabled={isCancelling}
                className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-all disabled:opacity-50"
              >
                Voltar
              </button>
              <button
                onClick={handleCancelarVenda}
                disabled={isCancelling}
                className="flex-1 flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 disabled:bg-gray-300 text-white px-4 py-2.5 rounded-lg font-semibold transition-all text-sm"
              >
                {isCancelling && <Loader2 className="w-4 h-4 animate-spin" />}
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Sucesso Cancelamento */}
      {modalSucessoCancelamento && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-sm text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="w-9 h-9 text-green-500" />
              </div>
            </div>
            <h2 className="text-lg font-bold text-gray-800 mb-2">
              Venda Cancelada!
            </h2>
            <p className="text-sm text-gray-600 mb-6">
              A venda foi cancelada e o estoque foi estornado com sucesso.
            </p>
            <button
              onClick={() => router.push("/venda/gerenciar")}
              className="w-full bg-green-500 hover:bg-green-600 text-white py-2.5 rounded-lg font-semibold transition-all"
            >
              Voltar para Vendas
            </button>
          </div>
        </div>
      )}
    </>
  );
}
