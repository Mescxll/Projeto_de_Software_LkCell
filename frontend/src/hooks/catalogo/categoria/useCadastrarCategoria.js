// hooks/catalogo/categoria/useCadastrarCategoria.js
import { useState } from "react";

export function useCadastrarCategoria() {
  const [nome, setNome] = useState("");
  const [modal, setModal] = useState(null); // "sucesso" | "erro" | null
  const [erroMsg, setErroMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!nome.trim()) {
      setErroMsg("O nome da categoria é obrigatório.");
      setModal("erro");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("http://localhost:3000/api/categorias", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome }),
      });

      if (res.ok) {
        setNome("");
        setModal("sucesso");
      } else {
        const data = await res.json();
        setErroMsg(data.erro || "Erro ao cadastrar categoria.");
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
    nome,
    setNome,
    modal,
    setModal,
    erroMsg,
    isSubmitting,
    handleSubmit,
  };
}