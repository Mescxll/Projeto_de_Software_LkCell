// Lógica da Tela de Atualizar Fornecedores 
import { useState, useEffect } from "react";

export function useAtualizarFornecedor(uuid) {
  const [loading, setLoading] = useState(true);
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

  const formatPrice = (value) => {
    const somenteNumeros = value?.toString().replace(/[^\d,]/g, "") || "";
    const partes = somenteNumeros.split(",");

    if (partes.length <= 1) {
      return somenteNumeros;
    }

    return `${partes[0]},${partes.slice(1).join("")}`;
  };

  const formatPriceBR = (value) => {
    if (value === null || value === undefined || value === "") return "";

    const numero = Number(String(value).replace(/\./g, "").replace(",", "."));

    if (!Number.isFinite(numero)) return "";

    return numero.toFixed(2).replace(".", ",");
  };

  useEffect(() => {
    if (!uuid) return;

    fetch(`http://localhost:3000/api/fornecedores/${uuid}`)
      .then((res) => res.json())
      .then((data) => {
        const telefone =
          data.telefone_fornecedor?.[0]?.telefone_fornecedor || "";
        setForm({
          cnpj: formatCNPJ(data.cnpj || ""),
          razao_social: data.razao_social || "",
          email: data.email || "",
          politica_preco: formatPriceBR(data.politica_preco),
          prazo_entrega: data.prazo_entrega?.toString() || "",
          telefone: formatPhone(telefone),
        });
      })
      .catch((err) => {
        console.error("Erro ao carregar fornecedor:", err);
      })
      .finally(() => setLoading(false));
  }, [uuid]);

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
      value = formatPrice(rawValue);
    }

    if (name === "prazo_entrega") {
      value = rawValue.replace(/\D/g, "");
    }

    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSalvar = async () => {
    const telefoneLimpo = form.telefone.replace(/\D/g, "");
    const politicaPrecoLimpa = form.politica_preco.replace(/,/g, ".");

    if (!form.razao_social.trim()) {
      setErroMsg("A razão social é obrigatória.");
      setModalErro(true);
      return;
    }

    if (form.telefone && telefoneLimpo.length !== 11) {
      setErroMsg("O telefone precisa ter 11 dígitos (DDD + número).\n");
      setModalErro(true);
      return;
    }

    if (form.politica_preco && Number.isNaN(Number(politicaPrecoLimpa))) {
      setErroMsg("A política de preço precisa ser um valor válido.");
      setModalErro(true);
      return;
    }

    setIsSubmitting(true);

    const body = {
      email: form.email.trim() || null,
      politica_preco: form.politica_preco
        ? Number(politicaPrecoLimpa)
        : undefined,
      prazo_entrega: form.prazo_entrega
        ? Number(form.prazo_entrega)
        : undefined,
    };

    if (telefoneLimpo) {
      body.telefones = [telefoneLimpo];
    }

    try {
      const res = await fetch(
        `http://localhost:3000/api/fornecedores/${uuid}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        },
      );

      if (res.ok) {
        setModal(true);
      } else {
        const data = await res.json();
        setErroMsg(data.erro || "Erro ao atualizar fornecedor.");
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

  return {
    loading,
    form,
    modal,
    modalErro,
    erroMsg,
    isSubmitting,
    handleChange,
    handleSalvar,
    setModal,
    setModalErro,
  };
}
