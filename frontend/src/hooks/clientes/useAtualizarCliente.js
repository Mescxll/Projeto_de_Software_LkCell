import { useState, useEffect } from "react";

export function useAtualizarCliente(uuid) {
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [modalErro, setModalErro] = useState(false);
  const [erroMsg, setErroMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tipo, setTipo] = useState("FISICA");
  const [form, setForm] = useState({
    documento: "",
    nome: "",
    telefone: "",
    email: "",
    logradouro: "",
    numero: "",
    bairro: "",
    cidade: "",
    uf: "",
    cep: "",
  });

  // Funções ajudantes para mascarar os dados que vêm crus do banco
  const formatarTelefone = (num) => {
    if (!num) return "";
    return num
      .replace(/\D/g, "")
      .replace(/(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{5})(\d)/, "$1-$2")
      .slice(0, 15);
  };

  const formatarCEP = (num) => {
    if (!num) return "";
    return num
      .replace(/\D/g, "")
      .replace(/(\d{5})(\d)/, "$1-$2")
      .slice(0, 9);
  };

  // Mascarando os dados que chegam da API
  useEffect(() => {
    if (!uuid) return;

    fetch(`http://localhost:3000/api/clientes/${uuid}`)
      .then((res) => res.json())
      .then((data) => {
        const tipoCliente =
          data.tipo_cliente === "FISICO" ? "FISICA" : "JURIDICA";
        setTipo(tipoCliente);

        const docBruto =
          data.pessoafisica?.cpf || data.pessoajuridica?.cnpj || "";

        let docFormatado = docBruto;
        if (tipoCliente === "FISICA" && docBruto.length === 11) {
          docFormatado = docBruto.replace(
            /(\d{3})(\d{3})(\d{3})(\d{2})/,
            "$1.$2.$3-$4",
          );
        } else if (tipoCliente === "JURIDICA" && docBruto.length === 14) {
          docFormatado = docBruto.replace(
            /(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/,
            "$1.$2.$3/$4-$5",
          );
        }

        setForm({
          documento: docFormatado,
          nome: data.nome || "",
          telefone: formatarTelefone(
            data.telefone_cliente?.[0]?.telefone_cliente,
          ),
          email: data.email || "",
          logradouro: data.logradouro || "",
          numero: data.numero?.toString() || "",
          bairro: data.bairro || "",
          cidade: data.cidade || "",
          uf: data.uf || "",
          cep: formatarCEP(data.cep),
        });
        setLoading(false);
      })
      .catch((err) => {
        console.error("Erro ao buscar cliente:", err);
        setLoading(false);
      });
  }, [uuid]);

  // Mantendo a máscara enquanto o usuário digita
  const handleChange = (e) => {
    let { name, value } = e.target;
    let num = value.replace(/\D/g, ""); // Arranca tudo que não for número

    if (name === "telefone") {
      value = num
        .replace(/(\d{2})(\d)/, "($1) $2")
        .replace(/(\d{5})(\d)/, "$1-$2")
        .slice(0, 15);
    } else if (name === "cep") {
      value = num.replace(/(\d{5})(\d)/, "$1-$2").slice(0, 9);
    } else if (name === "numero") {
      value = num; // Endereço só aceita número limpo
    } else if (name === "uf") {
      value = value
        .replace(/[^a-zA-Z]/g, "")
        .slice(0, 2)
        .toUpperCase();
    }

    setForm({ ...form, [name]: value });
  };

  // Arrancando as máscaras pra enviar pro Banco
  const handleSalvar = async () => {
    // Limpando formatação para validar tamanho e salvar
    const telefoneLimpo = form.telefone.replace(/\D/g, "");
    const cepLimpo = form.cep.replace(/\D/g, "");

    // Trava de campos em branco
    if (!form.nome.trim() || !telefoneLimpo) {
      setErroMsg("Preencha todos os campos obrigatórios: Nome e Telefone.");
      setModalErro(true);
      return;
    }

    // Trava de tamanho do Telefone
    if (telefoneLimpo.length !== 11) {
      setErroMsg(
        "O telefone precisa ter exatamente 11 números (DDD + 9 dígitos)!",
      );
      setModalErro(true);
      return;
    }

    // Trava de tamanho do CEP
    if (cepLimpo && cepLimpo.length !== 8) {
      setErroMsg("O CEP está incompleto! Digite exatamente 8 números.");
      setModalErro(true);
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch(`http://localhost:3000/api/clientes/${uuid}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: form.nome,
          telefone: telefoneLimpo, // Enviando limpo pro Prisma
          email: form.email,
          logradouro: form.logradouro,
          numero: form.numero,
          bairro: form.bairro,
          cidade: form.cidade,
          uf: form.uf,
          cep: cepLimpo, // Enviando limpo pro Prisma
        }),
      });

      if (res.ok) {
        setModal(true);
      } else {
        const data = await res.json();
        setErroMsg(data.erro || "Erro ao atualizar cliente no servidor.");
        setModalErro(true);
      }
    } catch {
      setErroMsg("Não foi possível conectar ao servidor.");
      setModalErro(true);
    } finally {
      setIsSubmitting(false);
    }
  };

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
