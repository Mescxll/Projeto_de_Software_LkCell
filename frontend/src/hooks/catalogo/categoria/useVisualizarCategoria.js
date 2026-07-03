// src/hooks/catalogo/categoria/useVisualizarCategoria.js
import { useState, useEffect } from "react";

export function useVisualizarCategoria(id) {
  const [loading, setLoading] = useState(true);
  const [categoria, setCategoria] = useState(null);
  const [erro, setErro] = useState(false);

  useEffect(() => {
    if (!id) return;

    const buscar = async () => {
      setLoading(true);
      setErro(false);

      try {
        const res = await fetch(`http://localhost:3000/api/categorias/${id}`);
        if (!res.ok) throw new Error("Categoria não encontrada");
        const data = await res.json();

        const produtosFormatados =
          data.produto?.map((prod) => ({
            ...prod,
            preco_compra: prod.preco_compra ? Number(prod.preco_compra) : null,
            preco_custo: prod.preco_custo ? Number(prod.preco_custo) : null,
            preco_venda: prod.preco_venda ? Number(prod.preco_venda) : 0,
            margem_lucro: prod.margem_lucro ? Number(prod.margem_lucro) : null,
          })) ?? [];

        setCategoria({ ...data, produto: produtosFormatados });
      } catch (err) {
        console.error("Erro ao buscar categoria:", err);
        setErro(true);
      } finally {
        setLoading(false);
      }
    };

    buscar();
  }, [id]);

  const formatarPreco = (valor) => {
    if (valor === null || valor === undefined) return "-";
    return Number(valor).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  return {
    loading,
    categoria,
    erro,
    formatarPreco,
  };
}
