// hooks/compra/useVisualizarCompra.js
import { useState, useEffect } from "react";

export function useVisualizarCompra(id) {
  const [loading, setLoading] = useState(true);
  const [compra, setCompra] = useState(null);
  const [erro, setErro] = useState(false);

  useEffect(() => {
    if (!id) return;

    const buscar = async () => {
      setLoading(true);
      setErro(false);

      try {
        const res = await fetch(`http://localhost:3000/api/compras/${id}`);
        if (!res.ok) throw new Error("Compra não encontrada");
        const data = await res.json();

        // fk_localizacao_id é parte da PK composta de itenscompra
        // e localizacao já vem incluída pelo controller — não precisa
        // buscar no estoque (que colidiria com mesmo produto em 2 localizações)
        const itensComLocalizacao = data.itenscompra.map((item) => ({
          ...item,
          localizacao: item.localizacao?.localizacao ?? null,
        }));

        setCompra({ ...data, itenscompra: itensComLocalizacao });
      } catch (err) {
        console.error("Erro ao buscar compra:", err);
        setErro(true);
      } finally {
        setLoading(false);
      }
    };

    buscar();
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
      const dataUTC = new Date(data);
      if (Number.isNaN(dataUTC.getTime())) return "-";
      const dia = String(dataUTC.getUTCDate()).padStart(2, "0");
      const mes = String(dataUTC.getUTCMonth() + 1).padStart(2, "0");
      const ano = dataUTC.getUTCFullYear();
      return `${dia}/${mes}/${ano}`;
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