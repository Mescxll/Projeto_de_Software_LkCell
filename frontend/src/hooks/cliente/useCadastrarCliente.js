// Lógica da Tela de Cadastrar Clientes 
import { useState } from "react";

export function useCadastrarCliente() {
  const [tipo, setTipo] = useState("FISICA");
  const [modal, setModal] = useState(null);
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

    // Remove tudo que não for número
    let num = value.replace(/\D/g, "");

    // Aplicando máscaras nos dados 
    if (name === "cpf") {
      value = num
        .replace(/(\d{3})(\d)/, "$1.$2") // Coloca ponto após o 3º dígito
        .replace(/(\d{3})(\d)/, "$1.$2") // Coloca ponto após o 6º dígito
        .replace(/(\d{3})(\d{1,2})/, "$1-$2") // Coloca traço após o 9º dígito
        .slice(0, 14); // Trava o tamanho com a pontuação
    } 
    else if (name === "cnpj") {
      value = num
        .replace(/(\d{2})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1/$2")
        .replace(/(\d{4})(\d{1,2})/, "$1-$2")
        .slice(0, 18);
    } 
    else if (name === "telefone") {
      value = num
        .replace(/(\d{2})(\d)/, "($1) $2") // Coloca parênteses no DDD
        .replace(/(\d{5})(\d)/, "$1-$2")   // Coloca traço após o 5º dígito do número
        .slice(0, 15);
    } 
    else if (name === "cep") {
      value = num
        .replace(/(\d{5})(\d)/, "$1-$2")
        .slice(0, 9);
    } 
    else if (name === "uf") {
      value = value.replace(/[^a-zA-Z]/g, "").slice(0, 2).toUpperCase();
    }

    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async () => {
    // Arrancando as máscaras pra enviar pro Banco
    const cpfLimpo = form.cpf.replace(/\D/g, "");
    const cnpjLimpo = form.cnpj.replace(/\D/g, "");
    const telefoneLimpo = form.telefone.replace(/\D/g, "");
    const cepLimpo = form.cep.replace(/\D/g, "");

    const docLimpo = tipo === "FISICA" ? cpfLimpo : cnpjLimpo;

    if (!form.nome.trim() || !docLimpo || !telefoneLimpo) {
      setErroMsg("Preencha todos os campos obrigatórios: Nome, Documento e Telefone.");
      setModal("erro");
      return;
    }

    if (tipo === "FISICA" && cpfLimpo.length !== 11) {
      setErroMsg("O CPF precisa ter exatamente 11 números!");
      setModal("erro");
      return;
    }

    if (tipo === "JURIDICA" && cnpjLimpo.length !== 14) {
      setErroMsg("O CNPJ precisa ter exatamente 14 números!");
      setModal("erro");
      return;
    }

    if (telefoneLimpo.length !== 11) {
      setErroMsg("O telefone precisa ter exatamente 11 números (DDD + 9 dígitos)!");
      setModal("erro");
      return;
    }

    if (cepLimpo && cepLimpo.length !== 8) {
      setErroMsg("O CEP está incompleto! Digite exatamente 8 números.");
      setModal("erro");
      return;
    }

    const body = {
      nome: form.nome,
      tipo_cliente: tipo,
      telefone: telefoneLimpo, 
      email: form.email,
      logradouro: form.logradouro,
      numero: form.numero,
      bairro: form.bairro,
      cidade: form.cidade,
      uf: form.uf,
      cep: cepLimpo, 
      ...(tipo === "FISICA"
        ? { cpf: cpfLimpo } 
        : {
            cnpj: cnpjLimpo, 
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