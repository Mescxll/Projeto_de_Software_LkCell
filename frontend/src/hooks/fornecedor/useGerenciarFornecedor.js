// Lógica da Tela de Gerenciamento de Fornecedores (Exlusão, Busca e Listagem)
import { useState, useEffect, useRef } from "react";

export function useGerenciarFornecedor() {
  const [loading, setLoading] = useState(true);
  const [fornecedores, setFornecedores] = useState([]);
  const [busca, setBusca] = useState("");
  const [menuAberto, setMenuAberto] = useState(null);
  const [modalConfirmar, setModalConfirmar] = useState(false);
  const [modalSucesso, setModalSucesso] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [fornecedorSelecionado, setFornecedorSelecionado] = useState(null);

  const menuRef = useRef(null);

  // Busca Inicial
  useEffect(() => {
    fetch("http://localhost:3000/api/fornecedores")
      .then((res) => res.json())
      .then((data) => setFornecedores(Array.isArray(data) ? data : []))
      .catch((err) => console.error("Erro ao buscar fornecedores:", err))
      .finally(() => setLoading(false));
  }, []);

  // Fechar menu ao clicar fora
  useEffect(() => {
    const handleClickFora = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuAberto(null);
      }
    };
    document.addEventListener("mousedown", handleClickFora);
    return () => document.removeEventListener("mousedown", handleClickFora);
  }, []);

  const handleExcluir = async () => {
    if (!fornecedorSelecionado) return;
    setIsDeleting(true);

    try {
      await fetch(
        `http://localhost:3000/api/fornecedores/${fornecedorSelecionado.uuid}`,
        {
          method: "DELETE",
        },
      );

      setFornecedores((prev) =>
        prev.filter((f) => f.uuid !== fornecedorSelecionado.uuid),
      );

      setModalConfirmar(false);
      setMenuAberto(null);
      setModalSucesso(true);
    } catch (error) {
      console.error("Erro ao excluir fornecedor:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  // Motor de busca e filtro
  const fornecedoresFiltrados = fornecedores.filter((f) => {
    const termo = busca.toLowerCase();
    return (
      f.razao_social?.toLowerCase().includes(termo) || f.cnpj?.includes(termo)
    );
  });

  // Devolve pronto pra tela usar
  return {
    loading,
    busca,
    setBusca,
    menuAberto,
    setMenuAberto,
    modalConfirmar,
    setModalConfirmar,
    modalSucesso,
    setModalSucesso,
    isDeleting,
    fornecedorSelecionado,
    setFornecedorSelecionado,
    menuRef,
    fornecedoresFiltrados,
    handleExcluir,
  };
}
