// hooks/catalogo/produto/useVisualizarProduto.js
import { useState, useEffect } from "react";

export function useVisualizarProduto(id) {
  const [loading, setLoading] = useState(true);
  const [produto, setProduto] = useState(null);
  const [erro, setErro] = useState(false);

  // Estoque agrupado por localização: [{ id_localizacao, localizacao, estoque_atual, estoque_minimo, estoque_ideal }]
  const [estoquePorLocalizacao, setEstoquePorLocalizacao] = useState([]);

  useEffect(() => {
    if (!id) return;

    let cancelado = false;

    Promise.all([
      fetch(`http://localhost:3000/api/produtos/${id}`).then((res) => {
        if (!res.ok) throw new Error("Produto não encontrado");
        return res.json();
      }),
      fetch(`http://localhost:3000/api/estoque/produto/${id}`).then((res) => {
        if (!res.ok) throw new Error("Erro ao buscar estoque por localização");
        return res.json();
      }),
    ])
      .then(([produtoData, estoqueData]) => {
        if (cancelado) return;
        setProduto(produtoData);
        setEstoquePorLocalizacao(estoqueData ?? []);
        setErro(false);
        setLoading(false);
      })
      .catch((err) => {
        if (cancelado) return;
        console.error("Erro ao buscar produto:", err);
        setErro(true);
        setLoading(false);
      });

    return () => {
      cancelado = true;
    };
  }, [id]);

  // Totais agregados (somando todas as localizações)
  const estoqueAtual =
    estoquePorLocalizacao.length > 0
      ? estoquePorLocalizacao.reduce((soma, loc) => soma + (loc.estoque_atual ?? 0), 0)
      : null;

  // Mínimo/ideal são únicos por produto (não variam por localização) — pega do primeiro registro
  const estoqueMinimoAtual = estoquePorLocalizacao[0]?.estoque_minimo ?? null;
  const estoqueIdealAtual = estoquePorLocalizacao[0]?.estoque_ideal ?? null;

  const formatarPreco = (valor) => {
    if (valor === null || valor === undefined) return "—";
    return Number(valor).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  const formatarMargem = (valor) => {
    if (valor === null || valor === undefined) return "—";
    return `${Number(valor).toFixed(2).replace(".", ",")}%`;
  };

  // Separa compatibilidades por tipo para facilitar a renderização
  const inclusoes =
    produto?.compatibilidades?.filter((c) => c.tipo === "INCLUSAO") ?? [];
  const exclusoes =
    produto?.compatibilidades?.filter((c) => c.tipo === "EXCLUSAO") ?? [];

  return {
    loading,
    produto,
    erro,
    estoqueAtual,
    estoqueMinimoAtual,
    estoqueIdealAtual,
    estoquePorLocalizacao,
    inclusoes,
    exclusoes,
    formatarPreco,
    formatarMargem,
  };
}