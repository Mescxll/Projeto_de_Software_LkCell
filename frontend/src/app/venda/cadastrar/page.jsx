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
  MapPin,
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
    estoquesPorLocalizacao,
    loadingEstoque,
    estoqueDisponivel,
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

  // Limite de quantidade baseado no estoque da localização selecionada
  const qtdExcedida =
    estoqueDisponivel !== null &&
    itemForm.quantidade_vendida !== "" &&
    parseInt(itemForm.quantidade_vendida) > estoqueDisponivel;

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

        <div className="flex flex-col gap-6 max-w-5xl mx-auto">
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
              {/* Cliente — SearchableSelect */}
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1.5 block">
                  Cliente <span className="text-red-400">*</span>
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

              {/* Status de Pagamento */}
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

            {/* Grid de adição de item */}
            <div className="grid grid-cols-1 md:grid-cols-6 gap-3 mb-4">
              {/* Produto */}
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
                      fk_localizacao_id: "",
                      quantidade_vendida: "",
                    });
                  }}
                  placeholder="Selecione"
                  icon={<Package className="w-4 h-4" />}
                />
              </div>

              {/* Localização — aparece após selecionar produto */}
              <div className="md:col-span-2">
                <label className="text-xs font-semibold text-gray-600 mb-1.5 block">
                  Localização <span className="text-red-400">*</span>
                </label>

                {/* Estado: nenhum produto selecionado */}
                {!itemForm.fk_produto_id_produto && (
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 w-4 h-4" />
                    <select
                      disabled
                      className="w-full pl-9 px-4 py-2.5 border border-gray-100 rounded-lg text-sm text-gray-300 bg-gray-50 outline-none cursor-not-allowed"
                    >
                      <option>Selecione um produto primeiro</option>
                    </select>
                  </div>
                )}

                {/* Estado: carregando estoque */}
                {itemForm.fk_produto_id_produto && loadingEstoque && (
                  <div className="flex items-center gap-2 px-4 py-2.5 border border-gray-100 rounded-lg bg-gray-50">
                    <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                    <span className="text-sm text-gray-400">
                      Consultando estoque...
                    </span>
                  </div>
                )}

                {/* Estado: sem estoque em nenhuma localização */}
                {itemForm.fk_produto_id_produto &&
                  !loadingEstoque &&
                  estoquesPorLocalizacao.length === 0 && (
                    <div className="flex items-center gap-2 px-4 py-2.5 border border-orange-200 rounded-lg bg-orange-50">
                      <AlertTriangle className="w-4 h-4 text-orange-400 shrink-0" />
                      <span className="text-sm text-orange-600">
                        Sem estoque disponível
                      </span>
                    </div>
                  )}

                {/* Estado: localizações disponíveis */}
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
                        <option value="">Selecione a localização</option>
                        {estoquesPorLocalizacao.map((loc) => (
                          <option
                            key={loc.id_localizacao}
                            value={loc.id_localizacao}
                          >
                            {loc.localizacao} ({loc.estoque_atual} disponíveis)
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
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
                {/* Indicador de estoque disponível / excedido */}
                {itemForm.fk_localizacao_id && estoqueDisponivel !== null && (
                  <p
                    className={`text-xs mt-1 ${
                      qtdExcedida ? "text-red-500" : "text-gray-400"
                    }`}
                  >
                    {qtdExcedida
                      ? `Excede o estoque (máx. ${estoqueDisponivel})`
                      : `Disponível: ${estoqueDisponivel}`}
                  </p>
                )}
              </div>

              {/* Preço Unitário */}
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1.5 block">
                  Preço Unit.
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

              {/* Subtotal — ocupa a linha inteira em mobile, inline em md */}
              <div className="md:col-span-3">
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
              <div className="md:col-span-3 flex items-end">
                <button
                  onClick={handleAddItem}
                  disabled={
                    !itemForm.fk_produto_id_produto ||
                    !itemForm.fk_localizacao_id ||
                    !itemForm.quantidade_vendida ||
                    qtdExcedida ||
                    estoquesPorLocalizacao.length === 0
                  }
                  className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-3 py-2.5 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 text-sm"
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
                      <th className="px-4 py-3">Localização</th>
                      <th className="px-4 py-3 text-right">Quantidade</th>
                      <th className="px-4 py-3 text-right">Preço Unitário</th>
                      <th className="px-4 py-3 text-right">Subtotal</th>
                      <th className="px-4 py-3 text-center">Ação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {form.itens.map((item) => (
                      <tr
                        key={`${item.fk_produto_id_produto}-${item.fk_localizacao_id}`}
                        className="hover:bg-gray-50"
                      >
                        <td className="px-4 py-3">
                          <p className="font-medium text-gray-800">
                            {item.produtoNome}
                          </p>
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                            <MapPin className="w-3 h-3" />
                            {item.localizacaoNome}
                          </span>
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
                              handleRemoveItem(
                                item.fk_produto_id_produto,
                                item.fk_localizacao_id,
                              )
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
