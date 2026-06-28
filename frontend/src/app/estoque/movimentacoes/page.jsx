"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import Navbar from "@/components/Navbar";
import { useMovimentacoesEstoque } from "@/hooks/estoque/useMovimentacoesEstoque";
import MovimentacoesTabela from "@/components/estoque/MovimentacoesTabela";

export default function MovimentacoesEstoquePage() {
  const {
    movimentacoes,
    paginacao,
    loading,
    erroMsg,
    filtroTipo,
    setFiltroTipo,
    filtroDataInicio,
    filtroDataFim,
    aplicarFiltroData,
    setPagina,
  } = useMovimentacoesEstoque();

  return (
    <>
      <Navbar />
      <main className="p-8 px-55 min-h-screen bg-[#f8f9fa]">
        <Link
          href="/estoque/gerenciar"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-3"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Voltar para o estoque
        </Link>

        <div className="mb-5">
          <h1 className="text-2xl text-gray-800">Movimentações de estoque</h1>
          <p className="font-light text-gray-500">
            Histórico de entradas, saídas e ajustes de todos os produtos
          </p>
        </div>

        <MovimentacoesTabela
          movimentacoes={movimentacoes}
          paginacao={paginacao}
          loading={loading}
          erroMsg={erroMsg}
          filtroTipo={filtroTipo}
          onFiltroTipoChange={setFiltroTipo}
          filtroDataInicio={filtroDataInicio}
          filtroDataFim={filtroDataFim}
          onFiltroDataChange={aplicarFiltroData}
          onPaginaChange={setPagina}
        />
      </main>
    </>
  );
}