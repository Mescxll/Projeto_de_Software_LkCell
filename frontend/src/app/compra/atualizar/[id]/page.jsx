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
  DollarSign,
  Lock,
} from "lucide-react";

export default function AtualizarCompra() {
  const router = useRouter();
  const { id } = useParams();

  const {
    compra,
    fornecedores,
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

        <div className="flex flex-col gap-6 max-w-4xl mx-auto">
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
                  Valor Total
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    value={
                      compra ? formatarPreco(compra.valor_total || 0) : "-"
                    }
                    disabled
                    className={`pl-9 ${inputDisabledClass}`}
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
            <div className="flex items-center gap-2 mb-6">
              <h2 className="text-xl font-bold text-gray-800">
                Produtos ({compra.itenscompra?.length || 0})
              </h2>
              <div className="flex items-center gap-1 px-2 py-1 rounded bg-gray-100">
                <Lock className="w-3 h-3 text-gray-500" />
                <span className="text-xs text-gray-500 font-semibold">
                  Somente leitura
                </span>
              </div>
            </div>
            <p className="text-xs text-gray-400 mb-6">
              Os itens desta compra não podem ser alterados após o cadastro.
              Para modificar os produtos, cancele esta compra e crie uma nova.
            </p>

            <div className="bg-gray-50 rounded-lg overflow-hidden border border-gray-100">
              <table className="w-full text-left">
                <thead className="bg-gray-100 border-b border-gray-200">
                  <tr className="text-xs font-semibold text-gray-600">
                    <th className="px-6 py-4">Produto</th>
                    <th className="px-6 py-4">Quantidade</th>
                    <th className="px-6 py-4">Preço de Compra</th>
                    <th className="px-6 py-4 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {compra?.itenscompra && compra.itenscompra.length > 0 ? (
                    compra.itenscompra.map((item) => (
                      <tr
                        key={item.fk_produto_id_produto}
                        className="text-sm text-gray-700 hover:bg-gray-75"
                      >
                        <td className="px-6 py-4">
                          <p className="font-medium text-gray-800">
                            {item.produto?.descricao}
                          </p>
                          <p className="text-xs text-gray-400">
                            ID: {item.fk_produto_id_produto}
                          </p>
                        </td>
                        <td className="px-6 py-4 text-gray-600">
                          {item.quantidade}
                        </td>
                        <td className="px-6 py-4 text-gray-600">
                          {formatarPreco(item.preco_compra)}
                        </td>
                        <td className="px-6 py-4 text-right font-semibold text-green-600">
                          {formatarPreco(item.preco_compra * item.quantidade)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="4"
                        className="px-6 py-8 text-center text-gray-400 text-sm"
                      >
                        Nenhum produto adicionado.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Botões de Ação */}
          {compra?.status_compra !== "CANCELADA" && (
            <div className="flex gap-4 max-w-4xl">
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
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Atualizando...
                  </>
                ) : (
                  "Atualizar Compra"
                )}
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
