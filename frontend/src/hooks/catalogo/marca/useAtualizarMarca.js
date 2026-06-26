// hooks/catalogo/marca/useAtualizarMarca.js
import { useState, useEffect } from "react";

export function useAtualizarMarca(id) {
  const [nome, setNome] = useState("");
  const [nomeOriginal, setNomeOriginal] = useState("");
  const [totalModelos, setTotalModelos] = useState(0);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(false);
  const [modal, setModal] = useState(null); // "sucesso" | "erro" | null
  const [erroMsg, setErroMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!id) return;

    const buscarMarca = async () => {
      try {
        const res = await fetch(`http://localhost:3000/api/marcas/${id}`);
        if (!res.ok) throw new Error("Marca não encontrada.");
        const data = await res.json();
        setNome(data.nome);
        setNomeOriginal(data.nome);
        setTotalModelos(data._count?.modelos ?? 0);
      } catch (err) {
        console.error(err);
        setErro(true);
      } finally {
        setLoading(false);
      }
    };

    buscarMarca();
  }, [id]);

  const handleSubmit = async () => {
    if (!nome.trim()) {
      setErroMsg("O nome da marca é obrigatório.");
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
      const res = await fetch(`http://localhost:3000/api/marcas/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome }),
      });

      if (res.ok) {
        const data = await res.json();
        setNome(data.marca.nome);
        setNomeOriginal(data.marca.nome);
        setTotalModelos(data.marca._count?.modelos ?? totalModelos);
        setModal("sucesso");
      } else {
        const data = await res.json();
        setErroMsg(data.erro || "Erro ao atualizar marca.");
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
    totalModelos,
    loading,
    erro,
    modal,
    setModal,
    erroMsg,
    isSubmitting,
    handleSubmit,
  };
}