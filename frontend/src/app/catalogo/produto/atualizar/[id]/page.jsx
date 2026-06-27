// Tela de Atualização de Produtos
"use client";
import { useRouter, useParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import { useAtualizarProduto } from "@/hooks/catalogo/produto/useAtualizarProduto";
import { useCompatibilidadeProduto } from "@/hooks/catalogo/produto/useCompatibilidadeProduto";
import SearchableSelect from "@/components/SearchableSelect";

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
  ShieldCheck,
  Plus,
  Trash2,
} from "lucide-react";

export default function AtualizarProduto() {
  const router = useRouter();
  const { id } = useParams();

  const {
    loading,
    loadingDados,
    modal,
    setModal,
    erroMsg,
    isSubmitting,
    form,
    codigoProduto,
    estoqueAtual,
    categorias,
    marcas,
    modelos,
    handleChange,
    handleSelecionarCategoria,
    handleSelecionarMarca,
    handleSelecionarModelo,
    handleSalvar,
  } = useAtualizarProduto(id);

  const {
    carregando: carregandoCompat,
    modoCompat,
    compatibilidades,
    marcas: marcasCompat,
    modelosCompat,
    compatForm,
    handleChangeCompatForm,
    solicitarTrocaModo,
    cancelarTrocaModo,
    confirmarTrocaModo,
    modalConfirmarModo,
    isTrocandoModo,
    handleAdicionarCompatibilidade,
    handleRemoverCompatibilidade,
    isSalvandoEntrada,
    idRemovendo,
    erroMsg: erroMsgCompat,
    modalErro: modalErroCompat,
    setModalErro: setModalErroCompat,
  } = useCompatibilidadeProduto(id);

  const inputIconClass =
    "w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-800 focus:ring-2 focus:ring-blue-500 outline-none";
  const inputDisabledClass =
    "w-full pl-9 pr-4 py-2.5 border border-gray-100 rounded-lg text-sm text-gray-400 bg-gray-50 outline-none cursor-not-allowed";
  const inputDisabledNoIconClass =
    "w-full px-4 py-2.5 border border-gray-100 rounded-lg text-sm text-gray-400 bg-gray-50 outline-none cursor-not-allowed";

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
  const opcoesMarcasCompat = marcasCompat.map((m) => ({
    value: m.id_marca,
    label: m.nome,
  }));
  const opcoesModelosCompat = modelosCompat.map((m) => ({
    value: m.id_modelo,
    label: m.nome,
  }));

  if (loading || loadingDados)
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-[#f4f6fb] flex items-center justify-center">
          <p className="text-gray-400 text-sm">Carregando Produto...</p>
        </main>
      </>
    );

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#f4f6fb] p-8 px-55">
        {/* Voltar */}
        <button
          onClick={() => router.push("/catalogo/produto/gerenciar")}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Voltar para Produtos
        </button>

        <div className="flex justify-center">
          <div className="flex flex-col gap-6 w-full max-w-6xl">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
              {/* Título */}
              <div className="mb-6">
                <h1 className="text-xl font-bold text-gray-800">
                  Atualizar Produto
                </h1>
                <p className="text-xs text-gray-400 mt-1">
                  Edite as informações do produto
                </p>
              </div>

              {/* Código - somente leitura (não muda após o cadastro) */}
              <div className="mb-4">
                <label className="text-xs font-semibold text-gray-600 mb-1.5 block">
                  Código do Produto <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <Barcode className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    value={codigoProduto}
                    disabled
                    className={inputDisabledClass}
                  />
                </div>
              </div>

              {/* Categoria / Marca / Modelo — agora editáveis via SearchableSelect */}
              <div className="grid grid-cols-3 gap-3 mb-4">
                {/* Categoria */}
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
                </div>

                {/* Marca — editável, filtra o select de Modelo */}
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

                {/* Modelo — editável, depende de Marca */}
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
                  {form.fk_marca_id && modelos.length === 0 && (
                    <p className="text-[11px] text-orange-500 mt-1">
                      Esta marca não possui modelos cadastrados.
                    </p>
                  )}
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

              {/* Estoque — somente leitura */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-gray-600">
                    Estoque
                  </label>
                  <span className="text-[10px] text-gray-400 italic">
                    Gerenciado pelo módulo de estoque
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    ["Estoque Atual", estoqueAtual.estoque_atual],
                    ["Estoque Mínimo", estoqueAtual.estoque_minimo],
                    ["Estoque Ideal", estoqueAtual.estoque_ideal],
                  ].map(([label, valor]) => (
                    <div key={label}>
                      <label className="text-xs text-gray-500 mb-1 block">
                        {label}
                      </label>
                      <input
                        type="text"
                        value={valor}
                        disabled
                        className={inputDisabledNoIconClass}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Preços */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                {[
                  ["preco_compra", "Preço Compra"],
                  ["preco_custo", "Preço Custo"],
                  ["preco_venda", "Preço Venda"],
                ].map(([name, label]) => (
                  <div key={name}>
                    <label className="text-xs font-semibold text-gray-600 mb-1.5 block">
                      {label}{" "}
                      {(name === "preco_compra" || name === "preco_venda") && (
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
            </div>

            {/* Card — Compatibilidade */}
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
                Alterações nesta seção são salvas imediatamente
              </p>

              {carregandoCompat ? (
                <p className="text-sm text-gray-400 text-center py-4">
                  Carregando compatibilidades...
                </p>
              ) : (
                <>
                  {/* Modo: todas as marcas vs específicas */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
                    <button
                      type="button"
                      onClick={() => solicitarTrocaModo("especificas")}
                      disabled={isTrocandoModo}
                      className={`text-left p-3.5 rounded-lg border transition-all disabled:opacity-60 ${
                        modoCompat === "especificas"
                          ? "border-blue-400 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <p
                        className={`text-sm font-semibold ${modoCompat === "especificas" ? "text-blue-700" : "text-gray-700"}`}
                      >
                        Marcas - Modelos Específicos
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Compatível só com o que for adicionado
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => solicitarTrocaModo("todas")}
                      disabled={isTrocandoModo}
                      className={`text-left p-3.5 rounded-lg border transition-all disabled:opacity-60 ${
                        modoCompat === "todas"
                          ? "border-blue-400 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <p
                        className={`text-sm font-semibold ${modoCompat === "todas" ? "text-blue-700" : "text-gray-700"}`}
                      >
                        Todas as Marcas - Modelos
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Compatível com tudo, exceto exceções
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => solicitarTrocaModo("universal")}
                      disabled={isTrocandoModo}
                      className={`text-left p-3.5 rounded-lg border transition-all disabled:opacity-60 ${
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

                  {/* Formulário de adicionar entrada */}
                  <div className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-3 mb-3">
                    <div>
                      <label className="text-xs font-semibold text-gray-600 mb-1.5 block">
                        Marca
                      </label>
                      <SearchableSelect
                        name="compat_fk_marca_id"
                        options={opcoesMarcasCompat}
                        value={compatForm.fk_marca_id}
                        onChange={(val) =>
                          handleChangeCompatForm("fk_marca_id", val)
                        }
                        placeholder="Selecione"
                        icon={<Tag className="w-4 h-4" />}
                        disabled={
                          marcasCompat.length === 0 ||
                          isSalvandoEntrada ||
                          modoCompat === "universal"
                        }
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
                          !compatForm.fk_marca_id ||
                          isSalvandoEntrada ||
                          modoCompat === "universal"
                        }
                      />
                    </div>

                    <div className="flex items-end">
                      <button
                        type="button"
                        onClick={handleAdicionarCompatibilidade}
                        disabled={
                          !compatForm.fk_marca_id ||
                          isSalvandoEntrada ||
                          modoCompat === "universal"
                        }
                        className="w-full sm:w-auto flex items-center justify-center gap-1.5 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-4 py-2.5 rounded-lg font-semibold text-sm transition-all"
                      >
                        {isSalvandoEntrada ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Plus className="w-4 h-4" />
                        )}
                        Adicionar
                      </button>
                    </div>
                  </div>

                  {/* Observação opcional */}
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

                  {/* Lista de entradas */}
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
                            key={c.id_compatibilidade}
                            className="flex items-center justify-between bg-gray-50 border border-gray-100 rounded-lg px-3.5 py-2.5"
                          >
                            <div className="flex items-center gap-2 text-sm">
                              <span className="font-semibold text-gray-700">
                                {c.marca?.nome ?? c.modelo?.marca?.nome ?? "—"}
                              </span>
                              <span className="text-gray-300">•</span>
                              <span className="text-gray-500">
                                {c.modelo?.nome ?? "(todos os modelos)"}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() =>
                                handleRemoverCompatibilidade(
                                  c.id_compatibilidade,
                                )
                              }
                              disabled={idRemovendo === c.id_compatibilidade}
                              className="text-red-400 hover:text-red-600 transition-colors disabled:opacity-50"
                              title="Remover"
                            >
                              {idRemovendo === c.id_compatibilidade ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Trash2 className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Botões */}
            <div className="flex gap-3">
              <button
                onClick={() => router.push("/catalogo/produto/gerenciar")}
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
              onClick={() => router.push("/catalogo/produto/gerenciar")}
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
      {/* Modal Confirmar Troca de Modo — Compatibilidade */}
      {modalConfirmarModo !== null && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-sm text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-yellow-100 flex items-center justify-center">
                <AlertTriangle className="w-9 h-9 text-yellow-500" />
              </div>
            </div>
            <h2 className="text-lg font-bold text-gray-800 mb-2">
              Confirmar alteração
            </h2>
            <p className="text-sm text-gray-500 mb-6">
              {modalConfirmarModo === "universal"
                ? "Ao mudar para Universal, todas as exceções cadastradas serão removidas. Deseja continuar?"
                : modalConfirmarModo === "todas"
                  ? "Ao mudar para Todas as marcas, as inclusões cadastradas serão removidas. Deseja continuar?"
                  : "Ao mudar para Marcas específicas, as exceções cadastradas serão removidas. Deseja continuar?"}
            </p>
            <div className="flex gap-3">
              <button
                onClick={cancelarTrocaModo}
                disabled={isTrocandoModo}
                className="flex-1 py-2.5 border border-gray-200 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-all disabled:opacity-60"
              >
                Cancelar
              </button>
              <button
                onClick={confirmarTrocaModo}
                disabled={isTrocandoModo}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-yellow-500 hover:bg-yellow-600 disabled:opacity-60 text-white rounded-lg font-semibold text-sm transition-all"
              >
                {isTrocandoModo && <Loader2 className="w-4 h-4 animate-spin" />}
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Erro — Compatibilidade */}
      {modalErroCompat && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-sm text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle className="w-9 h-9 text-red-500" />
              </div>
            </div>
            <h2 className="text-lg font-bold text-gray-800 mb-2">Erro</h2>
            <p className="text-sm text-gray-500 mb-6">{erroMsgCompat}</p>
            <button
              onClick={() => setModalErroCompat(false)}
              className="w-full py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold text-sm transition-all"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </>
  );
}
