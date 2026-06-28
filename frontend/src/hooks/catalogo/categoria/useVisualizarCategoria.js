// src/hooks/catalogo/categoria/useVisualizarCategoria.js
import { useState, useEffect } from "react";

export function useVisualizarCategoria(id) {
  const [loading, setLoading] = useState(true);
  const [categoria, setCategoria] = useState(null);
  const [erro, setErro] = useState(false);

  useEffect(() => {
    console.log("ID que chegou no hook:", id);

    if (!id) return;

    setLoading(true);
    setErro(false);

    fetch(`http://localhost:3000/api/categorias/${id}`)
      .then((res) => {
        console.log("Status da resposta:", res.status);
        if (!res.ok) throw new Error("Categoria não encontrada");
        return res.json();
      })
      .then((data) => {
        const produtosFormatados = data.produto?.map((prod) => {
          return {
            ...prod,
            preco_compra: prod.preco_compra ? Number(prod.preco_compra) : null,
            preco_custo: prod.preco_custo ? Number(prod.preco_custo) : null,
            preco_venda: prod.preco_venda ? Number(prod.preco_venda) : 0,
            margem_lucro: prod.margem_lucro ? Number(prod.margem_lucro) : null,
          };
        }) ?? [];

        setCategoria({ ...data, produto: produtosFormatados });
        setLoading(false);
      })
      .catch((err) => {
        console.error("Erro ao buscar categoria:", err);
        setErro(true);
        setLoading(false);
      });
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