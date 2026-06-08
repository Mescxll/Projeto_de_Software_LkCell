// Lógica da Tela de Atualizar Compra
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export function useAtualizarCompra(id) {
  const router = useRouter();
  const [compra, setCompra] = useState(null);
  const [fornecedores, setFornecedores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erroMsg, setErroMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modal, setModal] = useState(null);
  const [modalCancelar, setModalCancelar] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [modalSucessoCancelamento, setModalSucessoCancelamento] =
    useState(false);

  const [form, setForm] = useState({
    fk_fornecedor_id_fornecedor: "",
    prazo_entrega: "",
  });

  // Busca compra e fornecedores ao abrir
  useEffect(() => {
    const buscarDados = async () => {
      try {
        const [resCompra, resFornecedores] = await Promise.all([
          fetch(`http://localhost:3000/api/compras/${id}`),
          fetch("http://localhost:3000/api/fornecedores"),
        ]);

        if (!resCompra.ok) {
          setErroMsg("Compra não encontrada.");
          setModal("erro");
          setLoading(false);
          return;
        }

        const dataCompra = await resCompra.json();
        setCompra(dataCompra);

        // Preenche o formulário com os dados atuais
        setForm({
          fk_fornecedor_id_fornecedor:
            dataCompra.fk_fornecedor_id_fornecedor || "",
          prazo_entrega: dataCompra.prazo_entrega
            ? new Date(dataCompra.prazo_entrega).toISOString().split("T")[0]
            : "",
        });

        if (resFornecedores.ok) {
          const data = await resFornecedores.json();
          setFornecedores(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error("Erro ao buscar dados:", err);
        setErroMsg("Erro ao carregar dados do sistema.");
        setModal("erro");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      buscarDados();
    }
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async () => {
    if (!form.fk_fornecedor_id_fornecedor) {
      setErroMsg("Selecione um fornecedor.");
      setModal("erro");
      return;
    }

    setIsSubmitting(true);

    const body = {
      fk_fornecedor_id_fornecedor: parseInt(form.fk_fornecedor_id_fornecedor),
      prazo_entrega: form.prazo_entrega || null,
    };

    try {
      const res = await fetch(`http://localhost:3000/api/compras/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        const dataAtualizada = await res.json();
        setCompra(dataAtualizada.compra);
        setModal("sucesso");
        setTimeout(() => {
          router.push("/compra/gerenciar");
        }, 1500);
      } else {
        const data = await res.json();
        setErroMsg(data.erro || "Erro ao atualizar compra.");
        setModal("erro");
      }
    } catch {
      setErroMsg("Não foi possível conectar ao servidor.");
      setModal("erro");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelarCompra = async () => {
    setModalCancelar(false);
    setIsCancelling(true);

    try {
      const res = await fetch(`http://localhost:3000/api/compras/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setCompra((prev) =>
          prev ? { ...prev, status_compra: "CANCELADA" } : prev,
        );
        setModalSucessoCancelamento(true);
      } else {
        const data = await res.json();
        setErroMsg(data.erro || "Erro ao cancelar compra.");
        setModal("erro");
      }
    } catch {
      setErroMsg("Não foi possível conectar ao servidor.");
      setModal("erro");
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
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
    } catch {
      return new Date(data).toLocaleString("pt-BR");
    }
  };

  return {
    compra,
    fornecedores,
    loading,
    erroMsg,
    isSubmitting,
    modal,
    setModal,
    modalCancelar,
    setModalCancelar,
    isCancelling,
    modalSucessoCancelamento,
    setModalSucessoCancelamento,
    form,
    setForm,
    handleChange,
    handleSubmit,
    handleCancelarCompra,
    formatarPreco,
    formatarData,
  };
}
