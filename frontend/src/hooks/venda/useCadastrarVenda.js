// Lógica da Tela de Cadastrar Vendas
import { useState, useEffect } from "react";

export function useCadastrarVenda() {
  const [clientes, setClientes] = useState([]);
  const [funcionarios, setFuncionarios] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [modal, setModal] = useState(null);
  const [erroMsg, setErroMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingDados, setLoadingDados] = useState(true);

  // Estoques por localização do produto atualmente selecionado no itemForm.
  // Formato: [{ id_localizacao, localizacao, estoque_atual }]
  const [estoquesPorLocalizacao, setEstoquesPorLocalizacao] = useState([]);
  const [loadingEstoque, setLoadingEstoque] = useState(false);

  const [form, setForm] = useState({
    fk_cliente_id_cliente: "",
    fk_funcionario_id_funcionario: "",
    status_pagamento: "EM_ABERTO",
    data_vencimento: "",
    itens: [],
  });

  const [itemForm, setItemForm] = useState({
    fk_produto_id_produto: "",
    fk_localizacao_id: "",
    quantidade_vendida: "",
    preco_unitario: "",
  });

  // Busca clientes, funcionários e produtos ao abrir
  useEffect(() => {
    const buscarDados = async () => {
      try {
        const [resClientes, resFuncionarios, resProdutos] = await Promise.all([
          fetch("http://localhost:3000/api/clientes"),
          fetch("http://localhost:3000/api/funcionarios"),
          fetch("http://localhost:3000/api/produtos"),
        ]);

        if (resClientes.ok) {
          const data = await resClientes.json();
          setClientes(Array.isArray(data) ? data : []);
        }

        if (resFuncionarios.ok) {
          const data = await resFuncionarios.json();
          setFuncionarios(Array.isArray(data) ? data : []);
        }

        if (resProdutos.ok) {
          const data = await resProdutos.json();
          setProdutos(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error("Erro ao buscar dados:", err);
        setErroMsg("Erro ao carregar dados do sistema.");
        setModal("erro");
      } finally {
        setLoadingDados(false);
      }
    };

    buscarDados();
  }, []);

  // Sempre que o produto selecionado mudar, busca o estoque por localização
  useEffect(() => {
    const produtoId = itemForm.fk_produto_id_produto;

    if (!produtoId) {
      setEstoquesPorLocalizacao([]);
      return;
    }

    const buscarEstoque = async () => {
      setLoadingEstoque(true);
      setEstoquesPorLocalizacao([]);
      // Limpa a localização anterior ao trocar de produto
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itemForm.fk_produto_id_produto]);

  // Retorna o estoque disponível da localização atualmente selecionada (ou null)
  const estoqueDisponivel = (() => {
    if (!itemForm.fk_localizacao_id) return null;
    const loc = estoquesPorLocalizacao.find(
      (l) => String(l.id_localizacao) === String(itemForm.fk_localizacao_id),
    );
    return loc?.estoque_atual ?? null;
  })();

  const handleAddItem = () => {
    if (
      !itemForm.fk_produto_id_produto ||
      !itemForm.quantidade_vendida ||
      !itemForm.fk_localizacao_id
    ) {
      setErroMsg(
        "Selecione um produto, uma localização e informe a quantidade.",
      );
      setModal("erro");
      return;
    }

    const qty = parseInt(itemForm.quantidade_vendida);
    if (qty <= 0) {
      setErroMsg("A quantidade deve ser maior que zero.");
      setModal("erro");
      return;
    }

    // Valida contra o estoque da localização escolhida
    if (estoqueDisponivel !== null && qty > estoqueDisponivel) {
      setErroMsg(
        `Quantidade solicitada (${qty}) excede o estoque disponível na localização selecionada (${estoqueDisponivel}).`,
      );
      setModal("erro");
      return;
    }

    const produtoSelecionado = produtos.find(
      (p) => p.id_produto === parseInt(itemForm.fk_produto_id_produto),
    );

    if (!produtoSelecionado) {
      setErroMsg("Produto não encontrado.");
      setModal("erro");
      return;
    }

    // Verifica se o produto + localização já foi adicionado
    if (
      form.itens.some(
        (i) =>
          i.fk_produto_id_produto ===
            parseInt(itemForm.fk_produto_id_produto) &&
          String(i.fk_localizacao_id) === String(itemForm.fk_localizacao_id),
      )
    ) {
      setErroMsg(
        "Este produto já foi adicionado nesta localização. Remova-o para adicionar novamente.",
      );
      setModal("erro");
      return;
    }

    const localizacaoSelecionada = estoquesPorLocalizacao.find(
      (l) => String(l.id_localizacao) === String(itemForm.fk_localizacao_id),
    );

    const novoItem = {
      fk_produto_id_produto: parseInt(itemForm.fk_produto_id_produto),
      fk_localizacao_id: parseInt(itemForm.fk_localizacao_id),
      quantidade_vendida: qty,
      preco_unitario: produtoSelecionado.preco_venda,
      produtoNome: produtoSelecionado.nome || produtoSelecionado.codigo_produto,
      localizacaoNome: localizacaoSelecionada?.localizacao ?? "—",
    };

    setForm({
      ...form,
      itens: [...form.itens, novoItem],
    });

    setItemForm({
      fk_produto_id_produto: "",
      fk_localizacao_id: "",
      quantidade_vendida: "",
      preco_unitario: "",
    });
    setEstoquesPorLocalizacao([]);
  };

  const handleRemoveItem = (produtoId, localizacaoId) => {
    setForm({
      ...form,
      itens: form.itens.filter(
        (i) =>
          !(
            i.fk_produto_id_produto === produtoId &&
            i.fk_localizacao_id === localizacaoId
          ),
      ),
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

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

  const handleSelecionarProduto = (produtoId) => {
    const produtoSelecionado = produtos.find(
      (p) => p.id_produto === parseInt(produtoId),
    );

    setItemForm((prev) => ({
      ...prev,
      fk_produto_id_produto: produtoId,
      preco_unitario: produtoSelecionado?.preco_venda || "",
      fk_localizacao_id: "",
      quantidade_vendida: "",
    }));
  };

  const handleSubmit = async () => {
    if (!form.fk_funcionario_id_funcionario || form.itens.length === 0) {
      setErroMsg("Selecione um funcionário e pelo menos um item.");
      setModal("erro");
      return;
    }

    setIsSubmitting(true);

    const body = {
      fk_cliente_id_cliente: form.fk_cliente_id_cliente
        ? parseInt(form.fk_cliente_id_cliente)
        : null,
      fk_funcionario_id_funcionario: parseInt(
        form.fk_funcionario_id_funcionario,
      ),
      status_pagamento: form.status_pagamento,
      data_vencimento: form.data_vencimento || null,
      // Cada item carrega sua própria localização
      itens: form.itens.map((item) => ({
        fk_produto_id_produto: item.fk_produto_id_produto,
        fk_localizacao_id: item.fk_localizacao_id,
        quantidade_vendida: item.quantidade_vendida,
      })),
    };

    try {
      const res = await fetch("http://localhost:3000/api/vendas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        setModal("sucesso");
        setForm({
          fk_cliente_id_cliente: "",
          fk_funcionario_id_funcionario: "",
          status_pagamento: "EM_ABERTO",
          data_vencimento: "",
          itens: [],
        });
      } else {
        const data = await res.json();
        setErroMsg(data.erro || "Erro ao cadastrar venda.");
        setModal("erro");
      }
    } catch {
      setErroMsg("Não foi possível conectar ao servidor.");
      setModal("erro");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatarPreco = (valor) =>
    Number(valor).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });

  const calcularTotal = () => {
    return form.itens.reduce((acc, item) => {
      return acc + item.preco_unitario * item.quantidade_vendida;
    }, 0);
  };

  return {
    clientes,
    funcionarios,
    produtos,
    modal,
    setModal,
    erroMsg,
    isSubmitting,
    loadingDados,
    form,
    setForm,
    itemForm,
    setItemForm,
    estoquesPorLocalizacao,
    loadingEstoque,
    estoqueDisponivel,
    handleChange,
    handleSelecionarProduto,
    handleChangeItem,
    handleAddItem,
    handleRemoveItem,
    handleSubmit,
    formatarPreco,
    calcularTotal,
  };
}
