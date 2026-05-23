// Tela de Atualização de Produtos
"use client";
import { useRouter, useParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import { useAtualizarProduto } from "@/hooks/produto/useAtualizarProduto";
import {
  ArrowLeft,
  Package,
  Barcode,
  Boxes,
  Tag,
  Smartphone,
  DollarSign,
  Percent,
  Save,
  Loader2,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";

export default function AtualizarProduto() {
  const router = useRouter();
  const { id } = useParams();

  const {
    loading,
    modal,
    setModal,
    erroMsg,
    isSubmitting,
    form,
    infoSomenteLeitura,
    dropdownRef,
    sugestoesCategoria,
    selecionarCategoria,
    handleChange,
    handleSalvar,
  } = useAtualizarProduto(id);

  const inputClass =
    "w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-800 focus:ring-2 focus:ring-blue-500 outline-none";
  const inputIconClass =
    "w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-800 focus:ring-2 focus:ring-blue-500 outline-none";
  const inputDisabledClass =
    "w-full pl-9 pr-4 py-2.5 border border-gray-100 rounded-lg text-sm text-gray-400 bg-gray-50 outline-none cursor-not-allowed";

  if (loading)
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-[#f4f6fb] flex items-center justify-center">
          <p className="text-gray-400 text-sm">Carregando...</p>
        </main>
      </>
    );

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#f4f6fb] p-8 px-55">
        {/* Voltar */}
        <button
          onClick={() => router.push("/produto/gerenciar")}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Voltar para Produtos
        </button>

        <div className="flex justify-center">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 w-full max-w-2xl p-8">
            {/* Título */}
            <div className="mb-6">
              <h1 className="text-xl font-bold text-gray-800">
                Atualizar Produto
              </h1>
              <p className="text-xs text-gray-400 mt-1">
                Edite as informações do produto
              </p>
            </div>

            {/* Código - somente leitura */}
            <div className="mb-4">
              <label className="text-xs font-semibold text-gray-600 mb-1.5 block">
                Código do Produto <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <Barcode className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  value={infoSomenteLeitura.codigo_produto}
                  disabled
                  className={inputDisabledClass}
                />
              </div>
            </div>

            {/* Marca / Modelo - somente leitura | Categoria - editável */}
            <div className="grid grid-cols-3 gap-3 mb-4" ref={dropdownRef}>
              {/* Categoria - editável */}
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1.5 block">
                  Categoria <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <Boxes className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    name="nome_categoria"
                    value={form.nome_categoria}
                    onChange={handleChange}
                    placeholder="Categoria"
                    className={inputIconClass}
                  />
                  {sugestoesCategoria.length > 0 && (
                    <div className="absolute bottom-full mb-1 z-50 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-52 overflow-y-auto">
                      {sugestoesCategoria.map((c) => (
                        <button
                          key={c.id_categoria}
                          type="button"
                          onClick={() => selecionarCategoria(c)}
                          className="w-full text-left px-4 py-2 hover:bg-gray-50 border-b border-gray-100"
                        >
                          <p className="text-sm font-medium text-gray-800">
                            {c.nome}
                          </p>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Marca - somente leitura */}
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1.5 block">
                  Marca <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    value={infoSomenteLeitura.nome_marca}
                    disabled
                    className={inputDisabledClass}
                  />
                </div>
              </div>

              {/* Modelo - somente leitura */}
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1.5 block">
                  Modelo <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    value={infoSomenteLeitura.nome_modelo}
                    disabled
                    className={inputDisabledClass}
                  />
                </div>
              </div>
            </div>

            {/* Descrição */}
            <div className="mb-4">
              <label className="text-xs font-semibold text-gray-600 mb-1.5 block">
                Descrição <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <Package className="absolute left-3 top-4 text-gray-400 w-4 h-4" />
                <textarea
                  rows={4}
                  name="descricao"
                  maxLength={100}
                  value={form.descricao}
                  onChange={handleChange}
                  placeholder="Digite a descrição do produto..."
                  className="w-full pl-10 pr-4 pt-4 pb-3 border border-gray-200 rounded-lg text-sm text-gray-800 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                />
              </div>
            </div>

            {/* Estoque */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              {[
                ["estoque_atual", "Estoque Atual", true],
                ["estoque_minimo", "Estoque Mínimo", false],
                ["estoque_ideal", "Estoque Ideal", false],
              ].map(([name, label, required]) => (
                <div key={name}>
                  <label className="text-xs font-semibold text-gray-600 mb-1.5 block">
                    {label}{" "}
                    {required && <span className="text-red-400">*</span>}
                  </label>
                  <input
                    type="text"
                    name={name}
                    value={form[name]}
                    onChange={handleChange}
                    inputMode="numeric"
                    className={inputClass}
                  />
                </div>
              ))}
            </div>

            {/* Preços */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              {[
                ["preco_compra", "Preço Compra"],
                ["preco_custo", "Preço Custo"],
                ["preco_venda", "Preço Venda", true],
              ].map(([name, label]) => (
                <div key={name}>
                  <label className="text-xs font-semibold text-gray-600 mb-1.5 block">
                    {label}{" "}
                    {name === "preco_venda" && (
                      <span className="text-red-400">*</span>
                    )}
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      name={name}
                      value={form[name]}
                      onChange={handleChange}
                      placeholder="0,00"
                      className={inputIconClass}
                    />
                  </div>
                </div>
              ))}

              {/* Margem - somente leitura */}
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1.5 block">
                  Margem Lucro %
                </label>
                <div className="relative">
                  <Percent className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-500 w-4 h-4" />
                  <input
                    type="text"
                    value={form.margem_lucro}
                    readOnly
                    placeholder="-"
                    style={{ color: "#071e3d" }}
                    className="w-full pl-9 pr-4 py-2.5 border border-blue-200 rounded-lg text-sm bg-blue-50 outline-none cursor-not-allowed font-semibold"
                  />
                </div>
              </div>
            </div>

            {/* Botões */}
            <div className="flex gap-3">
              <button
                onClick={() => router.push("/produto/gerenciar")}
                className="flex-1 py-2.5 rounded-lg border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={handleSalvar}
                disabled={isSubmitting}
                className={`flex-1 flex items-center justify-center gap-2 text-white py-2.5 rounded-lg font-semibold text-sm transition-all shadow-md
                  ${isSubmitting ? "bg-blue-400 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600"}`}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Salvando...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" /> Salvar
                  </>
                )}
              </button>
            </div>
          </div>
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
            <h2 className="text-lg font-bold text-gray-800 mb-1">Sucesso!</h2>
            <p className="text-xs text-gray-400 mb-6">
              Produto atualizado com sucesso.
            </p>
            <button
              onClick={() => router.push("/produto/gerenciar")}
              className="w-full py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold text-sm transition-all"
            >
              Fechar
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
            <h2 className="text-lg font-bold text-gray-800 mb-1">
              Erro ao atualizar
            </h2>
            <p className="text-xs text-gray-400 mb-6">{erroMsg}</p>
            <button
              onClick={() => setModal(null)}
              className="w-full py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold text-sm transition-all"
            >
              Tentar novamente
            </button>
          </div>
        </div>
      )}
    </>
  );
}
