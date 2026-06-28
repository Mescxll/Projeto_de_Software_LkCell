"use client";

import { ArrowLeftRight, X, AlertCircle, CheckCircle2 } from "lucide-react";
import { useTransferirEstoque } from "@/hooks/estoque/useTransferirEstoque";

export default function ModalTransferencia({ produtoInicial, onClose, onSuccess }) {
  const {
    produtos,
    localizacoes,
    loadingDados,
    saldoOrigem,
    loadingSaldo,
    form,
    modal,
    erroMsg,
    isSubmitting,
    handleChange,
    handleSubmit,
  } = useTransferirEstoque(produtoInicial, onSuccess);

  const localizacoesDestino = localizacoes.filter(
    (l) => String(l.id_localizacao) !== String(form.fk_localizacao_origem_id),
  );

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl border border-gray-100 shadow-xl max-w-lg w-full overflow-hidden">
        <div className="h-1 bg-gray-400" />

        <div className="p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-gray-400 flex items-center justify-center">
                <ArrowLeftRight className="w-4.5 h-4.5 text-white" strokeWidth={2} />
              </div>
              <h2 className="text-gray-800 font-semibold text-base">
                Transferir estoque
              </h2>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="w-4.5 h-4.5" />
            </button>
          </div>

          {loadingDados ? (
            <p className="text-sm text-gray-400">Carregando dados...</p>
          ) : (
            <>
              <label className="text-xs text-gray-500 block mb-1">Produto</label>
              <select
                name="fk_produto_id"
                value={form.fk_produto_id}
                onChange={handleChange}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-blue-400 mb-4"
              >
                <option value="">Selecione um produto</option>
                {produtos.map((p) => (
                  <option key={p.id_produto} value={p.id_produto}>
                    {p.nome || p.codigo_produto}
                  </option>
                ))}
              </select>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500 block mb-1">De</label>
                  <select
                    name="fk_localizacao_origem_id"
                    value={form.fk_localizacao_origem_id}
                    onChange={handleChange}
                    className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-blue-400"
                  >
                    <option value="">Selecione</option>
                    {localizacoes.map((l) => (
                      <option key={l.id_localizacao} value={l.id_localizacao}>
                        {l.localizacao}
                      </option>
                    ))}
                  </select>
                  {form.fk_localizacao_origem_id && (
                    <p
                      className={`text-xs mt-1.5 ${
                        loadingSaldo
                          ? "text-gray-400"
                          : saldoOrigem > 0
                          ? "text-green-600"
                          : "text-red-500"
                      }`}
                    >
                      {loadingSaldo
                        ? "Consultando saldo..."
                        : `Saldo disponível: ${saldoOrigem ?? 0} un.`}
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-xs text-gray-500 block mb-1">Para</label>
                  <select
                    name="fk_localizacao_destino_id"
                    value={form.fk_localizacao_destino_id}
                    onChange={handleChange}
                    className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-blue-400"
                  >
                    <option value="">Selecione</option>
                    {localizacoesDestino.map((l) => (
                      <option key={l.id_localizacao} value={l.id_localizacao}>
                        {l.localizacao}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <label className="text-xs text-gray-500 block mt-4 mb-1">
                Quantidade
              </label>
              <input
                name="quantidade"
                value={form.quantidade}
                onChange={handleChange}
                inputMode="numeric"
                className="w-32 text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-blue-400"
              />

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
                    Transferência realizada com sucesso!
                  </p>
                </div>
              )}

              <div className="flex justify-end gap-2 border-t border-gray-100 mt-5 pt-4">
                <button
                  onClick={onClose}
                  className="text-sm text-gray-600 bg-white border border-gray-200 rounded-lg px-4 py-2 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="text-sm text-white bg-gray-500 rounded-lg px-4 py-2 font-medium hover:bg-gray-600 disabled:opacity-60"
                >
                  {isSubmitting ? "Transferindo..." : "Confirmar transferência"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}