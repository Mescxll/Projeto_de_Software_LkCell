// Lógica da Tela de Cadastrar Compra
import { useState, useEffect } from "react";

export function useCadastrarCompra() {
  const [fornecedores, setFornecedores] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [localizacoes, setLocalizacoes] = useState([]);
  const [modal, setModal] = useState(null);
  const [erroMsg, setErroMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingDados, setLoadingDados] = useState(true);

  const [form, setForm] = useState({
    fk_fornecedor_id_fornecedor: "",
    prazo_entrega: "",
    itens: [],
  });

  const [itemForm, setItemForm] = useState({
    fk_produto_id_produto: "",
    quantidade: "",
    preco_compra: "",
    fk_localizacao_id: "",
  });

  // Busca fornecedores, produtos e localizações ao abrir
  useEffect(() => {
    const buscarDados = async () => {
      try {
        const [resFornecedores, resProdutos, resLocalizacoes] =
          await Promise.all([
            fetch("http://localhost:3000/api/fornecedores"),
            fetch("http://localhost:3000/api/produtos"),
            fetch("http://localhost:3000/api/localizacoes"),
          ]);

        if (resFornecedores.ok) {
          const data = await resFornecedores.json();
          setFornecedores(Array.isArray(data) ? data : []);
        }

        if (resProdutos.ok) {
          const data = await resProdutos.json();
          setProdutos(Array.isArray(data) ? data : []);
        }

        if (resLocalizacoes.ok) {
          const data = await resLocalizacoes.json();
          setLocalizacoes(Array.isArray(data) ? data : []);
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Única declaração — auto-preenche preco_compra ao selecionar produto
  const handleChangeItem = (e) => {
    const { name, value } = e.target;

    if (name === "quantidade") {
      setItemForm((prev) => ({ ...prev, [name]: value.replace(/\D/g, "") }));
      return;
    }

    if (name === "preco_compra") {
      setItemForm((prev) => ({
        ...prev,
        [name]: value.replace(/[^0-9.,]/g, ""),
      }));
      return;
    }

    if (name === "fk_produto_id_produto") {
      const produtoSelecionado = produtos.find(
        (p) => p.id_produto === parseInt(value),
      );
      setItemForm((prev) => ({
        ...prev,
        fk_produto_id_produto: value,
        preco_compra: produtoSelecionado?.preco_compra
          ? Number(produtoSelecionado.preco_compra).toLocaleString("pt-BR", {
              minimumFractionDigits: 2,
            })
          : "",
      }));
      return;
    }

    setItemForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddItem = () => {
    if (
      !itemForm.fk_produto_id_produto ||
      !itemForm.quantidade ||
      !itemForm.preco_compra ||
      !itemForm.fk_localizacao_id
    ) {
      setErroMsg(
        "Selecione um produto, informe a quantidade, o preço de compra e a localização.",
      );
      setModal("erro");
      return;
    }

    const qty = parseInt(itemForm.quantidade);
    if (qty <= 0 || !Number.isInteger(qty)) {
      setErroMsg("A quantidade deve ser um número inteiro maior que zero.");
      setModal("erro");
      return;
    }

    const parseBRL = (str) => Number(str.replace(/\./g, "").replace(",", "."));
    const precoCompra = parseBRL(itemForm.preco_compra);
    if (isNaN(precoCompra) || precoCompra <= 0) {
      setErroMsg("O preço de compra deve ser um número maior que zero.");
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

    // Só bloqueia se for o mesmo produto NA MESMA localização
    if (
      form.itens.some(
        (i) =>
          i.fk_produto_id_produto ===
            parseInt(itemForm.fk_produto_id_produto) &&
          i.fk_localizacao_id === parseInt(itemForm.fk_localizacao_id),
      )
    ) {
      setErroMsg(
        "Este produto já foi adicionado nessa localização. Ajuste a quantidade em vez de repetir o item.",
      );
      setModal("erro");
      return;
    }

    const localizacaoSelecionada = localizacoes.find(
      (l) => l.id_localizacao === parseInt(itemForm.fk_localizacao_id),
    );

    const novoItem = {
      fk_produto_id_produto: parseInt(itemForm.fk_produto_id_produto),
      quantidade: qty,
      preco_compra: precoCompra,
      fk_localizacao_id: parseInt(itemForm.fk_localizacao_id),
      produtoNome:
        produtoSelecionado.descricao || produtoSelecionado.codigo_produto,
      localizacaoNome: localizacaoSelecionada?.localizacao ?? "—",
    };

    setForm((prev) => ({ ...prev, itens: [...prev.itens, novoItem] }));

    setItemForm({
      fk_produto_id_produto: "",
      quantidade: "",
      preco_compra: "",
      fk_localizacao_id: "",
    });
  };

  // Remove por produto + localização (PK composta)
  const handleRemoveItem = (produtoId, localizacaoId) => {
    setForm((prev) => ({
      ...prev,
      itens: prev.itens.filter(
        (i) =>
          !(
            i.fk_produto_id_produto === produtoId &&
            String(i.fk_localizacao_id) === String(localizacaoId)
          ),
      ),
    }));
  };

  const handleSubmit = async () => {
    if (!form.fk_fornecedor_id_fornecedor || form.itens.length === 0) {
      setErroMsg("Selecione um fornecedor e adicione pelo menos um produto.");
      setModal("erro");
      return;
    }

    setIsSubmitting(true);

    const body = {
      fk_fornecedor_id_fornecedor: parseInt(form.fk_fornecedor_id_fornecedor),
      prazo_entrega: form.prazo_entrega || null,
      itens: form.itens.map((item) => ({
        fk_produto_id_produto: item.fk_produto_id_produto,
        quantidade: item.quantidade,
        preco_compra: item.preco_compra,
        fk_localizacao_id: item.fk_localizacao_id,
      })),
    };

    try {
      const res = await fetch("http://localhost:3000/api/compras", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        setModal("sucesso");
        setForm({
          fk_fornecedor_id_fornecedor: "",
          prazo_entrega: "",
          itens: [],
        });
        setItemForm({
          fk_produto_id_produto: "",
          quantidade: "",
          preco_compra: "",
          fk_localizacao_id: "",
        });
      } else {
        const data = await res.json();
        setErroMsg(data.erro || "Erro ao cadastrar compra.");
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

  const calcularTotal = () =>
    form.itens.reduce(
      (acc, item) => acc + item.preco_compra * item.quantidade,
      0,
    );

  return {
    fornecedores,
    produtos,
    localizacoes,
    modal,
    setModal,
    erroMsg,
    isSubmitting,
    loadingDados,
    form,
    setForm,
    itemForm,
    setItemForm,
    handleChange,
    handleChangeItem,
    handleAddItem,
    handleRemoveItem,
    handleSubmit,
    formatarPreco,
    calcularTotal,
  };
}
