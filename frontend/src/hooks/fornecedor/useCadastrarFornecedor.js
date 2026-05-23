// Lógica da Tela de Cadastrar Fornecedores 
import { useState } from "react";

export function useCadastrarFornecedor() {
  const [form, setForm] = useState({
    cnpj: "",
    razao_social: "",
    email: "",
    politica_preco: "",
    prazo_entrega: "",
    telefone: "",
  });
  const [modal, setModal] = useState(false);
  const [modalErro, setModalErro] = useState(false);
  const [erroMsg, setErroMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formatCNPJ = (value) => {
    const digits = value.replace(/\D/g, "");
    return digits
      .replace(/(\d{2})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1/$2")
      .replace(/(\d{4})(\d{1,2})/, "$1-$2")
      .slice(0, 18);
  };

  const formatPhone = (value) => {
    const digits = value.replace(/\D/g, "");
    return digits
      .replace(/(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{5})(\d)/, "$1-$2")
      .slice(0, 15);
  };

  const formatarPrecoReal = (value) => {
    const somenteNumeros = value.replace(/[^\d,]/g, "");
    const partes = somenteNumeros.split(",");

    if (partes.length <= 1) {
      return somenteNumeros;
    }

    return `${partes[0]},${partes.slice(1).join("")}`;
  };

  const handleChange = (e) => {
    const { name, value: rawValue } = e.target;
    let value = rawValue;

    if (name === "cnpj") {
      value = formatCNPJ(rawValue);
    }

    if (name === "telefone") {
      value = formatPhone(rawValue);
    }

    if (name === "politica_preco") {
      value = formatarPrecoReal(rawValue);
    }

    if (name === "prazo_entrega") {
      value = rawValue.replace(/\D/g, "");
    }

    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    const cnpjLimpo = form.cnpj.replace(/\D/g, "");
    const telefoneLimpo = form.telefone.replace(/\D/g, "");
    const politicaPrecoLimpa = form.politica_preco.replace(/,/g, ".");

    if (!cnpjLimpo || cnpjLimpo.length !== 14) {
      setErroMsg("O CNPJ deve ter 14 dígitos e é um campo obrigatório.");
      setModalErro(true);
      return;
    }

    if (!form.razao_social.trim()) {
      setErroMsg("A razão social é obrigatória.");
      setModalErro(true);
      return;
    }

    if (!politicaPrecoLimpa || Number.isNaN(Number(politicaPrecoLimpa))) {
      setErroMsg("A política de preço é um campo obrigatório.");
      setModalErro(true);
      return;
    }

    if (!telefoneLimpo || telefoneLimpo.length !== 11) {
      setErroMsg("O telefone precisa ter 11 dígitos (DDD + número).\n");
      setModalErro(true);
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("http://localhost:3000/api/fornecedores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cnpj: cnpjLimpo,
          razao_social: form.razao_social.trim(),
          email: form.email.trim() || null,
          politica_preco: politicaPrecoLimpa,
          prazo_entrega: form.prazo_entrega ? Number(form.prazo_entrega) : null,
          telefones: [telefoneLimpo],
        }),
      });

      if (res.ok) {
        setModal(true);
      } else {
        const data = await res.json();
        setErroMsg(data.erro || "Erro ao cadastrar fornecedor.");
        setModalErro(true);
      }
    } catch (err) {
      console.error(err);
      setErroMsg("Não foi possível conectar ao servidor.");
      setModalErro(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const fecharModalErro = () => {
    setModalErro(false);
    setErroMsg("");
  };

  return {
    form,
    setForm,
    modal,
    modalErro,
    fecharModalErro,
    erroMsg,
    isSubmitting,
    handleChange,
    handleSubmit,
    setModal,
  };
}
