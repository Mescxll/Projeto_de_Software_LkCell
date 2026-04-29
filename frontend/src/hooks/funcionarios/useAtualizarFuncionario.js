// Lógica da Tela de Atualização de Funcionários
import { useState, useEffect } from "react";

export function useAtualizarFuncionario(id) {
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modal, setModal] = useState(null); // 👈 Sem tipagens do TypeScript!
  const [erroMsg, setErroMsg] = useState("");
  const [form, setForm] = useState({
    nome: "",
    data_nascimento: null, 
  });

  // Busca os dados assim que o Hook é chamado
  useEffect(() => {
    if (!id) return; // Trava de segurança caso o ID não exista ainda
    
    fetch(`http://localhost:3000/api/funcionarios?busca=${id}`)
      .then((res) => res.json())
      .then((data) => {
        const funcionario = Array.isArray(data) ? data[0] : data;
        setForm({
          nome: funcionario?.nome || "",
          data_nascimento: funcionario?.data_aniversario
            ? new Date(funcionario.data_aniversario)
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

    try {
      const res = await fetch(`http://localhost:3000/api/funcionarios/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: form.nome,
          data_nascimento: form.data_nascimento
            ? form.data_nascimento.toISOString().split("T")[0]
            : null,
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

  // O hook disponibiliza essas variáveis pra quem quiser usar!
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