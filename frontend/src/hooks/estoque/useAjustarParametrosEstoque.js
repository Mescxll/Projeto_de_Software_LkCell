import { useState, useEffect } from "react";

export function useAjustarParametrosEstoque(produto, onSuccess) {
  const [modal, setModal] = useState(null);
  const [erroMsg, setErroMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState({
    estoque_minimo: "",
    estoque_ideal: "",
  });

  // Ajustes de quantidade: [{ fk_localizacao_id, localizacaoNome, tipo, quantidade, observacao }]
  const [ajustesQuantidade, setAjustesQuantidade] = useState([]);

  useEffect(() => {
    if (produto) {
      setForm({
        estoque_minimo: produto.estoque_minimo ?? "",
        estoque_ideal: produto.estoque_ideal ?? "",
      });
      // Inicializa uma linha de ajuste por localização
      setAjustesQuantidade(
        (produto.localizacoes ?? []).map((loc) => ({
          fk_localizacao_id: loc.id_localizacao,
          localizacaoNome: loc.localizacao,
          estoqueAtual: loc.estoque_atual,
          tipo: "adicionar",
          quantidade: "",
          observacao: "",
        })),
      );
    }
  }, [produto]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value.replace(/\D/g, "") }));
  };

  const handleChangeAjuste = (fk_localizacao_id, campo, valor) => {
    setAjustesQuantidade((prev) =>
      prev.map((a) =>
        a.fk_localizacao_id === fk_localizacao_id
          ? { ...a, [campo]: valor }
          : a,
      ),
    );
  };

  const handleSubmit = async () => {
    // Valida parâmetros
    const minimo = form.estoque_minimo ? parseInt(form.estoque_minimo) : undefined;
    const ideal = form.estoque_ideal ? parseInt(form.estoque_ideal) : undefined;

    if (!form.estoque_minimo && !form.estoque_ideal) {
      setErroMsg("Informe ao menos um valor: estoque mínimo ou ideal.");
      setModal("erro");
      return;
    }
    if (form.estoque_minimo && (isNaN(minimo) || minimo <= 0)) {
      setErroMsg("O estoque mínimo deve ser um número inteiro maior que zero.");
      setModal("erro");
      return;
    }
    if (form.estoque_ideal && (isNaN(ideal) || ideal <= 0)) {
      setErroMsg("O estoque ideal deve ser um número inteiro maior que zero.");
      setModal("erro");
      return;
    }
    if (minimo !== undefined && ideal !== undefined && ideal < minimo) {
      setErroMsg("O estoque ideal não pode ser menor que o estoque mínimo.");
      setModal("erro");
      return;
    }

    // Filtra só os ajustes de quantiade que têm quantidade preenchida
    const ajustesAtivos = ajustesQuantidade.filter(
      (a) => a.quantidade !== "" && parseInt(a.quantidade) > 0,
    );

    // Valida remoções no frontend antes de mandar
    for (const a of ajustesAtivos) {
      if (a.tipo === "remover" && parseInt(a.quantidade) > a.estoqueAtual) {
        setErroMsg(
          `Quantidade insuficiente em "${a.localizacaoNome}": disponível ${a.estoqueAtual}, tentativa de remover ${a.quantidade}.`,
        );
        setModal("erro");
        return;
      }
    }

    setIsSubmitting(true);

    try {
      // 1. Ajusta parâmetros (mínimo/ideal)
      const bodyParametros = {};
      if (minimo !== undefined) bodyParametros.estoque_minimo = minimo;
      if (ideal !== undefined) bodyParametros.estoque_ideal = ideal;

      const resParametros = await fetch(
        `http://localhost:3000/api/estoque/parametros/${produto.id_produto}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(bodyParametros),
        },
      );

      if (!resParametros.ok) {
        const data = await resParametros.json();
        setErroMsg(data.erro || "Erro ao ajustar parâmetros de estoque.");
        setModal("erro");
        return;
      }

      // 2. Ajusta quantidade (se houver ajustes ativos)
      if (ajustesAtivos.length > 0) {
        const resQuantidade = await fetch(
          "http://localhost:3000/api/estoque/ajuste-quantidade",
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              fk_produto_id: produto.id_produto,
              ajustes: ajustesAtivos.map((a) => ({
                fk_localizacao_id: a.fk_localizacao_id,
                tipo: a.tipo,
                quantidade: parseInt(a.quantidade),
                observacao: a.observacao || undefined,
              })),
            }),
          },
        );

        if (!resQuantidade.ok) {
          const data = await resQuantidade.json();
          setErroMsg(data.erro || "Erro ao ajustar quantidade de estoque.");
          setModal("erro");
          return;
        }
      }

      setModal("sucesso");
      onSuccess?.();
    } catch {
      setErroMsg("Não foi possível conectar ao servidor.");
      setModal("erro");
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    form,
    modal,
    setModal,
    erroMsg,
    isSubmitting,
    ajustesQuantidade,
    handleChange,
    handleChangeAjuste,
    handleSubmit,
  };
}