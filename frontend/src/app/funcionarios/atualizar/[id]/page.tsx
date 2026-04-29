"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import {
  ArrowLeft,
  User,
  Calendar,
  Save,
  CheckCircle,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import DatePicker, { registerLocale } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { ptBR } from "date-fns/locale/pt-BR";
// Registra o português do Brasil no motor do calendário
registerLocale("pt-BR", ptBR);

export default function AtualizarFuncionario() {
  const router = useRouter();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [modal, setModal] = useState<null | "sucesso" | "erro">(null);
  const [erroMsg, setErroMsg] = useState("");
  const [form, setForm] = useState({
    nome: "",
    data_nascimento: "",
  });

  useEffect(() => {
    fetch(`http://localhost:3000/api/funcionarios?busca=${id}`)
      .then((res) => res.json())
      .then((data) => {
        const funcionario = Array.isArray(data) ? data[0] : data;
        setForm({
          nome: funcionario?.nome || "",
          data_nascimento: funcionario?.data_aniversario
            ? new Date(funcionario.data_aniversario)
            : null,
        });
        setLoading(false);
      })
      .catch((err) => {
        console.error("Erro ao buscar funcionário:", err);
        setLoading(false);
      });
  }, [id]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSalvar = async () => {
    if (!form.nome.trim()) {
      setErroMsg("O nome do funcionário é obrigatório.");
      setModal("erro");
      return;
    }
    setIsSubmitting(true);

    try {
      const res = await fetch(`http://localhost:3000/api/funcionarios/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: form.nome,
          data_nascimento: form.data_nascimento
            ? form.data_nascimento.toISOString().split("T")[0]
            : null,
        }),
      });

      if (res.ok) setModal("sucesso");
      else {
        const data = await res.json();
        setErroMsg(data.erro || "Erro ao atualizar funcionário.");
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

  if (loading)
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-[#f4f6fb] flex items-center justify-center">
          <p className="text-gray-400 text-sm">Carregando...</p>
        </main>
      </>
    );

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
          <div className="w-full max-w-xl">
            {/* Título */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-800">
                Atualizar Funcionário
              </h1>
              <p className="text-sm text-gray-400 mt-1">
                Edite as informações do funcionário
              </p>
            </div>

            {/* Formulário */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
              {/* ID (somente leitura) */}
              <div className="mb-4">
                <label className="text-xs font-semibold text-gray-600 mb-1.5 block">
                  ID
                </label>
                <input
                  type="text"
                  value={`#${id}`}
                  disabled
                  className="w-full px-4 py-2.5 border border-gray-100 rounded-lg text-sm text-gray-400 bg-gray-50 outline-none cursor-not-allowed"
                />
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
                    value={form.nome}
                    onChange={handleChange}
                    placeholder="Digite o nome completo"
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
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 z-10 pointer-events-none" />
                  <DatePicker
                    selected={form.data_nascimento}
                    onChange={(date) =>
                      setForm((prev) => ({ ...prev, data_nascimento: date }))
                    }
                    locale="pt-BR"
                    dateFormat="dd/MM/yyyy"
                    placeholderText="Selecione a data"
                    className={inputIconClass}
                    wrapperClassName="w-full"
                    showPopperArrow={false}
                    showMonthDropdown
                    showYearDropdown
                    dropdownMode="select"
                    yearDropdownItemNumber={100}
                    scrollableYearDropdown
                    maxDate={new Date()}
                  />
                </div>
              </div>

              {/* Botões */}
              <div className="flex gap-3">
                <button
                  onClick={() => router.push("/funcionarios/gerenciar")}
                  className="flex-1 py-2.5 rounded-lg border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-all"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSalvar}
                  disabled={isSubmitting}
                  className={`flex-1 flex items-center justify-center gap-2 text-white py-2.5 rounded-lg font-semibold text-sm transition-all shadow-md
                    ${isSubmitting ? "bg-blue-400 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600"}
                  `}
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
              Funcionário atualizado com sucesso.
            </p>
            <button
              onClick={() => router.push("/funcionarios/gerenciar")}
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
    </>
  );
}
