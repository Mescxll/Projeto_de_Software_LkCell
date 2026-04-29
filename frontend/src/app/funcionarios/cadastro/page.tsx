"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import {
  User,
  Calendar,
  UserPlus,
  CheckCircle,
  Loader2,
  AlertTriangle,
  ArrowLeft,
} from "lucide-react";

export default function CadastrarFuncionario() {
  const router = useRouter();
  const [modal, setModal] = useState<null | "sucesso" | "erro">(null);
  const [erroMsg, setErroMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    nome: "",
    data_nascimento: "",
  });

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async () => {
    if (!form.nome.trim()) {
      setErroMsg("O nome do funcionário é obrigatório.");
      setModal("erro");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("http://localhost:3000/api/funcionarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        setModal("sucesso");
      } else {
        const data = await res.json();
        setErroMsg(data.erro || "Erro ao cadastrar funcionário.");
        setModal("erro");
      }
    } catch {
      setErroMsg("Não foi possível conectar ao servidor.");
      setModal("erro");
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputIconClass =
    "w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-800 focus:ring-2 focus:ring-blue-500 outline-none";

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#f4f6fb] p-8 px-55">
        {/* Voltar */}
        <button
          onClick={() => router.push("/funcionarios/gerenciar")}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Voltar para Funcionários
        </button>

        {/* Centro */}
        <div className="flex flex-col items-center">
          <div className="w-full max-w-lg">
            {/* Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
              {/* Título */}
              <div className="mb-6">
                <h1 className="text-xl font-bold text-gray-800">
                  Cadastro de Funcionário
                </h1>
                <p className="text-xs text-gray-400 mt-1">
                  Preencha as informações do novo funcionário
                </p>
              </div>

              {/* Nome */}
              <div className="mb-4">
                <label className="text-xs font-semibold text-gray-600 mb-1.5 block">
                  Nome Completo <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    name="nome"
                    placeholder="Digite o nome completo"
                    value={form.nome}
                    onChange={handleChange}
                    className={inputIconClass}
                  />
                </div>
              </div>

              {/* Data de Nascimento */}
              <div className="mb-6">
                <label className="text-xs font-semibold text-gray-600 mb-1.5 block">
                  Data de Nascimento{" "}
                  <span className="text-gray-400 font-normal">(opcional)</span>
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="date"
                    name="data_nascimento"
                    value={form.data_nascimento}
                    onChange={handleChange}
                    className={inputIconClass}
                  />
                </div>
              </div>

              {/* Botões */}
              <div className="flex gap-3">
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className={`flex-1 flex items-center justify-center gap-2 text-white py-2.5 rounded-lg font-semibold text-sm transition-all shadow-md
                    ${isSubmitting ? "bg-green-400 cursor-not-allowed" : "bg-green-500 hover:bg-green-600"}
                  `}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />{" "}
                      Processando...
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" /> Cadastrar Funcionário
                    </>
                  )}
                </button>
                <button
                  onClick={() => router.push("/funcionarios/gerenciar")}
                  className="px-6 py-2.5 rounded-lg border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-all"
                >
                  Cancelar
                </button>
              </div>
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
              Funcionário cadastrado com sucesso!
            </h2>
            <p className="text-sm text-blue-500 font-medium mb-1">
              {form.nome}
            </p>
            <p className="text-xs text-gray-400 mb-6">
              O funcionário foi adicionado ao sistema LKCell
            </p>
            <button
              onClick={() => router.push("/funcionarios/gerenciar")}
              className="w-full py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold text-sm transition-all mb-3"
            >
              Fechar
            </button>
            <button
              onClick={() => {
                setModal(null);
                setForm({ nome: "", data_nascimento: "" });
              }}
              className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
            >
              Cadastrar outro funcionário
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
              Erro ao cadastrar funcionário
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
