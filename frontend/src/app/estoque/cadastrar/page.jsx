"use client";

import Navbar from "@/components/Navbar";
import { useRouter, useSearchParams } from "next/navigation";
import { useCadastrarEstoqueInicial } from "@/hooks/estoque/useCadastrarEstoqueInicial";
import SearchableSelect from "@/components/SearchableSelect";
import { blockNonNumericKeys } from "@/lib/blockNonNumericKeys";
import {
  ArrowLeft,
  WarehouseIcon,
  MapPin,
  Plus,
  Trash2,
  CheckCircle,
  AlertTriangle,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Suspense } from "react";

function CadastrarEstoqueInicialInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const produtoIdInicial = searchParams.get("produto") ?? "";

  const {
    produtos,
    localizacoes,
    loadingDados,
    modal,
    setModal,
    erroMsg,
    isSubmitting,
    form,
    estoqueEntradas,
    estoqueAtualTotal,
    estoqueForm,
    handleChange,
    handleSelecionarProduto,
    handleChangeEstoqueForm,
    handleAdicionarEntrada,
    handleRemoverEntrada,
    handleSubmit,
  } = useCadastrarEstoqueInicial(produtoIdInicial);

  const inputClass =
    "w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-800 focus:ring-2 focus:ring-blue-500 outline-none";

  const opcoesProdutos = produtos.map((p) => ({
    value: p.id_produto,
    label: p.descricao || p.codigo_produto,
  }));

  const opcoesLocalizacoes = localizacoes.map((l) => ({
    value: l.id_localizacao,
    label: l.localizacao,
  }));

  const opcoesLocalizacoesDisponiveis = opcoesLocalizacoes.filter(
    (opt) => !estoqueEntradas.some((e) => e.fk_localizacao_id === opt.value),
  );

  if (loadingDados) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-[#f4f6fb] flex items-center justify-center">
          <p className="text-gray-400 text-sm">Carregando dados do sistema...</p>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#f4f6fb] p-8 px-55">
        <button
          onClick={() => router.push("/estoque/gerenciar")}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar para Estoque
        </button>

        <div className="flex justify-center">
          <div className="flex flex-col gap-6 w-full max-w-6xl">

            {/* Card — Produto */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
              <div className="mb-6">
                <h1 className="text-xl font-bold text-gray-800">
                  Cadastrar Estoque Inicial
                </h1>
                <p className="text-xs text-gray-400 mt-1">
                  Disponível apenas para produtos que ainda não possuem registros de estoque
                </p>
              </div>

              <label className="text-xs font-semibold text-gray-600 mb-1.5 block">
                Produto <span className="text-red-400">*</span>
              </label>
              <SearchableSelect
                name="fk_produto_id"
                options={opcoesProdutos}
                value={form.fk_produto_id}
                onChange={handleSelecionarProduto}
                placeholder="Selecione um produto"
                icon={<WarehouseIcon className="w-4 h-4" />}
              />

              {/* Aviso: produto já tem estoque */}
              {modal === "ja_tem_estoque" && (
                <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg p-3 mt-3">
                  <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-amber-700">
                      Este produto já possui estoque registrado.
                    </p>
                    <p className="text-xs text-amber-600 mt-0.5">
                      Para movimentar a quantidade use{" "}
                      <button
                        onClick={() => router.push("/estoque/gerenciar")}
                        className="underline font-medium"
                      >
                        Transferência
                      </button>{" "}
                      ou registre uma{" "}
                      <button
                        onClick={() => router.push("/compra/cadastrar")}
                        className="underline font-medium"
                      >
                        Compra
                      </button>
                      .
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Card — Estoque (só renderiza se produto selecionado e sem estoque) */}
            {form.fk_produto_id && modal !== "ja_tem_estoque" && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                <div className="flex items-center gap-3 mb-1">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/90 flex items-center justify-center shrink-0">
                    <WarehouseIcon className="w-4.5 h-4.5 text-white" />
                  </div>
                  <h2 className="text-lg font-bold text-gray-800">Estoque</h2>
                </div>
                <p className="text-xs text-gray-400 mb-6 ml-12">
                  Defina os limites de estoque e distribua a quantidade inicial por localização
                </p>

                {/* Mínimo e Ideal */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                  <div>
                    <label className="text-xs font-semibold text-gray-600 mb-1.5 block">
                      Estoque Mínimo <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="number"
                      name="estoque_minimo"
                      value={form.estoque_minimo}
                      onChange={handleChange}
                      onKeyDown={blockNonNumericKeys}
                      inputMode="numeric"
                      pattern="[0-9]*"
                      placeholder="0"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-600 mb-1.5 block">
                      Estoque Ideal <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="number"
                      name="estoque_ideal"
                      value={form.estoque_ideal}
                      onChange={handleChange}
                      onKeyDown={blockNonNumericKeys}
                      inputMode="numeric"
                      pattern="[0-9]*"
                      placeholder="0"
                      className={inputClass}
                    />
                  </div>
                </div>

                <div className="border-t border-gray-100 mb-6" />

                <p className="text-xs font-semibold text-gray-600 mb-3">
                  Estoque Inicial por Localização
                </p>

                <div className="grid grid-cols-[1fr_auto_auto] gap-3 mb-4 items-end">
                  <div>
                    <label className="text-xs font-semibold text-gray-600 mb-1.5 block">
                      Localização
                    </label>
                    <SearchableSelect
                      name="estoque_fk_localizacao_id"
                      options={opcoesLocalizacoesDisponiveis}
                      value={estoqueForm.fk_localizacao_id}
                      onChange={(val) =>
                        handleChangeEstoqueForm("fk_localizacao_id", val)
                      }
                      placeholder={
                        localizacoes.length === 0
                          ? "Nenhuma localização cadastrada"
                          : opcoesLocalizacoesDisponiveis.length === 0
                            ? "Todas as localizações adicionadas"
                            : "Selecione"
                      }
                      icon={<MapPin className="w-4 h-4" />}
                      disabled={opcoesLocalizacoesDisponiveis.length === 0}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-600 mb-1.5 block">
                      Quantidade
                    </label>
                    <input
                      type="number"
                      value={estoqueForm.quantidade}
                      onChange={(e) =>
                        handleChangeEstoqueForm(
                          "quantidade",
                          e.target.value.replace(/\D/g, ""),
                        )
                      }
                      onKeyDown={blockNonNumericKeys}
                      inputMode="numeric"
                      placeholder="0"
                      className="w-28 px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-800 focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleAdicionarEntrada}
                    disabled={opcoesLocalizacoesDisponiveis.length === 0}
                    className="flex items-center gap-1.5 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-4 py-2.5 rounded-lg font-semibold text-sm transition-all"
                  >
                    <Plus className="w-4 h-4" /> Adicionar
                  </button>
                </div>

                {estoqueEntradas.length > 0 ? (
                  <div className="border border-gray-100 rounded-lg overflow-hidden">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-gray-50 border-b border-gray-100">
                        <tr className="text-xs font-semibold text-gray-500">
                          <th className="px-4 py-3">Localização</th>
                          <th className="px-4 py-3 text-right">Quantidade</th>
                          <th className="px-4 py-3 text-center w-16">Ação</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {estoqueEntradas.map((entrada) => (
                          <tr key={entrada.fk_localizacao_id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 font-medium text-gray-700">
                              {entrada.localizacaoNome}
                            </td>
                            <td className="px-4 py-3 text-right font-semibold text-gray-800">
                              {entrada.quantidade}
                            </td>
                            <td className="px-4 py-3 text-center">
                              <button
                                type="button"
                                onClick={() =>
                                  handleRemoverEntrada(entrada.fk_localizacao_id)
                                }
                                className="inline-flex items-center justify-center p-1.5 rounded-md text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                                title="Remover"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <div className="bg-gray-50 border-t border-gray-100 px-4 py-3 flex justify-end items-center gap-3">
                      <span className="text-xs font-semibold text-gray-500">
                        Estoque Inicial Total:
                      </span>
                      <span className="text-lg font-bold text-emerald-600">
                        {estoqueAtualTotal} unid.
                      </span>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-gray-400 border border-dashed border-gray-200 rounded-lg py-5 text-center">
                    {localizacoes.length === 0
                      ? "Nenhuma localização cadastrada."
                      : "Adicione ao menos uma localização com quantidade."}
                  </p>
                )}
              </div>
            )}

            {/* Botões */}
            {form.fk_produto_id && modal !== "ja_tem_estoque" && (
              <div className="flex gap-4 w-full mt-2">
                <button
                  onClick={() => router.push("/estoque/gerenciar")}
                  className="flex-1 flex justify-center py-2.5 rounded-lg border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-all bg-white"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className={`flex-1 flex items-center justify-center gap-2 text-white py-2.5 rounded-lg font-semibold text-sm transition-all shadow-md ${
                    isSubmitting
                      ? "bg-emerald-400 cursor-not-allowed"
                      : "bg-emerald-500 hover:bg-emerald-600"
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <WarehouseIcon className="w-4 h-4" />
                      Cadastrar Estoque
                    </>
                  )}
                </button>
              </div>
            )}
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
              Estoque cadastrado!
            </h2>
            <p className="text-xs text-gray-400 mb-6">
              O estoque inicial foi registrado com sucesso.
            </p>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => router.push("/estoque/gerenciar")}
                className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-semibold text-sm transition-all"
              >
                Ver Estoque
              </button>
              <button
                onClick={() => setModal(null)}
                className="w-full py-2.5 bg-white border border-gray-200 text-gray-500 rounded-lg text-sm hover:bg-gray-50 transition-all"
              >
                Cadastrar outro produto
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
              Erro ao cadastrar estoque
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

export default function CadastrarEstoquePage() {
  return (
    <Suspense>
      <CadastrarEstoqueInicialInner />
    </Suspense>
  );
}