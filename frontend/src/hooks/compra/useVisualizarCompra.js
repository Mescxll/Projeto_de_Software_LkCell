// Lógica de Tela para visualização de Compra

import { useState, useEffect } from "react";

export function useVisualizarCompra(id) {
  const [loading, setLoading] = useState(true);
  const [compra, setCompra] = useState(null);
  const [erro, setErro] = useState(false);

  useEffect(() => {
    if (!id) return;

    fetch(`http://localhost:3000/api/compras/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Compra não encontrada");
        return res.json();
      })
      .then((data) => {
        const itensComLocalizacao = data.itenscompra.map((item) => {
          const entrada = data.estoque?.find(
            (e) =>
              e.fk_produto_id === item.fk_produto_id_produto &&
              e.tipo_movimento === "ENTRADA",
          );

          return {
            ...item,
            localizacao: entrada?.localizacao?.localizacao ?? null,
          };
        });

        setCompra({
          ...data,
          itenscompra: itensComLocalizacao,
        });

        setLoading(false);
      })
      .catch((err) => {
        console.error("Erro ao buscar compra:", err);
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
    compra,
    erro,
    formatarPreco,
    formatarData,
    formatarDataSimples,
  };
}
