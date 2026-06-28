"use client";

import { Settings, X, Info, CheckCircle2, AlertCircle, AlertTriangle } from "lucide-react";
import { useAjustarParametrosEstoque } from "@/hooks/estoque/useAjustarParametrosEstoque";

export default function ModalAjustarParametros({ produto, onClose, onSuccess }) {
  const {
    form,
    modal,
    erroMsg,
    isSubmitting,
    ajustesQuantidade,
    handleChange,
    handleChangeAjuste,
    handleSubmit,
  } = useAjustarParametrosEstoque(produto, onSuccess);

  if (!produto) return null;

  const temLocalizacoes = ajustesQuantidade.length > 0;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl border border-gray-100 shadow-xl max-w-2xl w-full overflow-hidden max-h-[90vh] flex flex-col">
        <div className="h-1 bg-blue-600/80" />

        <div className="p-6 overflow-y-auto flex-1">
          {/* Cabeçalho */}
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-blue-600/80 flex items-center justify-center">
                <Settings className="w-4.5 h-4.5 text-white" strokeWidth={2} />
              </div>
              <h2 className="text-gray-800 font-semibold text-base">
                Ajustar parâmetros
              </h2>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="w-4.5 h-4.5" />
            </button>
          </div>
          <p className="text-gray-400 text-sm mb-5">
            {produto.nome || produto.codigo_produto}
          </p>

          {/* Mínimo / Ideal */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-500 block mb-1">Estoque mínimo</label>
              <input
                name="estoque_minimo"
                value={form.estoque_minimo}
                onChange={handleChange}
                inputMode="numeric"
                className="w-full text-sm text-gray-800 border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-blue-400"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Estoque ideal</label>
              <input
                name="estoque_ideal"
                value={form.estoque_ideal}
                onChange={handleChange}
                inputMode="numeric"
                className="w-full text-sm text-gray-800 border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-blue-400"
              />
            </div>
          </div>

          <div className="flex items-start gap-2 bg-gray-50 rounded-lg p-3 mt-4">
            <Info className="w-3.5 h-3.5 text-gray-400 mt-0.5 shrink-0" />
            <p className="text-xs text-gray-400 leading-relaxed">
              Os parâmetros são únicos por produto e aplicados a todas as localizações.
              A Quantidade atual não é alterado aqui.
            </p>
          </div>

          {/* Ajuste de quantidade por localização */}
          {temLocalizacoes && (
            <>
              <div className="border-t border-gray-100 mt-5 mb-4" />

              <p className="text-xs font-semibold text-gray-700 mb-1">
                Ajuste de quantidade por localização
              </p>

              {/* Aviso âmbar */}
              <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500 mt-0.5 shrink-0" />
                <p className="text-xs text-amber-700 leading-relaxed">
                  Adições e remoções ficam registradas no histórico como
                  movimentações manuais e não podem ser desfeitas.
                </p>
              </div>

              <div className="flex flex-col gap-3">
                {ajustesQuantidade.map((ajuste) => (
                  <div
                    key={ajuste.fk_localizacao_id}
                    className="border border-gray-100 rounded-lg p-3"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-semibold text-gray-700">
                        {ajuste.localizacaoNome}
                      </p>
                      <p className="text-xs text-gray-400">
                        Quantidade atual:{" "}
                        <span className="font-semibold text-gray-700">
                          {ajuste.estoqueAtual} un.
                        </span>
                      </p>
                    </div>

                    <div className="grid grid-cols-[auto_1fr_1fr] gap-2 items-center">
                      {/* Toggle adicionar/remover */}
                      <div className="flex rounded-lg border border-gray-200 overflow-hidden text-xs font-medium">
                        <button
                          type="button"
                          onClick={() =>
                            handleChangeAjuste(
                              ajuste.fk_localizacao_id,
                              "tipo",
                              "adicionar",
                            )
                          }
                          className={`px-2.5 py-1.5 transition-colors ${
                            ajuste.tipo === "adicionar"
                              ? "bg-green-600 text-white"
                              : "text-gray-400 hover:bg-gray-50"
                          }`}
                        >
                          + Adicionar
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            handleChangeAjuste(
                              ajuste.fk_localizacao_id,
                              "tipo",
                              "remover",
                            )
                          }
                          className={`px-2.5 py-1.5 border-l border-gray-200 transition-colors ${
                            ajuste.tipo === "remover"
                              ? "bg-red-500 text-white"
                              : "text-gray-400 hover:bg-gray-50"
                          }`}
                        >
                          − Remover
                        </button>
                      </div>

                      {/* Quantidade */}
                      <input
                        type="text"
                        inputMode="numeric"
                        placeholder="Quantidade"
                        value={ajuste.quantidade}
                        onChange={(e) =>
                          handleChangeAjuste(
                            ajuste.fk_localizacao_id,
                            "quantidade",
                            e.target.value.replace(/\D/g, ""),
                          )
                        }
                        className="text-sm text-gray-800 border border-gray-200 rounded-lg px-3 py-1.5 outline-none focus:border-blue-400"
                      />

                      {/* Observação */}
                      <input
                        type="text"
                        placeholder="Observação (opcional)"
                        value={ajuste.observacao}
                        onChange={(e) =>
                          handleChangeAjuste(
                            ajuste.fk_localizacao_id,
                            "observacao",
                            e.target.value,
                          )
                        }
                        maxLength={200}
                        className="text-sm text-gray-800 border border-gray-200 rounded-lg px-3 py-1.5 outline-none focus:border-blue-400"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {modal === "erro" && (
            <div className="flex items-start gap-2 bg-red-50 rounded-lg p-3 mt-4">
              <AlertCircle className="w-3.5 h-3.5 text-red-500 mt-0.5 shrink-0" />
              <p className="text-xs text-red-600 leading-relaxed">{erroMsg}</p>
            </div>
          )}

          {modal === "sucesso" && (
            <div className="flex items-start gap-2 bg-green-50 rounded-lg p-3 mt-4">
              <CheckCircle2 className="w-3.5 h-3.5 text-green-600 mt-0.5 shrink-0" />
              <p className="text-xs text-green-700 leading-relaxed">
                Parâmetros e ajustes salvos com sucesso!
              </p>
            </div>
          )}
        </div>

        {/* Footer fixo */}
        <div className="flex justify-end gap-2 border-t border-gray-100 px-6 py-4">
          <button
            onClick={onClose}
            className="text-sm text-gray-600 bg-white border border-gray-200 rounded-lg px-4 py-2 hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="text-sm text-white bg-blue-600/90 rounded-lg px-4 py-2 font-medium hover:bg-blue-700 disabled:opacity-60"
          >
            {isSubmitting ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </div>
    </div>
  );
}