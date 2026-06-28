// Lógica da Tela de Gerenciar Estoque
import { useState, useEffect, useMemo, useCallback } from "react";

export function useGerenciarEstoque() {
  const [produtos, setProdutos] = useState([]);
  const [localizacoes, setLocalizacoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erroMsg, setErroMsg] = useState("");

  // filtros da tabela
  const [busca, setBusca] = useState("");
  const [filtroLocalizacao, setFiltroLocalizacao] = useState("");
  const [filtroStatus, setFiltroStatus] = useState(null); // null | abaixo_minimo | acima_ideal

  // linhas de produto expandidas (mostrando localizações)
  const [expandidos, setExpandidos] = useState(new Set());

  // controle de modais — só um aberto por vez
  const [modalAberto, setModalAberto] = useState(null); // null | "parametros" | "transferencia" | "historico"
  const [produtoSelecionado, setProdutoSelecionado] = useState(null);

  const buscarProdutos = useCallback(async () => {
    setLoading(true);
    setErroMsg("");
    try {
      const res = await fetch("http://localhost:3000/api/estoque");
      if (res.ok) {
        const data = await res.json();
        setProdutos(Array.isArray(data) ? data : []);
      } else {
        const data = await res.json();
        setErroMsg(data.erro || "Erro ao buscar dados de estoque.");
        setProdutos([]);
      }
    } catch {
      setErroMsg("Não foi possível conectar ao servidor.");
      setProdutos([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const buscarLocalizacoes = useCallback(async () => {
    try {
      const res = await fetch("http://localhost:3000/api/localizacoes");
      if (res.ok) {
        const data = await res.json();
        setLocalizacoes(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error("Erro ao buscar localizações:", err);
    }
  }, []);

  useEffect(() => {
    buscarProdutos();
    buscarLocalizacoes();
  }, [buscarProdutos, buscarLocalizacoes]);

  // Indicadores derivados localmente — evita um endpoint extra,
  // já que os dados de produtos já trazem tudo que é necessário.
  const indicadores = useMemo(() => {
    const movimentosHoje = null; // não disponível sem um endpoint dedicado

    const totalLocalizacoesAtivas = new Set(
      produtos.flatMap((p) =>
        p.localizacoes
          .filter((l) => l.estoque_atual > 0)
          .map((l) => l.id_localizacao ?? "sem_localizacao"),
      ),
    ).size;

    return {
      itensCadastrados: produtos.length,
      abaixoDoMinimo: produtos.filter((p) => p.status === "abaixo_minimo").length,
      localizacoesAtivas: totalLocalizacoesAtivas,
      movimentosHoje,
    };
  }, [produtos]);

  // Filtragem client-side (busca, localização, status)
  const produtosFiltrados = useMemo(() => {
    return produtos.filter((produto) => {
      if (busca) {
        const termo = busca.toLowerCase();
        const alvo = `${produto.nome ?? ""} ${produto.codigo_produto ?? ""}`.toLowerCase();
        if (!alvo.includes(termo)) return false;
      }

      if (filtroLocalizacao) {
        const temLocalizacao = produto.localizacoes.some(
          (l) => String(l.id_localizacao) === String(filtroLocalizacao),
        );
        if (!temLocalizacao) return false;
      }

      if (filtroStatus && produto.status !== filtroStatus) {
        return false;
      }

      return true;
    });
  }, [produtos, busca, filtroLocalizacao, filtroStatus]);

  const toggleExpandido = (produtoId) => {
    setExpandidos((prev) => {
      const novo = new Set(prev);
      if (novo.has(produtoId)) {
        novo.delete(produtoId);
      } else {
        novo.add(produtoId);
      }
      return novo;
    });
  };

  // Controle de modais
  const abrirModalParametros = (produto) => {
    setProdutoSelecionado(produto);
    setModalAberto("parametros");
  };

  const abrirModalTransferencia = (produto = null) => {
    setProdutoSelecionado(produto);
    setModalAberto("transferencia");
  };

  const abrirHistorico = (produto) => {
    setProdutoSelecionado(produto);
    setModalAberto("historico");
  };

  const fecharModal = () => {
    setModalAberto(null);
    setProdutoSelecionado(null);
  };

  // Chamado pelos modais via onSuccess — recarrega a lista sem fechar
  // o modal automaticamente (cada modal decide quando fechar).
  const recarregar = () => {
    buscarProdutos();
  };

  return {
    produtos: produtosFiltrados,
    localizacoes,
    loading,
    erroMsg,
    indicadores,

    busca,
    setBusca,
    filtroLocalizacao,
    setFiltroLocalizacao,
    filtroStatus,
    setFiltroStatus,

    expandidos,
    toggleExpandido,

    modalAberto,
    produtoSelecionado,
    abrirModalParametros,
    abrirModalTransferencia,
    abrirHistorico,
    fecharModal,

    recarregar,
  };
}