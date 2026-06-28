// Tela de Cadastro de Produtos
"use client";

import Navbar from "@/components/Navbar";
import { useRouter } from "next/navigation";
import { useCadastrarProduto } from "@/hooks/catalogo/produto/useCadastrarProduto";
import SearchableSelect from "@/components/SearchableSelect";

import {
  Package,
  Barcode,
  Boxes,
  Tag,
  Smartphone,
  DollarSign,
  Archive,
  Loader2,
  CheckCircle,
  AlertTriangle,
  ArrowLeft,
  Percent,
  ShieldCheck,
  Plus,
  Trash2,
} from "lucide-react";

export default function CadastroProduto() {
  const router = useRouter();

  const {
    form,
    modal,
    setModal,
    erroMsg,
    nomeProduto,
    idProdutoCriado,
    isSubmitting,
    loadingDados,
    categorias,
    marcas,
    modelos,
    handleChange,
    handleSelecionarCategoria,
    handleSelecionarMarca,
    handleSelecionarModelo,
    handleSubmit,

    // Compatibilidade
    modoCompat,
    handleTrocarModoCompat,
    compatibilidades,
    compatForm,
    modelosCompat,
    handleChangeCompatForm,
    handleAdicionarCompatibilidade,
    handleRemoverCompatibilidade,
  } = useCadastrarProduto();

  const inputIconClass =
    "w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-800 focus:ring-2 focus:ring-blue-500 outline-none";

  const opcoesCategorias = categorias.map((c) => ({
    value: c.id_categoria,
    label: c.nome,
  }));
  const opcoesMarcas = marcas.map((m) => ({
    value: m.id_marca,
    label: m.nome,
  }));
  const opcoesModelos = modelos.map((m) => ({
    value: m.id_modelo,
    label: m.nome,
  }));
  const opcoesModelosCompat = modelosCompat.map((m) => ({
    value: m.id_modelo,
    label: m.nome,
  }));

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

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-[#f4f6fb] p-8 px-55">
        <button
          onClick={() => router.push("/catalogo/produto/gerenciar")}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar para Produtos
        </button>

        <div className="flex justify-center">
          <div className="flex flex-col gap-6 w-full max-w-6xl">
            {/* Card 1 — Dados do Produto */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
              <div className="mb-6">
                <h1 className="text-xl font-bold text-gray-800">
                  Cadastrar Produto
                </h1>
                <p className="text-xs text-gray-400 mt-1">
                  Preencha as informações do novo produto
                </p>
              </div>

              {/* Código */}
              <div className="mb-4">
                <label className="text-xs font-semibold text-gray-600 mb-1.5 block">
                  Código do Produto <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <Barcode className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    name="codigo_produto"
                    placeholder="Ex: IP15PM001"
                    value={form.codigo_produto}
                    onChange={handleChange}
                    className={inputIconClass}
                  />
                </div>
              </div>

              {/* Categoria / Marca / Modelo */}
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1.5 block">
                    Categoria <span className="text-red-400">*</span>
                  </label>
                  <SearchableSelect
                    name="fk_categoria_id"
                    options={opcoesCategorias}
                    value={form.fk_categoria_id}
                    onChange={handleSelecionarCategoria}
                    placeholder="Selecione"
                    icon={<Boxes className="w-4 h-4" />}
                  />
                  {categorias.length === 0 && (
                    <p className="text-[11px] text-orange-500 mt-1">
                      Nenhuma categoria cadastrada.
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1.5 block">
                    Marca
                  </label>
                  <SearchableSelect
                    name="fk_marca_id"
                    options={opcoesMarcas}
                    value={form.fk_marca_id}
                    onChange={handleSelecionarMarca}
                    placeholder="Selecione"
                    icon={<Tag className="w-4 h-4" />}
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1.5 block">
                    Modelo
                  </label>
                  <SearchableSelect
                    name="fk_modelo_id"
                    options={opcoesModelos}
                    value={form.fk_modelo_id}
                    onChange={handleSelecionarModelo}
                    placeholder={
                      !form.fk_marca_id
                        ? "Selecione a marca primeiro"
                        : "Selecione"
                    }
                    icon={<Smartphone className="w-4 h-4" />}
                    disabled={!form.fk_marca_id}
                  />
                </div>
              </div>

              {/* Descrição */}
              <div className="mb-4">
                <label className="text-xs font-semibold text-gray-600 mb-3 block">
                  Descrição <span className="text-red-400">*</span>
                </label>
                <div className="relative mt-2">
                  <Package className="absolute left-3 top-4 text-gray-400 w-4 h-4" />
                  <textarea
                    rows={4}
                    name="descricao"
                    maxLength={100}
                    value={form.descricao}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 pt-4 pb-3 border border-gray-200 rounded-lg text-sm text-gray-800 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                    placeholder="Digite a descrição do produto (até 100 caracteres)..."
                  />
                </div>
              </div>

              {/* Preços */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  ["preco_compra", "Preço Compra"],
                  ["preco_custo", "Preço Custo"],
                  ["preco_venda", "Preço Venda"],
                ].map(([name, label]) => (
                  <div key={name}>
                    <label className="text-xs font-semibold text-gray-600 mb-1.5 block">
                      {label}{" "}
                      {(name === "preco_venda" || name === "preco_compra") && (
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
                        inputMode="decimal"
                        placeholder="0,00"
                        className={inputIconClass}
                      />
                    </div>
                    {name === "preco_compra" && (
                      <span className="text-[10px] text-gray-400 italic">
                        Preço unitário de compra do produto
                      </span>
                    )}
                    {name === "preco_venda" && (
                      <span className="text-[10px] text-gray-400 italic">
                        Preço unitário de venda do produto
                      </span>
                    )}
                    {name === "preco_custo" && (
                      <span className="text-[10px] text-gray-400 italic">
                        Preço de compra somado às despesas
                      </span>
                    )}
                  </div>
                ))}

                {/* Margem de Lucro */}
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1.5 block">
                    Margem Lucro %
                  </label>
                  <div className="relative">
                    <Percent className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-500 w-4 h-4" />
                    <input
                      type="text"
                      name="margem_lucro"
                      value={form.margem_lucro}
                      readOnly
                      placeholder="-"
                      style={{ color: "#071e3d" }}
                      className="w-full pl-9 pr-4 py-2.5 border border-blue-200 rounded-lg text-sm bg-blue-50 outline-none cursor-not-allowed font-semibold"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Card 3 — Compatibilidade */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
              <div className="flex items-center gap-3 mb-1">
                <div className="w-9 h-9 rounded-xl bg-blue-600/80 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-4.5 h-4.5 text-white" />
                </div>
                <h2 className="text-lg font-bold text-gray-800">
                  Compatibilidade
                </h2>
              </div>
              <p className="text-xs text-gray-400 mb-5 ml-12">
                Defina com quais marcas e modelos este produto é compatível
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
                <button
                  type="button"
                  onClick={() => handleTrocarModoCompat("especificas")}
                  className={`text-left p-3.5 rounded-lg border transition-all ${
                    modoCompat === "especificas"
                      ? "border-blue-400 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <p
                    className={`text-sm font-semibold ${modoCompat === "especificas" ? "text-blue-700" : "text-gray-700"}`}
                  >
                    Marcas específicas
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Compatível só com o que for adicionado
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => handleTrocarModoCompat("todas")}
                  className={`text-left p-3.5 rounded-lg border transition-all ${
                    modoCompat === "todas"
                      ? "border-blue-400 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <p
                    className={`text-sm font-semibold ${modoCompat === "todas" ? "text-blue-700" : "text-gray-700"}`}
                  >
                    Todas as marcas
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Compatível com tudo, exceto exceções
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => handleTrocarModoCompat("universal")}
                  className={`text-left p-3.5 rounded-lg border transition-all ${
                    modoCompat === "universal"
                      ? "border-blue-400 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <p
                    className={`text-sm font-semibold ${modoCompat === "universal" ? "text-blue-700" : "text-gray-700"}`}
                  >
                    Universal
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Compatível com todas as marcas e modelos
                  </p>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-3 mb-3">
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1.5 block">
                    Marca
                  </label>
                  <SearchableSelect
                    name="compat_fk_marca_id"
                    options={opcoesMarcas}
                    value={compatForm.fk_marca_id}
                    onChange={(val) =>
                      handleChangeCompatForm("fk_marca_id", val)
                    }
                    placeholder="Selecione"
                    icon={<Tag className="w-4 h-4" />}
                    disabled={marcas.length === 0 || modoCompat === "universal"}
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1.5 block">
                    Modelo
                  </label>
                  <SearchableSelect
                    name="compat_fk_modelo_id"
                    options={opcoesModelosCompat}
                    value={compatForm.fk_modelo_id}
                    onChange={(val) =>
                      handleChangeCompatForm("fk_modelo_id", val)
                    }
                    placeholder={
                      !compatForm.fk_marca_id
                        ? "Selecione a marca"
                        : "Todos os modelos"
                    }
                    icon={<Smartphone className="w-4 h-4" />}
                    disabled={
                      !compatForm.fk_marca_id || modoCompat === "universal"
                    }
                  />
                </div>

                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={handleAdicionarCompatibilidade}
                    disabled={
                      !compatForm.fk_marca_id || modoCompat === "universal"
                    }
                    className="w-full sm:w-auto flex items-center justify-center gap-1.5 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-4 py-2.5 rounded-lg font-semibold text-sm transition-all"
                  >
                    <Plus className="w-4 h-4" /> Adicionar
                  </button>
                </div>
              </div>

              <div className="mb-5">
                <input
                  disabled={modoCompat === "universal"}
                  type="text"
                  placeholder="Observação (opcional)"
                  value={compatForm.observacao}
                  onChange={(e) =>
                    handleChangeCompatForm("observacao", e.target.value)
                  }
                  maxLength={200}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg text-xs text-gray-700 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <p className="text-xs font-semibold text-gray-600 mb-2">
                  {modoCompat === "todas"
                    ? "Exceções (não compatível com)"
                    : modoCompat === "universal"
                      ? "Nenhuma exceção — compatível com tudo"
                      : "Compatível com"}
                </p>
                {compatibilidades.length === 0 ? (
                  <p className="text-xs text-gray-400 border border-dashed border-gray-200 rounded-lg py-4 text-center">
                    {modoCompat === "universal"
                      ? "✓ Compatível com todas as marcas e modelos sem exceções"
                      : "Nenhuma entrada adicionada ainda"}
                  </p>
                ) : (
                  <div className="flex flex-col gap-2">
                    {compatibilidades.map((c) => (
                      <div
                        key={`${c.fk_marca_id}-${c.fk_modelo_id}`}
                        className="flex items-center justify-between bg-gray-50 border border-gray-100 rounded-lg px-3.5 py-2.5"
                      >
                        <div className="flex items-center gap-2 text-sm">
                          <span className="font-semibold text-gray-700">
                            {c.marcaNome}
                          </span>
                          <span className="text-gray-300">•</span>
                          <span className="text-gray-500">{c.modeloNome}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            handleRemoverCompatibilidade(
                              c.fk_marca_id,
                              c.fk_modelo_id,
                            )
                          }
                          className="text-red-400 hover:text-red-600 transition-colors"
                          title="Remover"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Botões */}
            <div className="flex gap-4 w-full mt-1">
              <button
                onClick={() => router.push("/catalogo/produto/gerenciar")}
                className="flex-1 flex justify-center py-2.5 rounded-lg border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-all bg-white"
              >
                Cancelar
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className={`flex-1 flex items-center justify-center gap-2 text-white py-2.5 rounded-lg font-semibold text-sm transition-all shadow-md
                  ${isSubmitting ? "bg-green-400 cursor-not-allowed" : "bg-green-500 hover:bg-green-600"}`}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Processando...
                  </>
                ) : (
                  <>
                    <Archive className="w-4 h-4" />
                    Cadastrar
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
            <h2 className="text-lg font-bold text-gray-800 mb-1">
              Produto cadastrado!
            </h2>
            <p className="text-sm text-blue-500 font-medium mb-2">
              {nomeProduto}
            </p>
            <p className="text-xs text-gray-400 mb-6">
              Deseja configurar o estoque inicial agora?
            </p>
            <div className="flex flex-col gap-2">
              <button
                onClick={() =>
                  router.push(`/estoque/cadastrar?produto=${idProdutoCriado}`)
                }
                className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-semibold text-sm transition-all"
              >
                Ir para Estoque
              </button>
              <button
                onClick={() => router.push("/compra/cadastrar")}
                className="w-full py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold text-sm transition-all"
              >
                Registrar uma Compra
              </button>
              <button
                onClick={() => router.push("/catalogo/produto/gerenciar")}
                className="w-full py-2.5 bg-white border border-gray-200 text-gray-500 rounded-lg text-sm hover:bg-gray-50 transition-all"
              >
                Agora não
              </button>
            </div>
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
              Erro ao cadastrar produto
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

      {/* Modal Erro Parcial */}
      {modal === "erro-parcial" && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-sm text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center">
                <AlertTriangle className="w-9 h-9 text-orange-500" />
              </div>
            </div>
            <h2 className="text-lg font-bold text-gray-800 mb-1">
              Produto cadastrado com pendências
            </h2>
            <p className="text-xs text-gray-500 mb-6">{erroMsg}</p>
            <button
              onClick={() => router.push("/catalogo/produto/gerenciar")}
              className="w-full py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-semibold text-sm transition-all"
            >
              Entendi, ir para Produtos
            </button>
          </div>
        </div>
      )}
    </>
  );
}
