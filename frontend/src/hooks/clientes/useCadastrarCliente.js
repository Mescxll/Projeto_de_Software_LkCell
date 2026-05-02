import { useState } from "react";

export function useCadastrarCliente() {
  const [tipo, setTipo] = useState("FISICA");
  const [modal, setModal] = useState(null); // "sucesso" | "erro" | null
  const [nomecadastrado, setNomeCadastrado] = useState("");
  const [erroMsg, setErroMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    nome: "",
    cpf: "",
    cnpj: "",
    razao_social: "",
    nome_fantasia: "",
    telefone: "",
    email: "",
    logradouro: "",
    numero: "",
    bairro: "",
    cidade: "",
    uf: "",
    cep: "",
  });

  const handleChange = (e) => {
    let { name, value } = e.target;

    // Verifica se o campo atual é um dos que precisam ser puramente numéricos
    if (["cpf", "cnpj", "telefone", "cep"].includes(name)) {
      // Regex: O \D pega tudo que NÃO for número e substitui por vazio ('')
      value = value.replace(/\D/g, "");

      // Aplica o limite de caracteres pra cada campo na lata
      if (name === "cpf") value = value.slice(0, 11);
      if (name === "cnpj") value = value.slice(0, 14);
      if (name === "telefone") value = value.slice(0, 11);
      if (name === "cep") value = value.slice(0, 8);
    }

    if (name === "uf") {
      value = value
        .replace(/[^a-zA-Z]/g, "")
        .slice(0, 2)
        .toUpperCase();
    }

    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async () => {
    // Validação básica
    const doc = tipo === "FISICA" ? form.cpf : form.cnpj;
    if (!form.nome.trim() || !doc.trim() || !form.telefone.trim()) {
      setErroMsg(
        "Preencha todos os campos obrigatórios: Nome, Documento e Telefone."
      );
      setModal("erro");
      return;
    }

    if (tipo === "FISICA" && form.cpf.length !== 11) {
      setErroMsg("O CPF precisa ter exatamente 11 números!");
      setModal("erro");
      return;
    }

    if (tipo === "JURIDICA" && form.cnpj.length !== 14) {
      setErroMsg("O CNPJ precisa ter exatamente 14 números!");
      setModal("erro");
      return;
    }

    if (form.telefone.length !== 11) {
      setErroMsg(
        "O telefone precisa ter exatamente 11 números (DDD + 9 dígitos)!"
      );
      setModal("erro");
      return;
    }

    // O CEP não é obrigatório na primeira checagem, mas se a pessoa preencheu algo, tem que ser 8 números
    if (form.cep && form.cep.length !== 8) {
      setErroMsg("O CEP está incompleto! Digite exatamente 8 números.");
      setModal("erro");
      return;
    }

    const body = {
      nome: form.nome,
      tipo_cliente: tipo,
      telefone: form.telefone,
      email: form.email,
      logradouro: form.logradouro,
      numero: form.numero,
      bairro: form.bairro,
      cidade: form.cidade,
      uf: form.uf,
      cep: form.cep,
      ...(tipo === "FISICA"
        ? { cpf: form.cpf }
        : {
            cnpj: form.cnpj,
            razao_social: form.razao_social,
            nome_fantasia: form.nome_fantasia,
          }),
    };

    setIsSubmitting(true);

    try {
      const res = await fetch("http://localhost:3000/api/clientes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      console.log("Status:", res.status); 

      if (res.ok) {
        setNomeCadastrado(form.nome);
        setModal("sucesso");
      } else {
        const data = await res.json();
        setErroMsg(data.erro || "Erro ao cadastrar cliente.");
        setModal("erro");
      }
    } catch {
      setErroMsg("Não foi possível conectar ao servidor.");
      setModal("erro");
    } finally {
      setIsSubmitting(false);
    }
  };

  // O hook disponibiliza essas variáveis pra quem quiser usar!
  return {
    tipo,
    setTipo,
    modal,
    setModal,
    nomecadastrado,
    erroMsg,
    isSubmitting,
    form,
    setForm,
    handleChange,
    handleSubmit,
  };
}