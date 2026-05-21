// Lógica da Tela de Gerenciamento de Funcionários (Exlusão, Busca e Listagem)
import { useState, useEffect, useRef } from "react";

export function useGerenciarFuncionario() {
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [funcionarios, setFuncionarios] = useState([]); 
  const [busca, setBusca] = useState("");
  const [menuAberto, setMenuAberto] = useState(null);
  const [modalConfirmar, setModalConfirmar] = useState(false);
  const [modalSucesso, setModalSucesso] = useState(false);
  const [funcionarioSelecionado, setFuncionarioSelecionado] = useState(null);
  
  const menuRef = useRef(null);

  const normalizarTexto = (texto) =>
    texto
      .normalize("NFD")
      .replace(/[^\w\s]|_/g, "")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();

  const formatarData = (data) => {
    if (!data) return "Data não informada";
    const dataObj = new Date(data);

    if (Number.isNaN(dataObj.getTime())) {
      return "Data inválida";
    }

    return dataObj.toLocaleDateString("pt-BR", { timeZone: "UTC" });
  };

  useEffect(() => {
    fetch("http://localhost:3000/api/funcionarios")
      .then((res) => {
        if (!res.ok) throw new Error("Falha ao carregar funcionários");
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data)) {
          setFuncionarios(data);
        } else {
          console.error("Dados recebidos não são uma lista:", data);
          setFuncionarios([]);
        }
      })
      .catch((err) => {
        console.error("Erro ao buscar funcionários:", err);
        setFuncionarios([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

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
    if (!funcionarioSelecionado) return;

    setIsDeleting(true);

    try {
      await fetch(
        `http://localhost:3000/api/funcionarios/${funcionarioSelecionado.id_funcionario}`,
        {
          method: "DELETE",
        },
      );

      setFuncionarios((prev) =>
        prev.filter((f) => f.id_funcionario !== funcionarioSelecionado.id_funcionario),
      );

      setModalConfirmar(false);
      setMenuAberto(null);
      setModalSucesso(true);
    } catch (error) {
      console.error("Erro ao excluir funcionário:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const funcionariosFiltrados = funcionarios.filter((f) => {
    const id = String(f.id_funcionario || "");
    const nome = normalizarTexto(f.nome || "");
    const data = normalizarTexto(formatarData(f.data_aniversario));
    const filtro = normalizarTexto(busca);

    return nome.includes(filtro) || id.includes(busca) || data.includes(filtro);
  });

  return {
    loading,
    isDeleting,
    busca,
    setBusca,
    menuAberto,
    setMenuAberto,
    modalConfirmar,
    setModalConfirmar,
    modalSucesso,
    setModalSucesso,
    funcionarioSelecionado,
    setFuncionarioSelecionado,
    menuRef,
    funcionariosFiltrados,
    handleExcluir,
    formatarData,
  };
}