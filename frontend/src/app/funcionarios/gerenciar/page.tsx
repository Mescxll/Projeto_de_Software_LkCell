// Tela de Gerenciamento de Funcionario (listagem, Busca e Exlusão)
"use client";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import LoadingGerenciar from "@/components/LoadingGerenciar";
import { useGerenciarFuncionario } from "@/hooks/funcionarios/useGerenciarFuncionario";
import {
  ArrowLeft,
  UserPlus,
  Search,
  Pencil,
  Trash2,
  Loader2,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";

export default function GerenciarFuncionarios() {
  const {
    loading,
    isDeleting,
    busca,
    setBusca,
    menuAberto,
    setMenuAberto,
    modalConfirmar,
    setModalConfirmar,
    modalSucesso,
    setModalSucesso,
    funcionarioSelecionado,
    setFuncionarioSelecionado,
    menuRef,
    funcionariosFiltrados,
    handleExcluir,
    formatarData,
  } = useGerenciarFuncionario();

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
                Funcionários
              </h1>
              <p className="text-xs text-gray-400">
                Gerencie os funcionários do sistema
              </p>
            </div>
          </div>
          <Link href="/funcionarios/cadastrar">
            <button className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-5 py-2.5 rounded-lg font-semibold shadow-md transition-all text-sm">
              <UserPlus className="w-4 h-4" /> Cadastrar Funcionário
            </button>
          </Link>
        </div>

        {/* Busca */}
        <div className="relative w-full max-w-xl mb-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Buscar por nome ou ID..."
            className="w-full pl-9 pr-4 py-2 border border-gray-200 text-gray-800 rounded-lg bg-white text-sm focus:ring-2 focus:ring-blue-500 outline-none shadow-sm placeholder:text-gray-400"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>
        <div className="mb-6" />

        {/* Loading */}
        {loading ? (
          <LoadingGerenciar />
        ) : (
          <>
            {/* Grid de Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {funcionariosFiltrados.map((f) => (
                <div
                  key={f.id_funcionario}
                  className="relative bg-white border border-gray-100 rounded-xl px-6 py-5 shadow-sm hover:shadow-md hover:border-blue-200 transition-all cursor-pointer text-center"
                  onClick={() =>
                    setMenuAberto(
                      menuAberto === f.id_funcionario ? null : f.id_funcionario,
                    )
                  }
                >
                  <p className="text-sm font-semibold text-gray-800">
                    {f.nome || "Sem nome"}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    ID: {f.id_funcionario}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Nascimento: {formatarData(f.data_aniversario)}
                  </p>

                  {/* Menu de ações */}
                  {menuAberto === f.id_funcionario && (
                    <div
                      ref={menuRef}
                      className="absolute top-14 left-1/2 -translate-x-1/2 bg-white border border-gray-100 rounded-xl shadow-lg z-10 overflow-hidden w-36"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Link
                        href={`/funcionarios/atualizar/${f.id_funcionario}`}
                      >
                        <button className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-blue-500 hover:bg-blue-50 transition-colors">
                          <Pencil className="w-4 h-4" /> Atualizar
                        </button>
                      </Link>
                      <button
                        onClick={() => {
                          setFuncionarioSelecionado(f);
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

            {/* Mensagem de Vazio */}
            {funcionariosFiltrados.length === 0 && (
              <p className="text-sm text-gray-500 mt-6 text-center">
                Nenhum Funcionário Encontrado!
              </p>
            )}
          </>
        )}
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
              Tem certeza de que deseja excluir o funcionário{" "}
              <span className="font-semibold text-gray-800">
                {funcionarioSelecionado?.nome}
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
                disabled={isDeleting}
                className={`flex-1 flex items-center justify-center gap-2 text-white py-2.5 rounded-lg font-semibold text-sm transition-all
                  ${isDeleting ? "bg-red-400 cursor-not-allowed" : "bg-red-500 hover:bg-red-600"}
                `}
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Excluindo...
                  </>
                ) : (
                  "Confirmar"
                )}
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
              Funcionário excluído com sucesso.
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
