// Lógica da Tela de Visualizar Venda
import { useState, useEffect } from "react";

export function useVisualizarVenda(id) {
  const [loading, setLoading] = useState(true);
  const [venda, setVenda] = useState(null);
  const [erro, setErro] = useState(false);

  useEffect(() => {
    if (!id) return;

    fetch(`http://localhost:3000/api/vendas/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Venda não encontrada");
        return res.json();
      })
      .then((data) => {
        setVenda(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Erro ao buscar venda:", err);
        setErro(true);
        setLoading(false);
      });
  }, [id]);

  const formatarPreco = (valor) =>
    Number(valor).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });

  const formatarData = (data) => {
    if (!data) return "-";
    try {
      return new Date(data).toLocaleString("pt-BR", {
        timeZone: "America/Sao_Paulo",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "-";
    }
  };

  const formatarDataSimples = (data) => {
    if (!data) return "-";
    try {
      return new Date(data).toLocaleDateString("pt-BR");
    } catch {
      return "-";
    }
  };

  return {
    loading,
    venda,
    erro,
    formatarPreco,
    formatarData,
    formatarDataSimples,
  };
}
