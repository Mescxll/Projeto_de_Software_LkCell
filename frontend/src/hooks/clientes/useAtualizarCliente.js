// Lógica da Tela de Atualização de Clientes
import { useState, useEffect } from "react";

export function useAtualizarCliente(documento) {
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [modalErro, setModalErro] = useState(false);
  const [erroMsg, setErroMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tipo, setTipo] = useState("FISICA");
  const [form, setForm] = useState({
    nome: "",
    telefone: "",
    logradouro: "",
    numero: "",
    bairro: "",
    cidade: "",
    uf: "",
    cep: "",
  });

  // Busca os dados assim que o componente carrega
  useEffect(() => {
    if (!documento) return; // Trava de segurança

    fetch(`http://localhost:3000/api/clientes/${documento}`)
      .then((res) => res.json())
      .then((data) => {
        setTipo(data.tipo_cliente === "FISICO" ? "FISICA" : "JURIDICA");
        setForm({
          nome: data.nome || "",
          telefone: data.telefone_cliente?.[0]?.telefone_cliente || "",
          logradouro: data.logradouro || "",
          numero: data.numero?.toString() || "",
          bairro: data.bairro || "",
          cidade: data.cidade || "",
          uf: data.uf || "",
          cep: data.cep || "",
        });
        setLoading(false);
      })
      .catch((err) => {
        console.error("Erro ao buscar cliente:", err);
        setLoading(false);
      });
  }, [documento]);

  const handleChange = (e) => {
    let { name, value } = e.target;

    // Se for Telefone ou CEP, arranca letras e limita o tamanho
    if (["telefone", "cep"].includes(name)) {
      value = value.replace(/\D/g, "");

      if (name === "telefone") value = value.slice(0, 11);
      if (name === "cep") value = value.slice(0, 8);
    }

    // Se for número de endereço, só arranca as letras
    if (name === "numero") {
      value = value.replace(/\D/g, "");
    }

    if (name === "uf") {
      value = value
        .replace(/[^a-zA-Z]/g, "")
        .slice(0, 2)
        .toUpperCase();
    }

    setForm({ ...form, [name]: value });
  };

  const handleSalvar = async () => {
    // Trava de campos em branco
    if (!form.nome.trim() || !form.telefone.trim()) {
      setErroMsg("Preencha todos os campos obrigatórios: Nome e Telefone.");
      setModalErro(true);
      return;
    }

    // Trava de tamanho do Telefone
    if (form.telefone.length !== 11) {
      setErroMsg(
        "O telefone precisa ter exatamente 11 números (DDD + 9 dígitos)!",
      );
      setModalErro(true);
      return;
    }

    // Trava de tamanho do CEP
    if (form.cep && form.cep.length !== 8) {
      setErroMsg("O CEP está incompleto! Digite exatamente 8 números.");
      setModalErro(true);
      return;
    }
    
    setIsSubmitting(true);
    
    // Se passou por todas as travas, tenta salvar!
    try {
      const res = await fetch(
        `http://localhost:3000/api/clientes/${documento}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nome: form.nome,
            telefone: form.telefone,
            logradouro: form.logradouro,
            numero: form.numero,
            bairro: form.bairro,
            cidade: form.cidade,
            uf: form.uf,
            cep: form.cep,
          }),
        },
      );

      if (res.ok) {
        setModal(true);
      } else {
        const data = await res.json();
        setErroMsg(data.erro || "Erro ao atualizar cliente no servidor.");
        setModalErro(true);
      }
    } catch (error) {
      setErroMsg("Não foi possível conectar ao servidor.");
      setModalErro(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  // O hook disponibiliza essas variáveis pra quem quiser usar!
  return {
    loading,
    modal,
    setModal,
    modalErro,
    setModalErro,
    erroMsg,
    isSubmitting,
    tipo,
    form,
    handleChange,
    handleSalvar,
  };
}