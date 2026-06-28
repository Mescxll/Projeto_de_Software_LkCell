// hooks/estoque/useCadastrarEstoqueInicial.js
import { useState, useEffect } from "react";

export function useCadastrarEstoqueInicial(produtoIdInicial) {
  const [produtos, setProdutos] = useState([]);
  const [localizacoes, setLocalizacoes] = useState([]);
  const [loadingDados, setLoadingDados] = useState(true);
  const [modal, setModal] = useState(null); // null | "erro" | "sucesso" | "ja_tem_estoque"
  const [erroMsg, setErroMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState({
    fk_produto_id: produtoIdInicial ?? "",
    estoque_minimo: "",
    estoque_ideal: "",
  });

  const [estoqueEntradas, setEstoqueEntradas] = useState([]);
  const [estoqueForm, setEstoqueForm] = useState({
    fk_localizacao_id: "",
    quantidade: "",
  });

  const estoqueAtualTotal = estoqueEntradas.reduce(
    (acc, e) => acc + e.quantidade,
    0,
  );

  useEffect(() => {
    const buscarDados = async () => {
      try {
        const [resProdutos, resLocalizacoes] = await Promise.all([
          fetch("http://localhost:3000/api/produtos"),
          fetch("http://localhost:3000/api/localizacoes"),
        ]);
        const dataProdutos = resProdutos.ok ? await resProdutos.json() : [];
        const dataLocalizacoes = resLocalizacoes.ok
          ? await resLocalizacoes.json()
          : [];
        setProdutos(Array.isArray(dataProdutos) ? dataProdutos : []);
        setLocalizacoes(
          Array.isArray(dataLocalizacoes) ? dataLocalizacoes : [],
        );
      } catch (err) {
        console.error("Erro ao buscar dados:", err);
      } finally {
        setLoadingDados(false);
      }
    };
    buscarDados();
  }, []);

  // Quando o produto muda, verifica se já tem estoque
  useEffect(() => {
    if (!form.fk_produto_id) return;

    const verificarEstoque = async () => {
      try {
        const res = await fetch(
          `http://localhost:3000/api/estoque/produto/${form.fk_produto_id}`,
        );
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setModal("ja_tem_estoque");
          } else {
            setModal(null);
          }
        }
      } catch {
        // silencia — não bloqueia o usuário
      }
    };

    verificarEstoque();
  }, [form.fk_produto_id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value.replace(/\D/g, "") }));
  };

  const handleSelecionarProduto = (val) => {
    setForm((prev) => ({ ...prev, fk_produto_id: val }));
    setEstoqueEntradas([]);
    setEstoqueForm({ fk_localizacao_id: "", quantidade: "" });
  };

  const handleChangeEstoqueForm = (campo, valor) => {
    setEstoqueForm((prev) => ({ ...prev, [campo]: valor }));
  };

  const handleAdicionarEntrada = () => {
    if (!estoqueForm.fk_localizacao_id || !estoqueForm.quantidade) {
      setErroMsg("Selecione uma localização e informe a quantidade.");
      setModal("erro");
      return;
    }
    const qty = parseInt(estoqueForm.quantidade);
    if (!Number.isInteger(qty) || qty <= 0) {
      setErroMsg("A quantidade deve ser um número inteiro maior que zero.");
      setModal("erro");
      return;
    }
    const locId = parseInt(estoqueForm.fk_localizacao_id);
    if (estoqueEntradas.some((e) => e.fk_localizacao_id === locId)) {
      setErroMsg("Esta localização já foi adicionada.");
      setModal("erro");
      return;
    }
    const loc = localizacoes.find((l) => l.id_localizacao === locId);
    setEstoqueEntradas((prev) => [
      ...prev,
      {
        fk_localizacao_id: locId,
        quantidade: qty,
        localizacaoNome: loc?.localizacao ?? "—",
      },
    ]);
    setEstoqueForm({ fk_localizacao_id: "", quantidade: "" });
  };

  const handleRemoverEntrada = (fk_localizacao_id) => {
    setEstoqueEntradas((prev) =>
      prev.filter((e) => e.fk_localizacao_id !== fk_localizacao_id),
    );
  };

  const handleSubmit = async () => {
    if (!form.fk_produto_id) {
      setErroMsg("Selecione um produto.");
      setModal("erro");
      return;
    }
    if (!form.estoque_minimo || !form.estoque_ideal) {
      setErroMsg("Estoque mínimo e ideal são obrigatórios.");
      setModal("erro");
      return;
    }
    const minimoInt = parseInt(form.estoque_minimo);
    const idealInt = parseInt(form.estoque_ideal);
    if (minimoInt <= 0 || idealInt <= 0) {
      setErroMsg("Estoque mínimo e ideal devem ser maiores que zero.");
      setModal("erro");
      return;
    }
    if (idealInt < minimoInt) {
      setErroMsg("O estoque ideal não pode ser menor que o mínimo.");
      setModal("erro");
      return;
    }
    if (estoqueEntradas.length === 0) {
      setErroMsg(
        "Adicione ao menos uma localização com quantidade para o estoque inicial.",
      );
      setModal("erro");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(
        "http://localhost:3000/api/estoque/entrada-inicial",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fk_produto_id: parseInt(form.fk_produto_id),
            estoque_minimo: minimoInt,
            estoque_ideal: idealInt,
            entradas: estoqueEntradas.map((e) => ({
              fk_localizacao_id: e.fk_localizacao_id,
              quantidade: e.quantidade,
            })),
          }),
        },
      );

      if (res.ok) {
        setModal("sucesso");
        setForm({ fk_produto_id: "", estoque_minimo: "", estoque_ideal: "" });
        setEstoqueEntradas([]);
        setEstoqueForm({ fk_localizacao_id: "", quantidade: "" });
      } else {
        const data = await res.json();
        setErroMsg(data.erro || "Erro ao cadastrar estoque inicial.");
        setModal("erro");
      }
    } catch {
      setErroMsg("Não foi possível conectar ao servidor.");
      setModal("erro");
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    produtos,
    localizacoes,
    loadingDados,
    modal,
    setModal,
    erroMsg,
    isSubmitting,
    form,
    estoqueEntradas,
    estoqueAtualTotal,
    estoqueForm,
    handleChange,
    handleSelecionarProduto,
    handleChangeEstoqueForm,
    handleAdicionarEntrada,
    handleRemoverEntrada,
    handleSubmit,
  };
}