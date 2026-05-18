import { useState, useEffect } from "react";

export function useAtualizarFuncionario(id) {
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modal, setModal] = useState(null); 
  const [erroMsg, setErroMsg] = useState("");
  const [form, setForm] = useState({
    nome: "",
    data_nascimento: null, 
  });

  useEffect(() => {
    if (!id) return; 
    
    fetch(`http://localhost:3000/api/funcionarios/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setForm({
          nome: data?.nome || "",
          // Pega a string do banco e transforma num Date pro calendário entender
          data_nascimento: data?.data_aniversario
            ? new Date(data.data_aniversario)
            : null, 
        });
        setLoading(false);
      })
      .catch((err) => {
        console.error("Erro ao buscar funcionário:", err);
        setLoading(false);
      });
  }, [id]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSalvar = async () => {
    if (!form.nome.trim()) {
      setErroMsg("O nome do funcionário é obrigatório.");
      setModal("erro");
      return;
    }
    setIsSubmitting(true);

  // Pega o Date do calendário e vira string pro Backend
    let dataFormatada = undefined;
    
    if (form.data_nascimento) {
      // Garantindo que o fuso horário não mude o dia na hora de mandar
      const ano = form.data_nascimento.getFullYear();
      const mes = String(form.data_nascimento.getMonth() + 1).padStart(2, "0");
      const dia = String(form.data_nascimento.getDate()).padStart(2, "0");
      dataFormatada = `${ano}-${mes}-${dia}`;
    }

    console.log("Data purificada indo pro back:", dataFormatada);

    try {
      const res = await fetch(`http://localhost:3000/api/funcionarios/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: form.nome,
          data_nascimento: dataFormatada, // Agora vai no formato perfeito que a API espera
        }),
      });

      if (res.ok) {
        setModal("sucesso");
      } else {
        const data = await res.json();
        setErroMsg(data.erro || "Erro ao atualizar funcionário.");
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
    loading,
    isSubmitting,
    modal,
    setModal,
    erroMsg,
    form,
    setForm,
    handleChange,
    handleSalvar,
  };
}