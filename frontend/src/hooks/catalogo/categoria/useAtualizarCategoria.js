// hooks/catalogo/categoria/useAtualizarCategoria.js
import { useState, useEffect } from "react";

export function useAtualizarCategoria(id) {
  const [nome, setNome] = useState("");
  const [nomeOriginal, setNomeOriginal] = useState("");
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // "sucesso" | "erro" | null
  const [erroMsg, setErroMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [erro, setErro] = useState(false);

  useEffect(() => {
    if (!id) return;

    const buscarCategoria = async () => {
      try {
        const res = await fetch(
          `http://localhost:3000/api/categorias/${id}`,
        );
        if (!res.ok) throw new Error("Categoria não encontrada.");
        const data = await res.json();
        setNome(data.nome);
        setNomeOriginal(data.nome);
      } catch (err) {
        console.error(err);
        setErro(true);
      } finally {
        setLoading(false);
      }
    };

    buscarCategoria();
  }, [id]);

  const handleSubmit = async () => {
    if (!nome.trim()) {
      setErroMsg("O nome da categoria é obrigatório.");
      setModal("erro");
      return;
    }

    if (nome.trim().toUpperCase() === nomeOriginal) {
      setErroMsg("Nenhuma alteração foi feita.");
      setModal("erro");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`http://localhost:3000/api/categorias/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome }),
      });

      if (res.ok) {
        const data = await res.json();
        setNome(data.categoria.nome);
        setNomeOriginal(data.categoria.nome);
        setModal("sucesso");
      } else {
        const data = await res.json();
        setErroMsg(data.erro || "Erro ao atualizar categoria.");
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
    nomeOriginal,
    loading,
    erro,
    modal,
    setModal,
    erroMsg,
    isSubmitting,
    handleSubmit,
  };
}