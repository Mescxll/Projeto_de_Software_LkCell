// Lógica da Tela de Cadastro de Funcionários
import { useState } from "react";

export function useCadastroFuncionario() {
  const [modal, setModal] = useState(null);
  const [erroMsg, setErroMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    nome: "",
    data_nascimento: null,
  });

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async () => {
    if (!form.nome.trim()) {
      setErroMsg("O nome do funcionário é obrigatório.");
      setModal("erro");
      return;
    }

    setIsSubmitting(true);
    const dataFormatada = form.data_nascimento
      ? form.data_nascimento.toISOString().split("T")[0]
      : null;

    try {
      const res = await fetch("http://localhost:3000/api/funcionarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: form.nome,
          data_nascimento: dataFormatada,
        }),
      });

      if (res.ok) {
        setModal("sucesso");
      } else {
        const data = await res.json();
        setErroMsg(data.erro || "Erro ao cadastrar funcionário.");
        setModal("erro");
      }
    } catch (err) {
      console.error("Erro no catch:", err);
      setErroMsg("Não foi possível conectar ao servidor.");
      setModal("erro");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setForm({ nome: "", data_nascimento: null });
    setModal(null);
  };

  // O hook disponibiliza essas variáveis pra quem quiser usar!
  return {
    form,
    modal,
    erroMsg,
    isSubmitting,
    handleChange,
    handleSubmit,
    setForm,
    setModal,
    resetForm,
  };
}
