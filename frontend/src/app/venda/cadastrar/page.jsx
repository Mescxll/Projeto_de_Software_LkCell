// Tela de Cadastro de Vendas
"use client";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import SearchableSelect from "@/components/SearchableSelect";
import { useCadastrarVenda } from "@/hooks/venda/useCadastrarVenda";
import {
  ArrowLeft,
  Plus,
  Trash2,
  CheckCircle,
  AlertTriangle,
  Loader2,
  DollarSign,
  Users,
  Package,
  Calendar,
} from "lucide-react";

export default function CadastroVenda() {
  const router = useRouter();

  const {
    clientes,
    funcionarios,
    produtos,
    modal,
    setModal,
    erroMsg,
    isSubmitting,
    loadingDados,
    form,
    setForm,
    itemForm,
    setItemForm,
    handleChange,
    handleChangeItem,
    handleAddItem,
    handleRemoveItem,
    handleSubmit,
    formatarPreco,
    calcularTotal,
  } = useCadastrarVenda();

  if (loadingDados) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-[#f4f6fb] flex items-center justify-center">
          <p className="text-gray-400 text-sm">
            Carregando dados do sistema...
          </p>
        </main>
      </>
    );
  }

  // Converte arrays em formato { value, label } para o SearchableSelect
  const opcoesClientes = clientes.map((c) => ({
    value: c.id_cliente,
    label: `${c.nome} (ID: ${c.id_cliente})`,
  }));

  const opcoesFuncionarios = funcionarios.map((f) => ({
    value: f.id_funcionario,
    label: f.nome,
  }));

  const opcoesProdutos = produtos.map((p) => ({
    value: p.id_produto,
    label: p.descricao,
  }));
  const selectClass =
    "w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-800 focus:ring-2 focus:ring-blue-500 outline-none bg-white";

  const inputClass =
    "w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-800 focus:ring-2 focus:ring-blue-500 outline-none";

  const vencimentoBloqueado = form.status_pagamento === "PAGO";
  const vencimentoClass = vencimentoBloqueado
    ? "w-full pl-9 pr-4 py-2.5 border border-gray-100 rounded-lg text-sm text-gray-400 bg-gray-50 outline-none cursor-not-allowed"
    : `pl-9 ${inputClass}`;

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

        <div className="flex flex-col gap-6 max-w-4xl mx-auto">
          {/* Seção 1: Informações Básicas */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <h2 className="text-xl font-bold text-gray-800 mb-6">
              Informações da Venda
            </h2>

            {/* Linha 1: Data/Hora e Valor Total */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 pb-6 border-b border-gray-100">
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1.5 block">
                  Data/Hora
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    value={new Date().toLocaleString("pt-BR", {
                      timeZone: "America/Sao_Paulo",
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                    disabled
                    className="w-full pl-9 pr-4 py-2.5 border border-gray-100 rounded-lg text-sm text-gray-400 bg-gray-50 outline-none cursor-not-allowed"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1.5 block">
                  Valor Total <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formatarPreco(calcularTotal())}
                    disabled
                    className="w-full pl-4 pr-4 py-2.5 border border-gray-100 rounded-lg text-sm font-bold text-green-600 bg-green-50 outline-none cursor-not-allowed"
                  />
                </div>
              </div>
            </div>

            {/* Linha 2: Cliente, Funcionário, Status Pagamento */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 pb-6 border-b border-gray-100">
              {/* Cliente (Opcional) — SearchableSelect */}
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1.5 block">
                  Cliente
                </label>
                <SearchableSelect
                  name="fk_cliente_id_cliente"
                  options={opcoesClientes}
                  value={form.fk_cliente_id_cliente}
                  onChange={(val) =>
                    setForm({ ...form, fk_cliente_id_cliente: val })
                  }
                  placeholder="Selecione um cliente"
                  icon={<Users className="w-4 h-4" />}
                />
              </div>

              {/* Funcionário (Obrigatório) — SearchableSelect */}
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1.5 block">
                  Funcionário <span className="text-red-400">*</span>
                </label>
                <SearchableSelect
                  name="fk_funcionario_id_funcionario"
                  options={opcoesFuncionarios}
                  value={form.fk_funcionario_id_funcionario}
                  onChange={(val) =>
                    setForm({ ...form, fk_funcionario_id_funcionario: val })
                  }
                  placeholder="Selecione um funcionário"
                  icon={<Users className="w-4 h-4" />}
                />
              </div>

              {/* Status de Pagamento — select simples (só 2 opções) */}
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1.5 block">
                  Status Pagamento <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <select
                    name="status_pagamento"
                    value={form.status_pagamento}
                    onChange={handleChange}
                    className={`pl-9 ${selectClass}`}
                  >
                    <option value="EM_ABERTO">Em Aberto</option>
                    <option value="PAGO">Pago</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Data de Vencimento */}
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1.5 block">
                Data de Vencimento
              </label>
              <div className="relative max-w-sm">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="date"
                  name="data_vencimento"
                  value={form.data_vencimento}
                  onChange={handleChange}
                  disabled={vencimentoBloqueado}
                  className={vencimentoClass}
                />
              </div>
            </div>
          </div>

          {/* Seção 2: Produtos */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <h2 className="text-xl font-bold text-gray-800 mb-1">Produtos</h2>
            <p className="text-xs text-gray-400 mb-6">
              Adicione os produtos que serão vendidos
            </p>

            <div className="grid grid-cols-1 md:grid-cols-6 gap-3 mb-4">
              {/* Produto — SearchableSelect */}
              <div className="md:col-span-2">
                <label className="text-xs font-semibold text-gray-600 mb-1.5 block">
                  Produto <span className="text-red-400">*</span>
                </label>
                <SearchableSelect
                  name="fk_produto_id_produto"
                  options={opcoesProdutos}
                  value={itemForm.fk_produto_id_produto}
                  onChange={(val) => {
                    const produtoSelecionado = produtos.find(
                      (p) => p.id_produto === parseInt(val),
                    );
                    setItemForm({
                      ...itemForm,
                      fk_produto_id_produto: val,
                      preco_unitario: produtoSelecionado?.preco_venda || "",
                    });
                  }}
                  placeholder="Selecione"
                  icon={<Package className="w-4 h-4" />}
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
                  className={inputClass}
                />
              </div>

              {/* Preço Unitário */}
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1.5 block">
                  Preço Unit. <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={
                    itemForm.preco_unitario
                      ? formatarPreco(itemForm.preco_unitario)
                      : "-"
                  }
                  disabled
                  className="w-full px-3 py-2.5 border border-gray-100 rounded-lg text-sm text-gray-400 bg-gray-50 outline-none cursor-not-allowed"
                />
              </div>

              {/* Subtotal */}
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1.5 block">
                  Subtotal
                </label>
                <input
                  type="text"
                  value={
                    itemForm.preco_unitario && itemForm.quantidade_vendida
                      ? formatarPreco(
                          itemForm.preco_unitario *
                            parseInt(itemForm.quantidade_vendida),
                        )
                      : "-"
                  }
                  disabled
                  className="w-full px-3 py-2.5 border border-gray-100 rounded-lg text-sm text-gray-400 bg-gray-50 outline-none cursor-not-allowed"
                />
              </div>

              {/* Botão Adicionar */}
              <div className="flex items-end">
                <button
                  onClick={handleAddItem}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white px-3 py-2.5 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 text-sm"
                >
                  <Plus className="w-4 h-4" /> Adicionar
                </button>
              </div>
            </div>

            {/* Lista de Itens */}
            {form.itens.length > 0 ? (
              <div className="border border-gray-100 rounded-lg overflow-hidden">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr className="text-xs font-semibold text-gray-500">
                      <th className="px-4 py-3">Produto</th>
                      <th className="px-4 py-3 text-right">Quantidade</th>
                      <th className="px-4 py-3 text-right">Preço Unitário</th>
                      <th className="px-4 py-3 text-right">Subtotal</th>
                      <th className="px-4 py-3 text-center">Ação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {form.itens.map((item) => (
                      <tr
                        key={item.fk_produto_id_produto}
                        className="hover:bg-gray-50"
                      >
                        <td className="px-4 py-3">
                          <p className="font-medium text-gray-800">
                            {item.produtoNome}
                          </p>
                        </td>
                        <td className="px-4 py-3 text-right font-medium text-gray-700">
                          {item.quantidade_vendida}
                        </td>
                        <td className="px-4 py-3 text-right text-gray-700">
                          {formatarPreco(item.preco_unitario)}
                        </td>
                        <td className="px-4 py-3 text-right font-semibold text-green-600">
                          {formatarPreco(
                            item.preco_unitario * item.quantidade_vendida,
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() =>
                              handleRemoveItem(item.fk_produto_id_produto)
                            }
                            className="inline-flex items-center justify-center p-1.5 rounded-md transition-colors text-red-500 hover:bg-red-50"
                            title="Remover item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="bg-gray-50 border-t border-gray-100 px-4 py-4 flex justify-end">
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
                Nenhum item adicionado. Adicione produtos para continuar.
              </p>
            )}
          </div>

          {/* Botões de Ação */}
          <div className="flex gap-3 justify-end">
            <button
              onClick={() => router.push("/venda/gerenciar")}
              className="px-6 py-2.5 border border-gray-200 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-all"
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || form.itens.length === 0}
              className="flex items-center gap-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white px-6 py-2.5 rounded-lg font-semibold transition-all text-sm"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              Cadastrar Venda
            </button>
          </div>
        </div>
      </main>

      {/* Modal de Sucesso */}
      {modal === "sucesso" && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-sm text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="w-9 h-9 text-green-500" />
              </div>
            </div>
            <h2 className="text-lg font-bold text-gray-800 mb-2">
              Venda Cadastrada!
            </h2>
            <p className="text-sm text-gray-600 mb-6">
              A venda foi registrada com sucesso no sistema.
            </p>
            <button
              onClick={() => router.push("/venda/gerenciar")}
              className="w-full bg-green-500 hover:bg-green-600 text-white py-2.5 rounded-lg font-semibold transition-all"
            >
              Voltar 
            </button>
          </div>
        </div>
      )}

      {/* Modal de Erro */}
      {modal === "erro" && (
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
              onClick={() => setModal(null)}
              className="w-full bg-red-500 hover:bg-red-600 text-white py-2.5 rounded-lg font-semibold transition-all"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </>
  );
}
