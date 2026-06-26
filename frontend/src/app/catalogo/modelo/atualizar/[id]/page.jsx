// app/catalogo/modelo/atualizar/[id]/page.jsx
"use client";
import { useRouter, useParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import SearchableSelect from "@/components/SearchableSelect";
import { useAtualizarModelo } from "@/hooks/catalogo/modelo/useAtualizarModelo";
import {
  ArrowLeft,
  Smartphone,
  Tag,
  Loader2,
  CheckCircle,
  AlertTriangle,
  Save,
  Package,
} from "lucide-react";

export default function AtualizarModelo() {
  const router = useRouter();
  const { id } = useParams();

  const {
    nome,
    setNome,
    nomeOriginal,
    fkMarcaId,
    setFkMarcaId,
    totalProdutos,
    marcas,
    loading,
    erro,
    semAlteracoes,
    modal,
    setModal,
    erroMsg,
    isSubmitting,
    handleSubmit,
  } = useAtualizarModelo(id);

  const inputClass =
    "w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-800 focus:ring-2 focus:ring-blue-500 outline-none bg-white";

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-[#f4f6fb] flex items-center justify-center">
          <p className="text-gray-400 text-sm">Carregando modelo...</p>
        </main>
      </>
    );
  }

  if (erro) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-[#f4f6fb] flex items-center justify-center">
          <div className="text-center">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-lg font-bold text-gray-800 mb-2">
              Modelo não encontrado
            </h2>
            <button
              onClick={() => router.push("/catalogo/modelo/gerenciar")}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2.5 rounded-lg font-semibold text-sm transition-all"
            >
              Voltar para Modelos
            </button>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#f4f6fb] p-8 px-55">
        <button
          onClick={() => router.push("/catalogo/modelo/gerenciar")}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Voltar para Modelos
        </button>

        <div className="max-w-lg mx-auto flex flex-col gap-6">
          {/* Formulário */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-blue-600/80 flex items-center justify-center">
                <Smartphone className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">
                  Atualizar Modelo
                </h1>
                <p className="text-xs text-gray-400">
                  Editando:{" "}
                  <span className="font-semibold text-gray-600">
                    {nomeOriginal}
                  </span>
                </p>
              </div>
            </div>

            {/* Marca */}
            <div className="mb-6">
              <label className="text-xs font-semibold text-gray-600 mb-1.5 block">
                Marca <span className="text-red-400">*</span>
              </label>
              <SearchableSelect
                name="fk_marca_id"
                options={marcas.map((m) => ({
                  value: m.id_marca,
                  label: m.nome,
                }))}
                value={fkMarcaId}
                onChange={setFkMarcaId}
                placeholder="Selecione uma marca"
                icon={<Tag className="w-4 h-4" />}
              />
            </div>

            {/* Nome */}
            <div className="mb-6">
              <label className="text-xs font-semibold text-gray-600 mb-1.5 block">
                Nome <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                  className={`pl-9 ${inputClass}`}
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => router.push("/catalogo/modelo/gerenciar")}
                className="flex-1 py-2.5 border border-gray-200 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={handleSubmit}
                disabled={
                  isSubmitting || !nome.trim() || !fkMarcaId || semAlteracoes
                }
                className="flex-1 flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-2.5 rounded-lg font-semibold transition-all text-sm"
              >
                {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                <Save className="w-4 h-4" /> Salvar Alterações
              </button>
            </div>
          </div>

          {/* Info — produtos vinculados */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-gray-400" />
                <span className="text-sm font-semibold text-gray-700">
                  Produtos vinculados
                </span>
              </div>
              <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100">
                {totalProdutos}
              </span>
            </div>
            {totalProdutos > 0 && (
              <p className="text-xs text-gray-400 mt-2">
                Este modelo possui produtos cadastrados. Para excluí-lo, remova
                os produtos primeiro.
              </p>
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
            <h2 className="text-lg font-bold text-gray-800 mb-2">
              Atualizado com Sucesso!
            </h2>
            <p className="text-sm text-gray-500 mb-6">
              As alterações foram salvas.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setModal(null)}
                className="flex-1 py-2.5 border border-gray-200 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-all"
              >
                Continuar Editando
              </button>
              <button
                onClick={() => router.push("/catalogo/modelo/gerenciar")}
                className="flex-1 py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold text-sm transition-all"
              >
                Ver Modelos
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
            <h2 className="text-lg font-bold text-gray-800 mb-2">Erro</h2>
            <p className="text-sm text-gray-500 mb-6">{erroMsg}</p>
            <button
              onClick={() => setModal(null)}
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
