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
    setErro(false); // Reseta o estado de erro caso o ID mude

    fetch(`http://localhost:3000/api/catalogo/categoria/${id}`)
      .then((res) => {
        console.log("Status da resposta:", res.status);
        if (!res.ok) throw new Error("Categoria não encontrada");
        return res.json();
      })
      .then((data) => {
        // Mapeia os produtos da categoria para garantir a formatação correta de campos sensíveis (como decimais do banco)
        const produtosFormatados = data.produto?.map((prod) => {
          return {
            ...prod,
            // Garante que os preços vindos como String/Decimal do banco sejam tratados como números no JS
            preco_compra: prod.preco_compra ? Number(prod.preco_compra) : null,
            preco_custo: prod.preco_custo ? Number(prod.preco_custo) : null,
            preco_venda: prod.preco_venda ? Number(prod.preco_venda) : 0,
            margem_lucro: prod.margem_lucro ? Number(prod.margem_lucro) : null,
          };
        }) ?? [];

        // Atualiza o estado mantendo a estrutura da categoria e injetando os produtos tratados
        setCategoria({ ...data, produto: produtosFormatados });
        setLoading(false);
      })
      .catch((err) => {
        console.error("Erro ao buscar categoria:", err);
        setErro(true);
        setLoading(false);
      });
  }, [id]);

  // Função utilitária idêntica à de Vendas para exibir os preços dos produtos na tela
  const formatarPreco = (valor) => {
    if (valor === null || valor === undefined) return "-";
    return Number(valor).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  // Retorna os mesmos estados e utilitários para manter a consistência do projeto
  return {
    loading,
    categoria,
    erro,
    formatarPreco,
  };
}