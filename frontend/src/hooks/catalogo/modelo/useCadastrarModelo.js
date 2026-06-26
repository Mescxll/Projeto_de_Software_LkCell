// hooks/catalogo/modelo/useCadastrarModelo.js
import { useState, useEffect } from "react";

export function useCadastrarModelo() {
  const [nome, setNome] = useState("");
  const [fkMarcaId, setFkMarcaId] = useState("");
  const [marcas, setMarcas] = useState([]);
  const [loadingMarcas, setLoadingMarcas] = useState(true);
  const [modal, setModal] = useState(null); // "sucesso" | "erro" | null
  const [erroMsg, setErroMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const buscarMarcas = async () => {
      try {
        const res = await fetch("http://localhost:3000/api/marcas");
        const data = await res.json();
        setMarcas(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Erro ao buscar marcas:", err);
      } finally {
        setLoadingMarcas(false);
      }
    };
    buscarMarcas();
  }, []);

  const handleSubmit = async () => {
    if (!nome.trim()) {
      setErroMsg("O nome do modelo é obrigatório.");
      setModal("erro");
      return;
    }
    if (!fkMarcaId) {
      setErroMsg("Selecione uma marca.");
      setModal("erro");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("http://localhost:3000/api/modelos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome, fk_marca_id: parseInt(fkMarcaId) }),
      });

      if (res.ok) {
        setNome("");
        setFkMarcaId("");
        setModal("sucesso");
      } else {
        const data = await res.json();
        setErroMsg(data.erro || "Erro ao cadastrar modelo.");
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
    fkMarcaId,
    setFkMarcaId,
    marcas,
    loadingMarcas,
    modal,
    setModal,
    erroMsg,
    isSubmitting,
    handleSubmit,
  };
}