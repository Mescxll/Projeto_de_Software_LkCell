// Lógica do Painel de Histórico de Estoque
import { useState, useEffect } from "react";

export function useHistoricoEstoque(produto) {
  const [historico, setHistorico] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erroMsg, setErroMsg] = useState("");

  const [filtroTipo, setFiltroTipo] = useState(null); // null | ENTRADA | SAIDA | AJUSTE
  const [filtroLocalizacao, setFiltroLocalizacao] = useState(null);

  useEffect(() => {
    if (!produto?.id_produto) return;

    const buscarHistorico = async () => {
      setLoading(true);
      setErroMsg("");

      const params = new URLSearchParams();
      if (filtroTipo) params.set("tipo_movimento", filtroTipo);
      if (filtroLocalizacao) params.set("fk_localizacao_id", filtroLocalizacao);

      try {
        const res = await fetch(
          `http://localhost:3000/api/estoque/produto/${produto.id_produto}/historico?${params.toString()}`,
        );

        if (res.ok) {
          const data = await res.json();
          setHistorico(Array.isArray(data) ? data : []);
        } else {
          const data = await res.json();
          setErroMsg(data.erro || "Erro ao buscar histórico de estoque.");
          setHistorico([]);
        }
      } catch {
        setErroMsg("Não foi possível conectar ao servidor.");
        setHistorico([]);
      } finally {
        setLoading(false);
      }
    };

    buscarHistorico();
  }, [produto?.id_produto, filtroTipo, filtroLocalizacao]);

  return {
    historico,
    loading,
    erroMsg,
    filtroTipo,
    setFiltroTipo,
    filtroLocalizacao,
    setFiltroLocalizacao,
  };
}