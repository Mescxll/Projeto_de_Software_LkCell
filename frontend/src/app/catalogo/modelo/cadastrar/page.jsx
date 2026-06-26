// app/catalogo/modelo/cadastrar/page.jsx
"use client";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import SearchableSelect from "@/components/SearchableSelect";
import { useCadastrarModelo } from "@/hooks/catalogo/modelo/useCadastrarModelo";
import {
  ArrowLeft,
  Smartphone,
  Tag,
  Loader2,
  CheckCircle,
  AlertTriangle,
  Save,
} from "lucide-react";

export default function CadastrarModelo() {
  const router = useRouter();

  const {
    nome,
    setNome,
    fkMarcaId,
    setFkMarcaId,
    marcas,
    loadingMarcas,
    modal,
    setModal,
    erroMsg,
    isSubmitting,
    handleSubmit,
  } = useCadastrarModelo();

  const inputClass =
    "w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-800 focus:ring-2 focus:ring-blue-500 outline-none bg-white";

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

        <div className="max-w-lg mx-auto">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-blue-600/80 flex items-center justify-center">
                <Smartphone className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">
                  Cadastrar Modelo
                </h1>
                <p className="text-xs text-gray-400">
                  Adicione um novo modelo ao catálogo
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
                placeholder={
                  loadingMarcas ? "Carregando marcas..." : "Selecione uma marca"
                }
                icon={<Tag className="w-4 h-4" />}
                disabled={loadingMarcas}
              />
              {!loadingMarcas && marcas.length === 0 && (
                <p className="text-xs text-orange-500 mt-1">
                  Nenhuma marca cadastrada. Cadastre uma marca primeiro.
                </p>
              )}
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
                  placeholder="Ex: Galaxy S23, iPhone 13..."
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
                disabled={isSubmitting || !nome.trim() || !fkMarcaId}
                className="flex-1 flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-2.5 rounded-lg font-semibold transition-all text-sm"
              >
                {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                <Save className="w-4 h-4" /> Cadastrar
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
            <h2 className="text-lg font-bold text-gray-800 mb-2">
              Cadastrado com Sucesso!
            </h2>
            <p className="text-sm text-gray-500 mb-6">
              O modelo foi adicionado ao catálogo.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setModal(null)}
                className="flex-1 py-2.5 border border-gray-200 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-all"
              >
                Cadastrar outro
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
