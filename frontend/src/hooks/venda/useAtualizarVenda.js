import { useState, useEffect } from "react";

export function useAtualizarVenda(id) {
  const [loading, setLoading] = useState(true);
  const [venda, setVenda] = useState(null);
  const [erro, setErro] = useState(false);
  const [modalConfirmar, setModalConfirmar] = useState(false);
  const [statusPagamentoNovo, setStatusPagamentoNovo] = useState("");
  const [erroMsg, setErroMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalErro, setModalErro] = useState(false);
  const [modalSucesso, setModalSucesso] = useState(false);

  // Novos estados para cancelamento
  const [modalCancelar, setModalCancelar] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [modalSucessoCancelamento, setModalSucessoCancelamento] =
    useState(false);

  useEffect(() => {
    if (!id) return;

    fetch(`http://localhost:3000/api/vendas/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Venda não encontrada");
        return res.json();
      })
      .then((data) => {
        const itensComLocalizacao = data.itensvenda.map((item) => {
          const saida = data.estoque?.find(
            (e) =>
              e.fk_produto_id === item.fk_produto_id_produto &&
              e.tipo_movimento === "SAIDA",
          );
          return {
            ...item,
            localizacao: saida?.localizacao?.localizacao ?? null,
          };
        });

        setVenda({ ...data, itensvenda: itensComLocalizacao });
        setStatusPagamentoNovo(data.status_pagamento);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Erro ao buscar venda:", err);
        setErro(true);
        setLoading(false);
      });
  }, [id]);

  const handleSalvar = () => {
    if (!statusPagamentoNovo) {
      setErroMsg("Selecione um status de pagamento.");
      setModalErro(true);
      return;
    }

    if (statusPagamentoNovo === venda.status_pagamento) {
      setErroMsg("Nenhuma mudança foi feita no status de pagamento.");
      setModalErro(true);
      return;
    }

    // Impede alterar de PAGO para EM_ABERTO no frontend também
    if (
      venda.status_pagamento === "PAGO" &&
      statusPagamentoNovo === "EM_ABERTO"
    ) {
      setErroMsg(
        "Não é permitido alterar o status de pagamento de 'PAGO' para 'EM_ABERTO'.",
      );
      setModalErro(true);
      return;
    }

    setModalConfirmar(true);
  };

  const handleConfirmar = async () => {
    setModalConfirmar(false);
    setIsSubmitting(true);

    try {
      const res = await fetch(
        `http://localhost:3000/api/vendas/${id}/status-pagamento`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status_pagamento: statusPagamentoNovo }),
        },
      );

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

  // Nova função de cancelamento
  const handleCancelarVenda = async () => {
    setModalCancelar(false);
    setIsCancelling(true);

    try {
      const res = await fetch(
        `http://localhost:3000/api/vendas/${id}`,
        { method: "DELETE" }, // era PATCH e /cancelar
      );

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

  const formatarDataSimples = (data) => {
    if (!data) return "-";
    try {
      return new Date(data).toLocaleDateString("pt-BR");
    } catch {
      return "-";
    }
  };

  return {
    loading,
    venda,
    erro,
    modalConfirmar,
    setModalConfirmar,
    statusPagamentoNovo,
    setStatusPagamentoNovo,
    erroMsg,
    isSubmitting,
    modalErro,
    setModalErro,
    modalSucesso,
    setModalSucesso,
    modalCancelar,
    setModalCancelar,
    isCancelling,
    modalSucessoCancelamento,
    setModalSucessoCancelamento,
    handleSalvar,
    handleConfirmar,
    handleCancelarVenda,
    formatarPreco,
    formatarData,
    formatarDataSimples,
  };
}
