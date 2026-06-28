"use client";

import Navbar from "@/components/Navbar";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useGerenciarEstoque } from "@/hooks/estoque/useGerenciarEstoque";
import EstoqueIndicadores from "@/components/estoque/EstoqueIndicadores";
import EstoqueTabela from "@/components/estoque/EstoqueTabela";
import ModalAjustarParametros from "@/components/estoque/ModalAjustarParametros";
import ModalTransferencia from "@/components/estoque/ModalTransferencia";
import PainelHistorico from "@/components/estoque/PainelHistorico";

export default function GerenciarEstoquePage() {
  const estoque = useGerenciarEstoque();

  return (
    <>
      <Navbar />
      <main className="p-8 px-55 min-h-screen bg-[#f8f9fa]">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="p-1.5 hover:bg-gray-200 rounded-full transition-all"
          >
            <ArrowLeft className="w-5 h-5 text-gray-500" />
          </Link>
          <div>
            <h1 className="text-lg font-bold text-gray-800 leading-tight">
              Estoque
            </h1>
            <p className="text-xs text-gray-400">
              Gerencie o estoque
            </p>
          </div>
        </div>
        <br></br>
        <EstoqueIndicadores
          dados={estoque.indicadores}
          onClickAlertas={() => estoque.setFiltroStatus("abaixo_minimo")}
        />
        <EstoqueTabela
          produtos={estoque.produtos}
          loading={estoque.loading}
          erroMsg={estoque.erroMsg}
          localizacoes={estoque.localizacoes}
          busca={estoque.busca}
          onBuscaChange={estoque.setBusca}
          filtroLocalizacao={estoque.filtroLocalizacao}
          onFiltroLocalizacaoChange={estoque.setFiltroLocalizacao}
          filtroStatus={estoque.filtroStatus}
          onFiltroStatusChange={estoque.setFiltroStatus}
          expandidos={estoque.expandidos}
          onToggleExpandido={estoque.toggleExpandido}
          onAjustarParametros={estoque.abrirModalParametros}
          onVerHistorico={estoque.abrirHistorico}
          onTransferirGeral={() => estoque.abrirModalTransferencia()}
        />

        {estoque.modalAberto === "parametros" && (
          <ModalAjustarParametros
            produto={estoque.produtoSelecionado}
            onClose={estoque.fecharModal}
            onSuccess={estoque.recarregar}
          />
        )}
        {estoque.modalAberto === "transferencia" && (
          <ModalTransferencia
            produtoInicial={estoque.produtoSelecionado}
            onClose={estoque.fecharModal}
            onSuccess={estoque.recarregar}
          />
        )}
        {estoque.modalAberto === "historico" && (
          <PainelHistorico
            produto={estoque.produtoSelecionado}
            onClose={estoque.fecharModal}
          />
        )}
      </main>
    </>
  );
}
