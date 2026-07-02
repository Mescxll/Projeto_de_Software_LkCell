import { useState, useEffect } from "react";

export function useAtualizarVenda(id) {
  const [loading, setLoading] = useState(true);
  const [venda, setVenda] = useState(null);
  const [erro, setErro] = useState(false);

  const [statusPagamentoNovo, setStatusPagamentoNovo] = useState("");
  const [dataVencimento, setDataVencimento] = useState("");
  const [clienteId, setClienteId] = useState("");
  const [funcionarioId, setFuncionarioId] = useState("");
  const [itens, setItens] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [funcionarios, setFuncionarios] = useState([]);

  const [itemForm, setItemForm] = useState({
    fk_produto_id_produto: "",
    fk_localizacao_id: "",
    quantidade_vendida: "",
    preco_unitario: "",
  });
  const [estoquesPorLocalizacao, setEstoquesPorLocalizacao] = useState([]);
  const [loadingEstoque, setLoadingEstoque] = useState(false);

  const [modalConfirmar, setModalConfirmar] = useState(false);
  const [modalCancelar, setModalCancelar] = useState(false);
  const [modalSucesso, setModalSucesso] = useState(false);
  const [modalSucessoCancelamento, setModalSucessoCancelamento] = useState(false);
  const [modalErro, setModalErro] = useState(false);
  const [erroMsg, setErroMsg] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    if (!id) return;

    Promise.all([
      fetch(`http://localhost:3000/api/vendas/${id}`).then((r) => {
        if (!r.ok) throw new Error("Venda não encontrada");
        return r.json();
      }),
      fetch("http://localhost:3000/api/produtos").then((r) => r.json()),
      fetch("http://localhost:3000/api/clientes").then((r) => r.json()),
      fetch("http://localhost:3000/api/funcionarios").then((r) => r.json()),
    ])
      .then(([vendaData, produtosData, clientesData, funcionariosData]) => {
        const itensComLocalizacao = vendaData.itensvenda.map((item) => ({
          ...item,
          localizacao: item.localizacao?.localizacao ?? "—",
        }));

        setVenda(vendaData);
        setStatusPagamentoNovo(vendaData.status_pagamento);
        setDataVencimento(
          vendaData.data_vencimento
            ? vendaData.data_vencimento.split("T")[0]
            : "",
        );
        setClienteId(vendaData.fk_cliente_id_cliente ?? "");
        setFuncionarioId(vendaData.fk_funcionario_id_funcionario ?? "");
        setItens(itensComLocalizacao);
        setProdutos(Array.isArray(produtosData) ? produtosData : []);
        setClientes(Array.isArray(clientesData) ? clientesData : []);
        setFuncionarios(Array.isArray(funcionariosData) ? funcionariosData : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setErro(true);
        setLoading(false);
      });
  }, [id]);

  useEffect(() => {
    const produtoId = itemForm.fk_produto_id_produto;

    if (!produtoId) {
      setEstoquesPorLocalizacao([]);
      return;
    }

    const buscarEstoque = async () => {
      setLoadingEstoque(true);
      setEstoquesPorLocalizacao([]);
      setItemForm((prev) => ({ ...prev, fk_localizacao_id: "" }));

      try {
        const res = await fetch(
          `http://localhost:3000/api/produtos/${produtoId}/estoque-por-localizacao`,
        );
        if (res.ok) {
          const data = await res.json();
          setEstoquesPorLocalizacao(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error("Erro ao buscar estoque por localização:", err);
      } finally {
        setLoadingEstoque(false);
      }
    };

    buscarEstoque();
  }, [itemForm.fk_produto_id_produto]);

  const estoqueDisponivel = (() => {
    if (!itemForm.fk_localizacao_id) return null;
    const loc = estoquesPorLocalizacao.find(
      (l) => String(l.id_localizacao) === String(itemForm.fk_localizacao_id),
    );
    return loc?.estoque_atual ?? null;
  })();

  const calcularTotal = () =>
    itens.reduce(
      (acc, item) =>
        acc +
        (Number(item.preco_unitario) || 0) *
          (Number(item.quantidade_vendida) || 0),
      0,
    );

  const handleChangeItem = (e) => {
    const { name, value } = e.target;

    if (name === "quantidade_vendida") {
      const num = value.replace(/\D/g, "");
      setItemForm((prev) => ({ ...prev, [name]: num }));
      return;
    }

    if (name === "fk_produto_id_produto") {
      const produtoSelecionado = produtos.find(
        (p) => p.id_produto === parseInt(value),
      );
      setItemForm((prev) => ({
        ...prev,
        fk_produto_id_produto: value,
        preco_unitario: produtoSelecionado?.preco_venda || "",
        fk_localizacao_id: "",
        quantidade_vendida: "",
      }));
      return;
    }

    setItemForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAdicionarItem = () => {
    if (
      !itemForm.fk_produto_id_produto ||
      !itemForm.quantidade_vendida ||
      !itemForm.fk_localizacao_id
    ) {
      setErroMsg("Selecione um produto, uma localização e informe a quantidade.");
      setModalErro(true);
      return;
    }

    const qty = parseInt(itemForm.quantidade_vendida);
    if (qty <= 0) {
      setErroMsg("A quantidade deve ser maior que zero.");
      setModalErro(true);
      return;
    }

    if (estoqueDisponivel !== null && qty > estoqueDisponivel) {
      setErroMsg(
        `Quantidade solicitada (${qty}) excede o estoque disponível na localização selecionada (${estoqueDisponivel}).`,
      );
      setModalErro(true);
      return;
    }

    const produtoSelecionado = produtos.find(
      (p) => p.id_produto === parseInt(itemForm.fk_produto_id_produto),
    );

    const jaExiste = itens.find(
      (i) =>
        i.fk_produto_id_produto === parseInt(itemForm.fk_produto_id_produto) &&
        String(i.fk_localizacao_id) === String(itemForm.fk_localizacao_id),
    );

    if (jaExiste) {
      setErroMsg(
        "Este produto já foi adicionado nesta localização. Altere a quantidade na tabela abaixo.",
      );
      setModalErro(true);
      return;
    }

    const localizacaoSelecionada = estoquesPorLocalizacao.find(
      (l) => String(l.id_localizacao) === String(itemForm.fk_localizacao_id),
    );

    setItens((prev) => [
      ...prev,
      {
        fk_produto_id_produto: parseInt(itemForm.fk_produto_id_produto),
        produto: produtoSelecionado,
        fk_localizacao_id: parseInt(itemForm.fk_localizacao_id),
        localizacao: localizacaoSelecionada?.localizacao ?? "—",
        quantidade_vendida: qty,
        preco_unitario: produtoSelecionado.preco_venda,
      },
    ]);

    setItemForm({
      fk_produto_id_produto: "",
      fk_localizacao_id: "",
      quantidade_vendida: "",
      preco_unitario: "",
    });
    setEstoquesPorLocalizacao([]);
  };

  const handleChangeQuantidade = (produtoId, localizacaoId, valor) => {
    setItens((prev) =>
      prev.map((item) =>
        item.fk_produto_id_produto === produtoId &&
        item.fk_localizacao_id === localizacaoId
          ? { ...item, quantidade_vendida: valor === "" ? "" : Number(valor) }
          : item,
      ),
    );
  };

  const handleRemoverItem = (produtoId, localizacaoId) => {
    setItens((prev) =>
      prev.filter(
        (item) =>
          !(
            item.fk_produto_id_produto === produtoId &&
            item.fk_localizacao_id === localizacaoId
          ),
      ),
    );
  };

  const handleSalvar = () => {
    if (!clienteId) {
      setErroMsg("Selecione um cliente.");
      setModalErro(true);
      return;
    }
    if (!funcionarioId) {
      setErroMsg("Selecione um funcionário.");
      setModalErro(true);
      return;
    }
    if (!statusPagamentoNovo) {
      setErroMsg("Selecione um status de pagamento.");
      setModalErro(true);
      return;
    }
    if (itens.length === 0) {
      setErroMsg("A venda deve ter pelo menos um produto.");
      setModalErro(true);
      return;
    }
    const itemInvalido = itens.find(
      (i) => !i.quantidade_vendida || Number(i.quantidade_vendida) <= 0,
    );
    if (itemInvalido) {
      setErroMsg(
        `Quantidade inválida para o produto "${itemInvalido.produto?.nome || itemInvalido.produto?.codigo_produto}".`,
      );
      setModalErro(true);
      return;
    }
    if (
      venda.status_pagamento === "PAGO" &&
      statusPagamentoNovo === "EM_ABERTO"
    ) {
      setErroMsg("Não é permitido alterar o status de 'PAGO' para 'EM_ABERTO'.");
      setModalErro(true);
      return;
    }
    setModalConfirmar(true);
  };

  const handleConfirmar = async () => {
    setModalConfirmar(false);
    setIsSubmitting(true);

    try {
      const res = await fetch(`http://localhost:3000/api/vendas/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fk_cliente_id_cliente: parseInt(clienteId),
          fk_funcionario_id_funcionario: parseInt(funcionarioId),
          status_pagamento: statusPagamentoNovo,
          data_vencimento: dataVencimento || null,
          itens: itens.map((i) => ({
            fk_produto_id_produto: i.fk_produto_id_produto,
            quantidade_vendida: Number(i.quantidade_vendida),
            preco_unitario: Number(i.preco_unitario),
            fk_localizacao_id: i.fk_localizacao_id ?? null,
          })),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setVenda(data.venda);
        setModalSucesso(true);
      } else {
        const data = await res.json();
        setErroMsg(data.erro || "Erro ao atualizar venda.");
        setModalErro(true);
      }
    } catch {
      setErroMsg("Não foi possível conectar ao servidor.");
      setModalErro(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelarVenda = async () => {
    setModalCancelar(false);
    setIsCancelling(true);
    try {
      const res = await fetch(`http://localhost:3000/api/vendas/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setVenda((prev) => ({ ...prev, status_venda: "CANCELADA" }));
        setModalSucessoCancelamento(true);
      } else {
        const data = await res.json();
        setErroMsg(data.erro || "Erro ao cancelar venda.");
        setModalErro(true);
      }
    } catch {
      setErroMsg("Não foi possível conectar ao servidor.");
      setModalErro(true);
    } finally {
      setIsCancelling(false);
    }
  };

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

  return {
    loading,
    venda,
    erro,
    statusPagamentoNovo,
    setStatusPagamentoNovo,
    dataVencimento,
    setDataVencimento,
    clienteId,
    setClienteId,
    funcionarioId,
    setFuncionarioId,
    clientes,
    funcionarios,
    itens,
    produtos,
    itemForm,
    estoquesPorLocalizacao,
    loadingEstoque,
    estoqueDisponivel,
    modalConfirmar,
    setModalConfirmar,
    modalCancelar,
    setModalCancelar,
    modalSucesso,
    setModalSucesso,
    modalSucessoCancelamento,
    setModalSucessoCancelamento,
    modalErro,
    setModalErro,
    erroMsg,
    isSubmitting,
    isCancelling,
    calcularTotal,
    handleChangeItem,
    handleChangeQuantidade,
    handleRemoverItem,
    handleAdicionarItem,
    handleSalvar,
    handleConfirmar,
    handleCancelarVenda,
    formatarPreco,
    formatarData,
  };
}