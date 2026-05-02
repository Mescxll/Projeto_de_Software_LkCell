// Lógica da Tela de Gerenciamento de Clientes (Exlusão, Busca e Listagem)
import { useState, useEffect, useRef } from "react";

export function useGerenciarCliente() {
  const [loading, setLoading] = useState(true);
  const [clientes, setClientes] = useState([]);
  const [busca, setBusca] = useState("");
  const [menuAberto, setMenuAberto] = useState(null);
  const [modalConfirmar, setModalConfirmar] = useState(false);
  const [modalSucesso, setModalSucesso] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [clienteSelecionado, setClienteSelecionado] = useState(null);
  
  const menuRef = useRef(null);

  // Busca os clientes quando a tela abre
  useEffect(() => {
    fetch("http://localhost:3000/api/clientes")
      .then((res) => {
        if (!res.ok) throw new Error("Falha ao carregar clientes");
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data)) {
          setClientes(data);
        } else {
          console.error("Dados recebidos não são uma lista:", data);
          setClientes([]);
        }
      })
      .catch((err) => {
        console.error("Erro na requisição:", err);
        setClientes([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // Fecha o menu ao clicar fora
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
    if (!clienteSelecionado) return;

    setIsDeleting(true);

    const doc =
      clienteSelecionado.pessoafisica?.cpf ||
      clienteSelecionado.pessoajuridica?.cnpj;

    try {
      await fetch(`http://localhost:3000/api/clientes/${doc}`, {
        method: "DELETE",
      });

      setClientes((prev) =>
        prev.filter((c) => c.id_cliente !== clienteSelecionado.id_cliente),
      );

      setModalConfirmar(false);
      setMenuAberto(null);
      setModalSucesso(true);
    } catch (error) {
      console.error("Erro ao excluir cliente:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const clientesFiltrados = clientes.filter((c) => {
    const doc = c.pessoafisica?.cpf || c.pessoajuridica?.cnpj || "";
    const id = String(c.id_cliente || "");
    const email = c.email || "";

    // Traduzindo o banco para o vocabulário do usuário
    const termosTipo =
      c.tipo_cliente === "FISICO"
        ? "fisica fisico pessoa física pf"
        : "juridica juridico pessoa jurídica pj";

    // Deixa tudo minúsculo pra busca não quebrar com letras maiúsculas
    const termoBusca = busca.toLowerCase();

    return (
      c.nome?.toLowerCase().includes(termoBusca) ||
      doc.includes(termoBusca) ||
      email.toLowerCase().includes(termoBusca) ||
      id.includes(termoBusca) ||
      termosTipo.includes(termoBusca)
    );
  });

  // O hook disponibiliza essas variáveis pra quem quiser usar!
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
    clienteSelecionado,
    setClienteSelecionado,
    menuRef,
    handleExcluir,
    clientesFiltrados,
  };
}