// hooks/catalogo/modelo/useAtualizarModelo.js
import { useState, useEffect } from "react";

export function useAtualizarModelo(id) {
  const [nome, setNome] = useState("");
  const [nomeOriginal, setNomeOriginal] = useState("");
  const [fkMarcaId, setFkMarcaId] = useState("");
  const [fkMarcaIdOriginal, setFkMarcaIdOriginal] = useState("");
  const [totalProdutos, setTotalProdutos] = useState(0);
  const [marcas, setMarcas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(false);
  const [modal, setModal] = useState(null);
  const [erroMsg, setErroMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!id) return;

    const buscarDados = async () => {
      try {
        const [resModelo, resMarcas] = await Promise.all([
          fetch(`http://localhost:3000/api/modelos/${id}`),
          fetch("http://localhost:3000/api/marcas"),
        ]);

        if (!resModelo.ok) throw new Error("Modelo não encontrado.");

        const dataModelo = await resModelo.json();
        const dataMarcas = await resMarcas.json();

        setNome(dataModelo.nome);
        setNomeOriginal(dataModelo.nome);
        setFkMarcaId(String(dataModelo.fk_marca_id));
        setFkMarcaIdOriginal(String(dataModelo.fk_marca_id));
        setTotalProdutos(dataModelo._count?.produtos ?? 0);
        setMarcas(Array.isArray(dataMarcas) ? dataMarcas : []);
      } catch (err) {
        console.error(err);
        setErro(true);
      } finally {
        setLoading(false);
      }
    };

    buscarDados();
  }, [id]);

  const semAlteracoes =
    nome.trim().toUpperCase() === nomeOriginal &&
    String(fkMarcaId) === String(fkMarcaIdOriginal);

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
    if (semAlteracoes) {
      setErroMsg("Nenhuma alteração foi feita.");
      setModal("erro");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`http://localhost:3000/api/modelos/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome, fk_marca_id: parseInt(fkMarcaId) }),
      });

      if (res.ok) {
        const data = await res.json();
        setNome(data.modelo.nome);
        setNomeOriginal(data.modelo.nome);
        setFkMarcaId(String(data.modelo.fk_marca_id));
        setFkMarcaIdOriginal(String(data.modelo.fk_marca_id));
        setTotalProdutos(data.modelo._count?.produtos ?? totalProdutos);
        setModal("sucesso");
      } else {
        const data = await res.json();
        setErroMsg(data.erro || "Erro ao atualizar modelo.");
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
    fkMarcaId,
    setFkMarcaId,
    totalProdutos,
    marcas,
    loading,
    erro,
    semAlteracoes,
    modal,
    setModal,
    erroMsg,
    isSubmitting,
    handleSubmit,
  };
}