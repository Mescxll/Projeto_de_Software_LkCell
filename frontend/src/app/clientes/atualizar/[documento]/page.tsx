"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import {
  ArrowLeft,
  FileText,
  User,
  Phone,
  MapPin,
  AlertTriangle,
  Save,
  CheckCircle,
} from "lucide-react";

export default function AtualizarCliente() {
  const router = useRouter();
  const { documento } = useParams();
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [modalErro, setModalErro] = useState(false);
  const [erroMsg, setErroMsg] = useState("");
  const [tipo, setTipo] = useState("FISICA");
  const [form, setForm] = useState({
    nome: "",
    telefone: "",
    logradouro: "",
    numero: "",
    bairro: "",
    cidade: "",
    uf: "",
    cep: "",
  });

  useEffect(() => {
    fetch(`http://localhost:3000/api/clientes/${documento}`)
      .then((res) => res.json())
      .then((data) => {
        setTipo(data.tipo_cliente === "FISICO" ? "FISICA" : "JURIDICA");
        setForm({
          nome: data.nome || "",
          telefone: data.telefone_cliente?.[0]?.telefone_cliente || "",
          logradouro: data.logradouro || "",
          numero: data.numero?.toString() || "",
          bairro: data.bairro || "",
          cidade: data.cidade || "",
          uf: data.uf || "",
          cep: data.cep || "",
        });
        setLoading(false);
      })
      .catch((err) => {
        console.error("Erro ao buscar cliente:", err);
        setLoading(false);
      });
  }, [documento]);

  const handleChange = (e) => {
    let { name, value } = e.target;

    // Se for Telefone ou CEP, arranca letras e limita o tamanho
    if (["telefone", "cep"].includes(name)) {
      value = value.replace(/\D/g, "");

      if (name === "telefone") value = value.slice(0, 11);
      if (name === "cep") value = value.slice(0, 8);
    }

    // Se for número de endereço, só arranca as letras
    if (name === "numero") {
      value = value.replace(/\D/g, "");
    }

    if (name === "uf") {
      value = value.replace(/[^a-zA-Z]/g, "").slice(0, 2).toUpperCase();
    }

    setForm({ ...form, [name]: value });
  };

  const handleSalvar = async () => {
    // Trava de campos em branco
    if (!form.nome.trim() || !form.telefone.trim()) {
      setErroMsg("Preencha todos os campos obrigatórios: Nome e Telefone.");
      setModalErro(true);
      return;
    }

    // Trava de tamanho do Telefone
    if (form.telefone.length !== 11) {
      setErroMsg(
        "O telefone precisa ter exatamente 11 números (DDD + 9 dígitos)!",
      );
      setModalErro(true);
      return;
    }

    // Trava de tamanho do CEP
    if (form.cep && form.cep.length !== 8) {
      setErroMsg("O CEP está incompleto! Digite exatamente 8 números.");
      setModalErro(true);
      return;
    }

    // Se passou por todas as travas, tenta salvar!
    try {
      const res = await fetch(
        `http://localhost:3000/api/clientes/${documento}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nome: form.nome,
            telefone: form.telefone,
            logradouro: form.logradouro,
            numero: form.numero,
            bairro: form.bairro,
            cidade: form.cidade,
            uf: form.uf,
            cep: form.cep,
          }),
        },
      );

      if (res.ok) {
        setModal(true);
      } else {
        const data = await res.json();
        setErroMsg(data.erro || "Erro ao atualizar cliente no servidor.");
        setModalErro(true);
      }
    } catch (err) {
      setErroMsg("Não foi possível conectar ao servidor.");
      setModalErro(true);
    }
  };

  const inputClass =
    "w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-800 focus:ring-2 focus:ring-blue-500 outline-none";
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
          onClick={() => router.push("/clientes/gerenciar")}
          className="self-start flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Voltar para Clientes
        </button>
        <div className="flex flex-col items-center">
          <div className="w-full max-w-xl">
            {/* Título */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-800">
                Atualizar Cliente
              </h1>
              <p className="text-sm text-gray-400 mt-1">
                Edite as informações do cliente
              </p>
            </div>
          </div>
          {/* Formulário */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 w-full max-w-xl p-8">
            {/* CPF/CNPJ (somente leitura) */}
            <div className="mb-4">
              <label className="text-xs font-semibold text-gray-600 mb-1.5 block">
                {tipo === "FISICA" ? "CPF" : "CNPJ"}{" "}
                <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <FileText className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  value={documento as string}
                  disabled
                  className="w-full pl-9 pr-4 py-2.5 border border-gray-100 rounded-lg text-sm text-gray-400 bg-gray-50 outline-none cursor-not-allowed"
                />
              </div>
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
                  value={form.telefone}
                  onChange={handleChange}
                  placeholder="DDD + Número (Ex: 77999999999)"
                  className={inputIconClass}
                />
              </div>
            </div>

            {/* Endereço */}
            <div className="mb-6">
              <label className="text-xs font-semibold text-gray-600 mb-2 block">
                Endereço
              </label>
              <div className="flex flex-col gap-3">
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    name="logradouro"
                    value={form.logradouro}
                    onChange={handleChange}
                    placeholder="Logradouro"
                    className={inputIconClass}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    name="numero"
                    value={form.numero}
                    onChange={handleChange}
                    placeholder="Número"
                    className={inputClass}
                  />
                  <input
                    type="text"
                    name="bairro"
                    value={form.bairro}
                    onChange={handleChange}
                    placeholder="Bairro"
                    className={inputClass}
                  />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2">
                    <input
                      type="text"
                      name="cidade"
                      value={form.cidade}
                      onChange={handleChange}
                      placeholder="Cidade"
                      className={inputClass}
                    />
                  </div>
                  <input
                    type="text"
                    name="uf"
                    value={form.uf}
                    onChange={handleChange}
                    placeholder="UF"
                    maxLength={2}
                    className={`${inputClass} uppercase`}
                  />
                </div>
                <input
                  type="text"
                  name="cep"
                  value={form.cep}
                  onChange={handleChange}
                  placeholder="CEP (00000-000)"
                  className={inputClass}
                />
              </div>
            </div>

            {/* Botões */}
            <div className="flex gap-3">
              <button
                onClick={() => router.push("/clientes/gerenciar")}
                className="flex-1 py-2.5 rounded-lg border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={handleSalvar}
                className="flex-1 flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white py-2.5 rounded-lg font-semibold text-sm transition-all shadow-md"
              >
                <Save className="w-4 h-4" /> Salvar
              </button>
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
            <h2 className="text-lg font-bold text-gray-800 mb-1">Sucesso!</h2>
            <p className="text-xs text-gray-400 mb-6">
              Cliente atualizado com sucesso.
            </p>
            <button
              onClick={() => router.push("/clientes/gerenciar")}
              className="w-full py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold text-sm transition-all"
            >
              Fechar
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
            <h2 className="text-lg font-bold text-gray-800 mb-1">
              Erro ao atualizar
            </h2>
            <p className="text-xs text-gray-400 mb-6">{erroMsg}</p>
            <button
              onClick={() => setModalErro(false)}
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
