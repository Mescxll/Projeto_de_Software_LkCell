"use client";

import { Settings, X, Info, CheckCircle2, AlertCircle } from "lucide-react";
import { useAjustarParametrosEstoque } from "@/hooks/estoque/useAjustarParametrosEstoque";

export default function ModalAjustarParametros({ produto, onClose, onSuccess }) {
  const {
    form,
    modal,
    setModal,
    erroMsg,
    isSubmitting,
    handleChange,
    handleSubmit,
  } = useAjustarParametrosEstoque(produto, onSuccess);

  if (!produto) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl border border-gray-100 shadow-xl max-w-md w-full overflow-hidden">
        <div className="h-1 bg-blue-600/80" />

        <div className="p-6">
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

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-500 block mb-1">
                Estoque mínimo
              </label>
              <input
                name="estoque_minimo"
                value={form.estoque_minimo}
                onChange={handleChange}
                inputMode="numeric"
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-blue-400"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">
                Estoque ideal
              </label>
              <input
                name="estoque_ideal"
                value={form.estoque_ideal}
                onChange={handleChange}
                inputMode="numeric"
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-blue-400"
              />
            </div>
          </div>

          <div className="flex items-start gap-2 bg-gray-50 rounded-lg p-3 mt-4">
            <Info className="w-3.5 h-3.5 text-gray-400 mt-0.5 shrink-0" />
            <p className="text-xs text-gray-400 leading-relaxed">
              Esse valor é único para o produto e será aplicado a todas as
              localizações. O saldo atual não é alterado.
            </p>
          </div>

          {Array.isArray(produto.saldoPorLocalizacao) &&
            produto.saldoPorLocalizacao.length > 0 && (
              <div className="border-t border-gray-100 mt-4 pt-3">
                <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-wide mb-2">
                  Saldo atual por localização
                </p>
                {produto.saldoPorLocalizacao.map((loc, i) => (
                  <div
                    key={loc.id_localizacao ?? i}
                    className={`flex justify-between text-sm py-1.5 ${
                      i > 0 ? "border-t border-gray-50" : ""
                    }`}
                  >
                    <span className="text-gray-600">{loc.localizacao}</span>
                    <span className="text-gray-800 font-medium">
                      {loc.estoque_atual} un.
                    </span>
                  </div>
                ))}
              </div>
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
                Parâmetros atualizados com sucesso!
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
              onClick={async () => {
                await handleSubmit();
              }}
              disabled={isSubmitting}
              className="text-sm text-white bg-blue-600/90 rounded-lg px-4 py-2 font-medium hover:bg-blue-700 disabled:opacity-60"
            >
              {isSubmitting ? "Salvando..." : "Salvar"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}