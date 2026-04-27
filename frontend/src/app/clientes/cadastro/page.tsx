"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import {
  User,
  Building2,
  FileText,
  Phone,
  MapPin,
  UserPlus,
  CheckCircle,
  AlertTriangle,
  X,
  ArrowLeft,
} from "lucide-react";

export default function CadastroCliente() {
  const router = useRouter();
  const [tipo, setTipo] = useState("FISICA");
  const [modal, setModal] = useState(null); // "sucesso" | "erro" | null
  const [nomecadastrado, setNomeCadastrado] = useState("");
  const [erroMsg, setErroMsg] = useState("");
  const [form, setForm] = useState({
    nome: "",
    cpf: "",
    cnpj: "",
    razao_social: "",
    nome_fantasia: "",
    telefone: "",
    logradouro: "",
    numero: "",
    bairro: "",
    cidade: "",
    uf: "",
    cep: "",
  });

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async () => {
    // Validação básica
    const doc = tipo === "FISICA" ? form.cpf : form.cnpj;
    if (!form.nome.trim() || !doc.trim() || !form.telefone.trim()) {
      setErroMsg(
        "Preencha todos os campos obrigatórios: nome, documento e telefone.",
      );
      setModal("erro");
      return;
    }

    const body = {
      nome: form.nome,
      tipo_cliente: tipo,
      telefone: form.telefone,
      logradouro: form.logradouro,
      numero: form.numero,
      bairro: form.bairro,
      cidade: form.cidade,
      uf: form.uf,
      cep: form.cep,
      ...(tipo === "FISICA"
        ? { cpf: form.cpf }
        : {
            cnpj: form.cnpj,
            razao_social: form.razao_social,
            nome_fantasia: form.nome_fantasia,
          }),
    };

    try {
      const res = await fetch("http://localhost:3000/api/clientes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      console.log("Status:", res.status); // 👈 veja isso no console do navegador

      if (res.ok) {
        setNomeCadastrado(form.nome);
        setModal("sucesso");
      } else {
        const data = await res.json();
        setErroMsg(data.erro || "Erro ao cadastrar cliente.");
        setModal("erro");
      }
    } catch {
      setErroMsg("Não foi possível conectar ao servidor.");
      setModal("erro");
    }
  };

  const inputClass =
    "w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-800 focus:ring-2 focus:ring-blue-500 outline-none";
  const inputIconClass =
    "w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-800 focus:ring-2 focus:ring-blue-500 outline-none";

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#f4f6fb] p-8">
        <button
          onClick={() => router.push("/clientes/gerenciar")}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Voltar para Clientes
        </button>

        <div className="flex flex-col items-center">
          <div className="w-full max-w-lg">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 w-full max-w-lg p-8">
              {/* Título */}
              <div className="mb-6">
                <h1 className="text-xl font-bold text-gray-800">
                  Cadastro de Cliente
                </h1>
                <p className="text-xs text-gray-400 mt-1">
                  Preencha as informações do novo cliente
                </p>
              </div>

              {/* Tipo de Cliente */}
              <div className="mb-5">
                <label className="text-xs font-semibold text-gray-600 mb-2 block">
                  Tipo de Cliente
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    {
                      val: "FISICA",
                      label: "Pessoa Física",
                      sub: "Individual",
                      icon: User,
                    },
                    {
                      val: "JURIDICA",
                      label: "Pessoa Jurídica",
                      sub: "Corporativo",
                      icon: Building2,
                    },
                  ].map(({ val, label, sub, icon: Icon }) => (
                    <button
                      key={val}
                      onClick={() => setTipo(val)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all ${
                        tipo === val
                          ? "border-blue-500 bg-blue-50 text-blue-600"
                          : "border-gray-200 text-gray-500 hover:border-gray-300"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <div className="text-left">
                        <p className="text-sm font-semibold">{label}</p>
                        <p className="text-[10px] opacity-60">{sub}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* CPF ou CNPJ */}
              <div className="mb-4">
                <label className="text-xs font-semibold text-gray-600 mb-1.5 block">
                  {tipo === "FISICA" ? "CPF" : "CNPJ"}{" "}
                  <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <FileText className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    name={tipo === "FISICA" ? "cpf" : "cnpj"}
                    placeholder={
                      tipo === "FISICA"
                        ? "000.000.000-00"
                        : "00.000.000/0000-00"
                    }
                    value={tipo === "FISICA" ? form.cpf : form.cnpj}
                    onChange={handleChange}
                    className={inputIconClass}
                  />
                </div>
              </div>

              {/* Campos PJ */}
              {tipo === "JURIDICA" && (
                <>
                  <div className="mb-4">
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
                        className={inputIconClass}
                      />
                    </div>
                  </div>
                  <div className="mb-4">
                    <label className="text-xs font-semibold text-gray-600 mb-1.5 block">
                      Nome Fantasia{" "}
                      <span className="text-gray-400 font-normal">
                        (opcional)
                      </span>
                    </label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="text"
                        name="nome_fantasia"
                        placeholder="Digite o nome fantasia"
                        value={form.nome_fantasia}
                        onChange={handleChange}
                        className={inputIconClass}
                      />
                    </div>
                  </div>
                </>
              )}

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

              {/* Telefone */}
              <div className="mb-4">
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
                    className={inputIconClass}
                  />
                </div>
              </div>

              {/* Endereço */}
              <div className="mb-6">
                <label className="text-xs font-semibold text-gray-600 mb-2 block">
                  Endereço{" "}
                  <span className="text-gray-400 font-normal">(opcional)</span>
                </label>
                <div className="flex flex-col gap-3">
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      name="logradouro"
                      placeholder="Logradouro"
                      value={form.logradouro}
                      onChange={handleChange}
                      className={inputIconClass}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      name="numero"
                      placeholder="Número"
                      value={form.numero}
                      onChange={handleChange}
                      className={inputClass}
                    />
                    <input
                      type="text"
                      name="bairro"
                      placeholder="Bairro"
                      value={form.bairro}
                      onChange={handleChange}
                      className={inputClass}
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="col-span-2">
                      <input
                        type="text"
                        name="cidade"
                        placeholder="Cidade"
                        value={form.cidade}
                        onChange={handleChange}
                        className={inputClass}
                      />
                    </div>
                    <input
                      type="text"
                      name="uf"
                      placeholder="UF"
                      maxLength={2}
                      value={form.uf}
                      onChange={handleChange}
                      className={`${inputClass} uppercase`}
                    />
                  </div>
                  <input
                    type="text"
                    name="cep"
                    placeholder="CEP (00000-000)"
                    value={form.cep}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>
              </div>

              {/* Botões */}
              <div className="flex gap-3">
                <button
                  onClick={handleSubmit}
                  className="flex-1 flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white py-2.5 rounded-lg font-semibold text-sm transition-all shadow-md"
                >
                  <UserPlus className="w-4 h-4" /> Cadastrar Cliente
                </button>
                <button
                  onClick={() => router.push("/clientes/gerenciar")}
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
              Cliente cadastrado com sucesso!
            </h2>
            <p className="text-sm text-blue-500 font-medium mb-1">
              {nomecadastrado}
            </p>
            <p className="text-xs text-gray-400 mb-6">
              O cliente foi adicionado ao sistema LKCell
            </p>
            <button
              onClick={() => router.push("/clientes/gerenciar")}
              className="w-full py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold text-sm transition-all mb-3"
            >
              Fechar
            </button>
            <button
              onClick={() => {
                setModal(null);
                setForm({
                  nome: "",
                  cpf: "",
                  cnpj: "",
                  razao_social: "",
                  nome_fantasia: "",
                  telefone: "",
                  logradouro: "",
                  numero: "",
                  bairro: "",
                  cidade: "",
                  uf: "",
                  cep: "",
                });
              }}
              className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
            >
              Cadastrar outro cliente
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
              Erro ao cadastrar cliente
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
