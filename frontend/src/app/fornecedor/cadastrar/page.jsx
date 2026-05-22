"use client";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { useCadastrarFornecedor } from "@/hooks/fornecedor/useCadastrarFornecedor";
import { blockNonNumericKeys } from "@/lib/blockNonNumericKeys";
import {
  ArrowLeft,
  Building2,
  FileText,
  Mail,
  Phone,
  DollarSign,
  CalendarDays,
  Loader2,
  CheckCircle,
  AlertTriangle,
  UserPlus,
} from "lucide-react";

export default function CadastroFornecedor() {
  const router = useRouter();
  const {
    form,
    modal,
    modalErro,
    setModalErro,
    erroMsg,
    isSubmitting,
    handleChange,
    handleSubmit,
  } = useCadastrarFornecedor();

  const inputClass =
    "w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-800 focus:ring-2 focus:ring-blue-500 outline-none";

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#f4f6fb] p-8 px-55">
        <button
          onClick={() => router.push("/fornecedor/gerenciar")}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Voltar para Fornecedores
        </button>

        <div className="flex flex-col items-center">
          <div className="w-full max-w-lg">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
              <div className="mb-6">
                <h1 className="text-xl font-bold text-gray-800">
                  Cadastro de Fornecedor
                </h1>
                <p className="text-xs text-gray-400 mt-1">
                  Preencha os dados do novo fornecedor
                </p>
              </div>

              <div className="grid gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1.5 block">
                    CNPJ <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      name="cnpj"
                      placeholder="00.000.000/0000-00"
                      value={form.cnpj}
                      onChange={handleChange}
                      className={inputClass}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1.5 block">
                    Razão Social <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      name="razao_social"
                      placeholder="Digite a razão social"
                      value={form.razao_social}
                      onChange={handleChange}
                      className={inputClass}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1.5 block">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="email"
                      name="email"
                      placeholder="email@provedor.com"
                      value={form.email}
                      onChange={handleChange}
                      className={inputClass}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-600 mb-1.5 block">
                      Política de Preço <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="text"
                        name="politica_preco"
                        placeholder="0.00"
                        value={form.politica_preco}
                        onChange={handleChange}
                        className={inputClass}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-600 mb-1.5 block">
                      Prazo de Entrega
                    </label>
                    <div className="relative">
                      <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="number"
                        name="prazo_entrega"
                        placeholder="Dias"
                        value={form.prazo_entrega}
                        onChange={handleChange}
                        onKeyDown={blockNonNumericKeys}
                        inputMode="numeric"
                        pattern="[0-9]*"
                        className={inputClass}
                        min="0"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1.5 block">
                    Telefone <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      name="telefone"
                      placeholder="(00) 00000-0000"
                      value={form.telefone}
                      onChange={handleChange}
                      className={inputClass}
                    />
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => router.push("/fornecedor/gerenciar")}
                    className="flex-1 py-2.5 rounded-lg border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-all"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className={`flex-1 flex items-center justify-center gap-2 text-white py-2.5 rounded-lg font-semibold text-sm transition-all shadow-md ${
                      isSubmitting
                        ? "bg-blue-400 cursor-not-allowed"
                        : "bg-blue-500 hover:bg-blue-600"
                    }`}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" /> Salvando...
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4" /> Cadastrar
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {modal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-sm text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="w-9 h-9 text-green-500" />
              </div>
            </div>
            <h2 className="text-lg font-bold text-gray-800 mb-1">
              Fornecedor cadastrado!
            </h2>
            <p className="text-xs text-gray-400 mb-6">
              O fornecedor foi criado com sucesso.
            </p>
            <button
              onClick={() => router.push("/fornecedor/gerenciar")}
              className="w-full py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold text-sm transition-all"
            >
              Ir para gerenciamento
            </button>
          </div>
        </div>
      )}

      {modalErro && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-sm text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle className="w-9 h-9 text-red-500" />
              </div>
            </div>
            <h2 className="text-lg font-bold text-gray-800 mb-1">Erro</h2>
            <p className="text-xs text-gray-400 mb-6">{erroMsg}</p>
            <button
              onClick={() => setModalErro(false)}
              className="w-full py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold text-sm transition-all"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </>
  );
}
