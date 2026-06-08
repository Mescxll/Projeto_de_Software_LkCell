// Lógica da Tela de Cadastrar Compra
import { useState, useEffect } from "react";

export function useCadastrarCompra() {
  const [fornecedores, setFornecedores] = useState([]);
  const [produtos, setProdutos] = useState([]);
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
    preco_custo: "",
  });

  // Busca fornecedores e produtos ao abrir
  useEffect(() => {
    const buscarDados = async () => {
      try {
        const [resFornecedores, resProdutos] = await Promise.all([
          fetch("http://localhost:3000/api/fornecedores"),
          fetch("http://localhost:3000/api/produtos"),
        ]);

        if (resFornecedores.ok) {
          const data = await resFornecedores.json();
          setFornecedores(Array.isArray(data) ? data : []);
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

  const handleAddItem = () => {
    if (!itemForm.fk_produto_id_produto || !itemForm.quantidade || !itemForm.preco_custo) {
      setErroMsg("Selecione um produto, informe a quantidade e o preço de custo.");
      setModal("erro");
      return;
    }

    const qty = parseInt(itemForm.quantidade);
    if (qty <= 0 || !Number.isInteger(qty)) {
      setErroMsg("A quantidade deve ser um número inteiro maior que zero.");
      setModal("erro");
      return;
    }

    // Converte formato brasileiro (1.234,56 ou 1234,56 ou 1234.56) para float
    const parseBRL = (str) => Number(str.replace(/\./g, "").replace(",", "."));
    const custo = parseBRL(itemForm.preco_custo);
    if (isNaN(custo) || custo <= 0) {
      setErroMsg("O preço de custo deve ser um número maior que zero.");
      setModal("erro");
      return;
    }

    const produtoSelecionado = produtos.find(
      (p) => p.id_produto === parseInt(itemForm.fk_produto_id_produto)
    );

    if (!produtoSelecionado) {
      setErroMsg("Produto não encontrado.");
      setModal("erro");
      return;
    }

    // Verifica se o produto já foi adicionado
    if (
      form.itens.some(
        (i) => i.fk_produto_id_produto === parseInt(itemForm.fk_produto_id_produto)
      )
    ) {
      setErroMsg("Este produto já foi adicionado. Ajuste a quantidade em vez de repetir o produto.");
      setModal("erro");
      return;
    }

    const novoItem = {
      fk_produto_id_produto: parseInt(itemForm.fk_produto_id_produto),
      quantidade: qty,
      preco_custo: custo,
      produtoNome: produtoSelecionado.nome || produtoSelecionado.codigo_produto,
    };

    setForm({
      ...form,
      itens: [...form.itens, novoItem],
    });

    setItemForm({
      fk_produto_id_produto: "",
      quantidade: "",
      preco_custo: "",
    });
  };

  const handleRemoveItem = (produtoId) => {
    setForm({
      ...form,
      itens: form.itens.filter((i) => i.fk_produto_id_produto !== produtoId),
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleChangeItem = (e) => {
    const { name, value } = e.target;

    if (name === "quantidade") {
      // Permite apenas inteiros positivos
      const num = value.replace(/\D/g, "");
      setItemForm({ ...itemForm, [name]: num });
    } else if (name === "preco_custo") {
      // Permite dígitos, vírgula e ponto (formato brasileiro: 1.234,56)
      const num = value.replace(/[^0-9.,]/g, "");
      setItemForm({ ...itemForm, [name]: num });
    } else {
      setItemForm({ ...itemForm, [name]: value });
    }
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
        preco_custo: item.preco_custo,
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
          preco_custo: "",
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

  const calcularTotal = () => {
    return form.itens.reduce((acc, item) => {
      return acc + item.preco_custo * item.quantidade;
    }, 0);
  };

  return {
    fornecedores,
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
    handleChange,
    handleChangeItem,
    handleAddItem,
    handleRemoveItem,
    handleSubmit,
    formatarPreco,
    calcularTotal,
  };
}