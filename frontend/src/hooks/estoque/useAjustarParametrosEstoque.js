// Lógica do Modal de Ajustar Parâmetros de Estoque
import { useState, useEffect } from "react";

export function useAjustarParametrosEstoque(produto, onSuccess) {
  const [modal, setModal] = useState(null);
  const [erroMsg, setErroMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState({
    estoque_minimo: "",
    estoque_ideal: "",
  });

  // Pré-preenche com os valores atuais do produto ao abrir
  useEffect(() => {
    if (produto) {
      setForm({
        estoque_minimo: produto.estoque_minimo ?? "",
        estoque_ideal: produto.estoque_ideal ?? "",
      });
    }
  }, [produto]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value.replace(/\D/g, "") }));
  };

  const handleSubmit = async () => {
    if (!form.estoque_minimo && !form.estoque_ideal) {
      setErroMsg("Informe ao menos um valor: estoque mínimo ou ideal.");
      setModal("erro");
      return;
    }

    const minimo = form.estoque_minimo ? parseInt(form.estoque_minimo) : undefined;
    const ideal = form.estoque_ideal ? parseInt(form.estoque_ideal) : undefined;

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

    setIsSubmitting(true);

    const body = {};
    if (minimo !== undefined) body.estoque_minimo = minimo;
    if (ideal !== undefined) body.estoque_ideal = ideal;

    try {
      const res = await fetch(
        `http://localhost:3000/api/estoque/parametros/${produto.id_produto}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        },
      );

      if (res.ok) {
        setModal("sucesso");
        onSuccess?.();
      } else {
        const data = await res.json();
        setErroMsg(data.erro || "Erro ao ajustar parâmetros de estoque.");
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
    form,
    modal,
    setModal,
    erroMsg,
    isSubmitting,
    handleChange,
    handleSubmit,
  };
}