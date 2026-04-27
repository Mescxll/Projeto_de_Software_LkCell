"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import {
  ArrowLeft,
  UserPlus,
  Search,
  Pencil,
  Trash2,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";

export default function GerenciarClientes() {
  const [clientes, setClientes] = useState([]);
  const [busca, setBusca] = useState("");
  const [menuAberto, setMenuAberto] = useState(null);
  const [modalConfirmar, setModalConfirmar] = useState(false);
  const [modalSucesso, setModalSucesso] = useState(false);
  const [clienteSelecionado, setClienteSelecionado] = useState(null);
  const menuRef = useRef(null);

  useEffect(() => {
    fetch("http://localhost:3000/api/clientes")
      .then((res) => res.json())
      .then((data) => setClientes(data))
      .catch((err) => console.error("Erro ao buscar dados do Supabase:", err));
  }, []);

  // Fecha o menu ao clicar fora
  useEffect(() => {
    const handleClickFora = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuAberto(null);
      }
    };
    document.addEventListener("mousedown", handleClickFora);
    return () => document.removeEventListener("mousedown", handleClickFora);
  }, []);

  const handleExcluir = async () => {
    if (!clienteSelecionado) return;

    const doc =
      clienteSelecionado.pessoafisica?.cpf ||
      clienteSelecionado.pessoajuridica?.cnpj;

    await fetch(`http://localhost:3000/api/clientes/${doc}`, {
      method: "DELETE",
    });

    setClientes((prev) =>
      prev.filter((c) => c.id_cliente !== clienteSelecionado.id_cliente),
    );

    setModalConfirmar(false);
    setMenuAberto(null);
    setModalSucesso(true);
  };

  const clientesFiltrados = clientes.filter((c) => {
    const doc = c.pessoafisica?.cpf || c.pessoajuridica?.cnpj || "";
    const id = String(c.id_cliente || "");
    return (
      c.nome?.toLowerCase().includes(busca.toLowerCase()) ||
      doc.includes(busca) ||
      c.email?.toLowerCase().includes(busca.toLowerCase()) ||
      id.includes(busca)
    );
  });

  return (
    <>
      <Navbar />
      <main className="p-8 px-55 min-h-screen bg-[#f4f6fb]">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="p-1.5 hover:bg-gray-200 rounded-full transition-all"
            >
              <ArrowLeft className="w-5 h-5 text-gray-500" />
            </Link>
            <div>
              <h1 className="text-lg font-bold text-gray-800 leading-tight">
                Clientes
              </h1>
              <p className="text-xs text-gray-400">
                Gerencie os clientes do sistema
              </p>
            </div>
          </div>
          <Link href="/clientes/cadastro">
            <button className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-5 py-2.5 rounded-lg font-semibold shadow-md transition-all text-sm">
              <UserPlus className="w-4 h-4" /> Cadastrar Cliente
            </button>
          </Link>
        </div>

        {/* Busca */}
        <div className="relative w-full max-w-xl mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Buscar por nome, ID, CPF ou CNPJ..."
            className="w-full pl-9 pr-4 py-2 border border-gray-200 text-gray-800 rounded-lg bg-white text-sm focus:ring-2 focus:ring-blue-500 outline-none shadow-sm placeholder:text-gray-400"
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>

        {/* Grid de Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {clientesFiltrados.map((c) => (
            <div
              key={c.id_cliente}
              className="relative bg-white border border-gray-100 rounded-xl px-6 py-5 shadow-sm hover:shadow-md hover:border-blue-200 transition-all cursor-pointer text-center"
              onClick={() =>
                setMenuAberto(menuAberto === c.id_cliente ? null : c.id_cliente)
              }
            >
              <p className="text-sm font-semibold text-gray-800">{c.nome}</p>
              <p className="text-xs text-gray-400 mt-1">ID: {c.id_cliente}</p>

              {/* Menu de ações */}
              {menuAberto === c.id_cliente && (
                <div
                  ref={menuRef}
                  className="absolute top-14 left-1/2 -translate-x-1/2 bg-white border border-gray-100 rounded-xl shadow-lg z-10 overflow-hidden w-36"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Link
                    href={`/clientes/atualizar/${c.pessoafisica?.cpf || c.pessoajuridica?.cnpj}`}
                  >
                    <button className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-blue-500 hover:bg-blue-50 transition-colors">
                      <Pencil className="w-4 h-4" /> Atualizar
                    </button>
                  </Link>
                  <button
                    onClick={() => {
                      setClienteSelecionado(c);
                      setModalConfirmar(true);
                    }}
                    className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" /> Excluir
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </main>
      {/* Modal Confirmar Exclusão */}
      {modalConfirmar && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-sm text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle className="w-9 h-9 text-red-500" />
              </div>
            </div>
            <h2 className="text-lg font-bold text-gray-800 mb-2">
              Confirmar Exclusão
            </h2>
            <p className="text-sm text-gray-500 mb-1">
              Tem certeza de que deseja excluir o cliente{" "}
              <span className="font-semibold text-gray-800">
                {clienteSelecionado?.nome}
              </span>
              ?
            </p>
            <p className="text-xs text-gray-400 mb-6">
              Esta ação não pode ser desfeita.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setModalConfirmar(false)}
                className="flex-1 py-2.5 rounded-lg border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={handleExcluir}
                className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold text-sm transition-all"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Sucesso Exclusão */}
      {modalSucesso && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-sm text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="w-9 h-9 text-green-500" />
              </div>
            </div>
            <h2 className="text-lg font-bold text-gray-800 mb-1">Sucesso!</h2>
            <p className="text-xs text-gray-400 mb-6">
              Cliente excluído com sucesso.
            </p>
            <button
              onClick={() => setModalSucesso(false)}
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
