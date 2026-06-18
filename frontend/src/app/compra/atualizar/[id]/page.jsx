// Tela de Atualização de Compras
"use client";
import { useRouter, useParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import SearchableSelect from "@/components/SearchableSelect";
import { useAtualizarCompra } from "@/hooks/compra/useAtualizarCompra";
import {
  ArrowLeft,
  CheckCircle,
  AlertTriangle,
  Loader2,
  Truck,
  Calendar,
  Trash2,
  Plus,
  Save,
  Package,
  DollarSign,
  MapPin,
} from "lucide-react";

export default function AtualizarCompra() {
  const router = useRouter();
  const { id } = useParams();

  const {
    compra,
    fornecedores,
    produtos,
    loading,
    erroMsg,
    isSubmitting,
    modal,
    setModal,
    modalCancelar,
    setModalCancelar,
    isCancelling,
    modalSucessoCancelamento,
    form,
    setForm,
    handleChange,
    handleSubmit,
    handleCancelarCompra,
    formatarPreco,
    formatarData,
    itens,
    localizacoes,
    itemForm,
    handleChangeItem,
    handleAdicionarItem,
    handleRemoverItem,
    handleChangeQuantidade,
  } = useAtualizarCompra(id);

  if (loading) {
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
  const opcoesFornecedores = fornecedores.map((f) => ({
    value: f.id_fornecedor,
    label: f.razao_social,
  }));

  const inputClass =
    "w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-800 focus:ring-2 focus:ring-blue-500 outline-none";

  const inputDisabledClass =
    "w-full px-4 py-2.5 border border-gray-100 rounded-lg text-sm text-gray-400 bg-gray-50 outline-none cursor-not-allowed";

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

        <div className="flex flex-col gap-6 max-w-5xl mx-auto">
          {/* Seção 1: Informações Básicas */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <h2 className="text-xl font-bold text-gray-800 mb-6">
              Atualizar Compra {compra?.id_compra}
            </h2>

            {/* Status da Compra */}
            <div className="mb-6 pb-6 border-b border-gray-100">
              <div
                className="inline-flex items-center justify-center px-3 py-1.5 rounded-full border"
                style={
                  compra?.status_compra === "CANCELADA"
                    ? {
                        backgroundColor: "#fef2f2",
                        color: "#dc2626",
                        borderColor: "#fca5a5",
                      }
                    : {
                        backgroundColor: "#f0fdf4",
                        color: "#16a34a",
                        borderColor: "#bbf7d0",
                      }
                }
              >
                <span className="text-[11px] font-semibold">
                  {compra?.status_compra === "CANCELADA"
                    ? "Compra Cancelada"
                    : "Compra Ativa"}
                </span>
              </div>

              {compra?.status_compra === "CANCELADA" && (
                <p className="text-xs text-red-600 mt-3">
                  ⚠️ Esta compra foi cancelada. Não é possível fazer alterações.
                </p>
              )}
            </div>

            {/* Linha 1: Data/Hora e Valor Total */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 pb-6 border-b border-gray-100">
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1.5 block">
                  Data/Hora da Compra
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    value={compra ? formatarData(compra.data_hora) : "-"}
                    disabled
                    className={`pl-9 ${inputDisabledClass}`}
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
                    value={
                      compra ? formatarPreco(compra.valor_total || 0) : "-"
                    }
                    disabled
                    className="w-full pl-4 pr-4 py-2.5 border border-blue-100 rounded-lg text-sm font-bold text-blue-600 bg-blue-50 outline-none cursor-not-allowed"
                  />
                </div>
              </div>
            </div>

            {/* Linha 2: Fornecedor e Prazo de Entrega */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Fornecedor — SearchableSelect */}
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1.5 block">
                  Fornecedor <span className="text-red-400">*</span>
                </label>
                {compra?.status_compra === "CANCELADA" ? (
                  <div className="relative">
                    <Truck className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      value={compra.fornecedor?.razao_social || "-"}
                      disabled
                      className={`pl-9 ${inputDisabledClass}`}
                    />
                  </div>
                ) : (
                  <SearchableSelect
                    name="fk_fornecedor_id_fornecedor"
                    options={opcoesFornecedores}
                    value={form.fk_fornecedor_id_fornecedor}
                    onChange={(val) =>
                      setForm({ ...form, fk_fornecedor_id_fornecedor: val })
                    }
                    placeholder="Selecione um fornecedor"
                    icon={<Truck className="w-4 h-4" />}
                  />
                )}
              </div>

              {/* Prazo de Entrega (Opcional) */}
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1.5 block">
                  Prazo de Entrega
                </label>
                {compra?.status_compra === "CANCELADA" ? (
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      value={
                        compra.prazo_entrega
                          ? formatarData(compra.prazo_entrega)
                          : "-"
                      }
                      disabled
                      className={`pl-9 ${inputDisabledClass}`}
                    />
                  </div>
                ) : (
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="date"
                      name="prazo_entrega"
                      value={form.prazo_entrega}
                      onChange={handleChange}
                      className={`pl-9 ${inputClass}`}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Status da Compra */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <h2 className="text-xl font-bold text-gray-800 mb-1">
              Status da Compra
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
                      compra?.status_compra === "CANCELADA"
                        ? "text-red-600"
                        : "text-green-600"
                    }
                  >
                    {compra?.status_compra === "CANCELADA"
                      ? "Cancelada"
                      : "Ativa"}
                  </span>
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {compra?.status_compra === "CANCELADA"
                    ? "Esta compra já foi cancelada e não pode ser modificada."
                    : "Cancelar a compra estornará o estoque de todos os produtos."}
                </p>
              </div>

              <button
                onClick={() => setModalCancelar(true)}
                disabled={compra?.status_compra === "CANCELADA" || isCancelling}
                className="flex items-center gap-2 bg-red-500 hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-5 py-2.5 rounded-lg font-semibold transition-all text-sm"
              >
                {isCancelling && <Loader2 className="w-4 h-4 animate-spin" />}
                Cancelar Compra
              </button>
            </div>
          </div>

          {/* Seção 2: Produtos (Somente Leitura) */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <div className="flex items-center gap-2 mb-1">
              <Package className="w-5 h-5 text-gray-400" />
              <h2 className="text-xl font-bold text-gray-800">
                Produtos ({itens.length})
              </h2>
            </div>
            <p className="text-xs text-gray-400 mb-6">
              Adicione, remova ou ajuste as quantidades dos produtos desta
              compra.
            </p>

            {/* Formulário de adição — só aparece se não estiver cancelada */}
            {compra?.status_compra !== "CANCELADA" && (
              <>
                {/* Linha 1: Produto e Localização */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="text-xs font-semibold text-gray-600 mb-1.5 block">
                      Produto <span className="text-red-400">*</span>
                    </label>
                    <SearchableSelect
                      name="fk_produto_id_produto"
                      options={produtos.map((p) => ({
                        value: p.id_produto,
                        label: p.descricao || p.codigo_produto,
                      }))}
                      value={itemForm.fk_produto_id_produto}
                      onChange={(val) =>
                        handleChangeItem({
                          target: { name: "fk_produto_id_produto", value: val },
                        })
                      }
                      placeholder="Selecione um produto"
                      icon={<Package className="w-4 h-4" />}
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-600 mb-1.5 block">
                      Localização <span className="text-red-400">*</span>
                    </label>
                    <SearchableSelect
                      name="fk_localizacao_id"
                      options={localizacoes.map((l) => ({
                        value: l.id_localizacao,
                        label: l.localizacao,
                      }))}
                      value={itemForm.fk_localizacao_id}
                      onChange={(val) =>
                        handleChangeItem({
                          target: { name: "fk_localizacao_id", value: val },
                        })
                      }
                      icon={<MapPin className="w-4 h-4" />}
                    />
                  </div>
                </div>

                {/* Linha 2: Quantidade, Preço, Subtotal e Botão */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-6">
                  <div>
                    <label className="text-xs font-semibold text-gray-600 mb-1.5 block">
                      Qtd. <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      name="quantidade"
                      placeholder="0"
                      value={itemForm.quantidade}
                      onChange={handleChangeItem}
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-600 mb-1.5 block">
                      Preço de Compra <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="text"
                        name="preco_compra"
                        placeholder="0,00"
                        value={itemForm.preco_compra}
                        disabled
                        className={`pl-9 ${inputDisabledClass}`}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-600 mb-1.5 block">
                      Subtotal
                    </label>
                    <input
                      type="text"
                      value={
                        itemForm.preco_compra && itemForm.quantidade
                          ? formatarPreco(
                              Number(
                                itemForm.preco_compra
                                  .replace(/\./g, "")
                                  .replace(",", "."),
                              ) * parseInt(itemForm.quantidade),
                            )
                          : "—"
                      }
                      disabled
                      className={inputDisabledClass}
                    />
                  </div>

                  <div className="flex items-end">
                    <button
                      onClick={handleAdicionarItem}
                      className="w-full bg-blue-500 hover:bg-blue-600 text-white px-3 py-2.5 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 text-sm"
                    >
                      <Plus className="w-4 h-4" /> Adicionar
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* Tabela de itens */}
            {itens.length > 0 ? (
              <div className="border border-gray-100 rounded-lg overflow-hidden">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr className="text-xs font-semibold text-gray-500">
                      <th className="px-4 py-3">Produto</th>
                      <th className="px-4 py-3">Localização</th>
                      <th className="px-4 py-3 text-right">Quantidade</th>
                      <th className="px-4 py-3 text-right">Preço de Compra</th>
                      <th className="px-4 py-3 text-right">Subtotal</th>
                      {compra?.status_compra !== "CANCELADA" && (
                        <th className="px-4 py-3 text-center">Ação</th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {itens.map((item) => (
                      <tr
                        key={`${item.fk_produto_id_produto}-${item.fk_localizacao_id}`}
                        className="hover:bg-gray-50"
                      >
                        <td className="px-4 py-3 font-medium text-gray-800">
                          {item.produto?.descricao || "—"}
                        </td>
                        <td className="px-4 py-3">
                          {item.localizacaoNome &&
                          item.localizacaoNome !== "—" ? (
                            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full">
                              <MapPin className="w-3 h-3" />
                              {item.localizacaoNome}
                            </span>
                          ) : (
                            <span className="text-gray-400 text-xs">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          {compra?.status_compra === "CANCELADA" ? (
                            <span className="font-medium text-gray-700">
                              {item.quantidade}
                            </span>
                          ) : (
                            <input
                              type="number"
                              min="1"
                              value={item.quantidade}
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
                        <td className="px-4 py-3 text-right text-gray-700">
                          {formatarPreco(item.preco_compra)}
                        </td>
                        <td className="px-4 py-3 text-right font-semibold text-blue-600">
                          {formatarPreco(
                            item.preco_compra * (item.quantidade || 0),
                          )}
                        </td>
                        {compra?.status_compra !== "CANCELADA" && (
                          <td className="px-4 py-3 text-center">
                            <button
                              onClick={() =>
                                handleRemoverItem(
                                  item.fk_produto_id_produto,
                                  item.fk_localizacao_id,
                                )
                              }
                              className="inline-flex items-center justify-center p-1.5 rounded-md text-red-500 hover:bg-red-50 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="bg-gray-50 border-t border-gray-100 px-4 py-4 flex justify-end">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-gray-600">
                      Total:
                    </span>
                    <span className="text-xl font-bold text-blue-600">
                      {formatarPreco(
                        itens.reduce(
                          (acc, i) =>
                            acc + i.preco_compra * (i.quantidade || 0),
                          0,
                        ),
                      )}
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

          {/* Botões de Ação */}
          {compra?.status_compra !== "CANCELADA" && (
            <div className="flex gap-4 justify-end w-full">
              <button
                onClick={() => router.push("/compra/gerenciar")}
                className="flex-1 py-3 rounded-lg border border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50 transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-semibold text-sm text-white transition-all ${
                  isSubmitting
                    ? "bg-blue-400 cursor-not-allowed"
                    : "bg-blue-500 hover:bg-blue-600"
                }`}
              >
                {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                <Save className="w-4 h-4" /> Atualizar Compra
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Modal Sucesso */}
      {modal === "sucesso" && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-sm text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="w-9 h-9 text-green-500" />
              </div>
            </div>
            <h2 className="text-lg font-bold text-gray-800 mb-2">Sucesso!</h2>
            <p className="text-sm text-gray-500 mb-6">
              A compra foi atualizada com sucesso!
            </p>
            <button
              onClick={() => router.push("/compra/gerenciar")}
              className="w-full py-2.5 rounded-lg bg-green-500 hover:bg-green-600 text-white text-sm font-semibold transition-all"
            >
              Voltar para Compras
            </button>
          </div>
        </div>
      )}

      {/* Modal Erro */}
      {modal === "erro" && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-sm text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle className="w-9 h-9 text-red-500" />
              </div>
            </div>
            <h2 className="text-lg font-bold text-gray-800 mb-2">Erro!</h2>
            <p className="text-sm text-gray-500 mb-6">{erroMsg}</p>
            <button
              onClick={() => setModal(null)}
              className="w-full py-2.5 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold transition-all"
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
              Cancelar Compra?
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
                onClick={handleCancelarCompra}
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
              Compra Cancelada!
            </h2>
            <p className="text-sm text-gray-600 mb-6">
              A compra foi cancelada e o estoque foi estornado com sucesso.
            </p>
            <button
              onClick={() => router.push("/compra/gerenciar")}
              className="w-full bg-green-500 hover:bg-green-600 text-white py-2.5 rounded-lg font-semibold transition-all"
            >
              Voltar para Compras
            </button>
          </div>
        </div>
      )}
    </>
  );
}
