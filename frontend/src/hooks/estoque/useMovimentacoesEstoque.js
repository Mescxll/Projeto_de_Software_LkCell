// Lógica da Tela de Movimentações de Estoque
import { useState, useEffect } from "react";

const POR_PAGINA = 20;

export function useMovimentacoesEstoque() {
  const [movimentacoes, setMovimentacoes] = useState([]);
  const [paginacao, setPaginacao] = useState({ pagina: 1, total: 0, total_paginas: 1 });
  const [loading, setLoading] = useState(true);
  const [erroMsg, setErroMsg] = useState("");

  const [pagina, setPagina] = useState(1);
  const [filtroTipo, setFiltroTipo] = useState(null); // null | ENTRADA | SAIDA | AJUSTE
  const [filtroDataInicio, setFiltroDataInicio] = useState("");
  const [filtroDataFim, setFiltroDataFim] = useState("");

  useEffect(() => {
    const buscar = async () => {
      setLoading(true);
      setErroMsg("");

      const params = new URLSearchParams();
      params.set("pagina", pagina);
      params.set("por_pagina", POR_PAGINA);
      if (filtroTipo) params.set("tipo_movimento", filtroTipo);
      if (filtroDataInicio) params.set("data_inicio", filtroDataInicio);
      if (filtroDataFim) params.set("data_fim", filtroDataFim);

      try {
        const res = await fetch(
          `http://localhost:3000/api/estoque/movimentacoes?${params.toString()}`,
        );

        if (res.ok) {
          const data = await res.json();
          setMovimentacoes(data.movimentacoes ?? []);
          setPaginacao(data.paginacao ?? { pagina: 1, total: 0, total_paginas: 1 });
        } else {
          const data = await res.json();
          setErroMsg(data.erro || "Erro ao buscar movimentações de estoque.");
          setMovimentacoes([]);
        }
      } catch {
        setErroMsg("Não foi possível conectar ao servidor.");
        setMovimentacoes([]);
      } finally {
        setLoading(false);
      }
    };

    buscar();
  }, [pagina, filtroTipo, filtroDataInicio, filtroDataFim]);

  // Reseta para a primeira página sempre que um filtro muda
  const aplicarFiltroTipo = (valor) => {
    setFiltroTipo(valor);
    setPagina(1);
  };

  const aplicarFiltroData = (inicio, fim) => {
    setFiltroDataInicio(inicio);
    setFiltroDataFim(fim);
    setPagina(1);
  };

  return {
    movimentacoes,
    paginacao,
    loading,
    erroMsg,
    pagina,
    setPagina,
    filtroTipo,
    setFiltroTipo: aplicarFiltroTipo,
    filtroDataInicio,
    filtroDataFim,
    aplicarFiltroData,
  };
}