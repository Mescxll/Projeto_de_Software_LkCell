// Lógica da Tela de Cadastro de Produtos
import { useState, useEffect, useRef } from "react";

export function useCadastrarProduto() {
  const [modal, setModal] = useState(null);
  const [erroMsg, setErroMsg] = useState("");
  const [nomeProduto, setNomeProduto] = useState("");

  const [sugestoesModelo, setSugestoesModelo] = useState([]);
  const [sugestoesCategoria, setSugestoesCategoria] = useState([]);
  const [sugestoesMarca, setSugestoesMarca] = useState([]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState({
    codigo_produto: "",
    descricao: "",
    nome_categoria: "",
    nome_marca: "",
    nome_modelo: "",
    estoque_minimo: "",
    estoque_ideal: "",
    estoque_atual: "",
    preco_compra: "",
    preco_custo: "",
    preco_venda: "",
    margem_lucro: "",
  });

  const dropdownRef = useRef(null);

  const formatarPrecoBrasil = (valor) => {
    const somenteNumeros = valor.replace(/[^\d,]/g, "");
    const partes = somenteNumeros.split(",");

    if (partes.length <= 1) {
      return somenteNumeros;
    }

    return `${partes[0]},${partes.slice(1).join("")}`;
  };

  const converterPrecoBrasil = (valor) => {
    if (!valor) return null;

    const numero = Number(valor.replace(/\./g, "").replace(",", "."));
    return Number.isFinite(numero) ? numero : null;
  };

  // Fechar dropdowns quando clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setSugestoesModelo([]);
        setSugestoesCategoria([]);
        setSugestoesMarca([]);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (["preco_compra", "preco_custo", "preco_venda"].includes(name)) {
      const valorFormatado = formatarPrecoBrasil(value);
      const novoForm = { ...form, [name]: valorFormatado };

      const custo = converterPrecoBrasil(
        name === "preco_custo" ? valorFormatado : form.preco_custo,
      );
      const venda = converterPrecoBrasil(
        name === "preco_venda" ? valorFormatado : form.preco_venda,
      );

      if (custo !== null && venda !== null && custo > 0 && venda > 0) {
        const margem = (((venda - custo) / custo) * 100).toFixed(2);
        novoForm.margem_lucro = margem.replace(".", ",");
      } else {
        novoForm.margem_lucro = "";
      }

      setForm(novoForm);
      return;
    }

    // Campos de estoque: aceita apenas dígitos
    if (["estoque_atual", "estoque_minimo", "estoque_ideal"].includes(name)) {
      const somenteNumeros = value.replace(/\D/g, "");
      setForm((prev) => ({ ...prev, [name]: somenteNumeros }));
      return;
    }

    setForm((prev) => ({ ...prev, [name]: value }));

    if (name === "nome_modelo") buscarModelos(value);
    if (name === "nome_categoria") buscarCategorias(value);
    if (name === "nome_marca") buscarMarcas(value);
  };

  const handleSubmit = async () => {
    if (
      !form.codigo_produto ||
      !form.nome_categoria ||
      !form.nome_marca ||
      !form.nome_modelo ||
      !form.preco_venda?.trim()
    ) {
      setErroMsg(
        "Preencha todos os campos obrigatórios, incluindo o Preço de Venda.",
      );
      setModal("erro");
      return;
    }

    setIsSubmitting(true);

    try {
      const precoCompra = converterPrecoBrasil(form.preco_compra);
      const precoCusto = converterPrecoBrasil(form.preco_custo);
      const precoVenda = converterPrecoBrasil(form.preco_venda);
      const margemLucro = converterPrecoBrasil(form.margem_lucro);

      const res = await fetch("http://localhost:3000/api/produtos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...form,
          preco_compra: precoCompra,
          preco_custo: precoCusto,
          preco_venda: precoVenda,
          margem_lucro: margemLucro,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setNomeProduto(`${form.nome_marca} ${form.nome_modelo}`);

        setModal("sucesso");
      } else {
        setErroMsg(data.erro || "Erro ao cadastrar produto.");
        setModal("erro");
      }
    } catch {
      setErroMsg("Não foi possível conectar ao servidor.");
      setModal("erro");
    } finally {
      setIsSubmitting(false);
    }
  };

  const buscarModelos = async (texto) => {
    if (!texto.trim()) {
      setSugestoesModelo([]);
      return;
    }

    try {
      const res = await fetch(
        `http://localhost:3000/api/catalogo/modelos?search=${texto}`,
      );

      const data = await res.json();

      setSugestoesModelo(data);
    } catch (error) {
      console.error(error);
    }
  };

  const buscarCategorias = async (texto) => {
    if (!texto.trim()) {
      setSugestoesCategoria([]);
      return;
    }

    try {
      const res = await fetch(
        `http://localhost:3000/api/catalogo/categorias?search=${texto}`,
      );

      const data = await res.json();

      setSugestoesCategoria(data);
    } catch (error) {
      console.error(error);
    }
  };

  const buscarMarcas = async (texto) => {
    if (!texto.trim()) {
      setSugestoesMarca([]);
      return;
    }

    try {
      const res = await fetch(
        `http://localhost:3000/api/catalogo/marcas?search=${texto}`,
      );

      const data = await res.json();

      setSugestoesMarca(data);
    } catch (error) {
      console.error(error);
    }
  };
  const selecionarModelo = (modelo) => {
    setForm((prev) => ({
      ...prev,
      nome_modelo: modelo.nome,
      nome_marca: modelo.marca.nome,
    }));

    setSugestoesModelo([]);
  };

  const selecionarCategoria = (categoria) => {
    setForm((prev) => ({
      ...prev,
      nome_categoria: categoria.nome,
    }));

    setSugestoesCategoria([]);
  };

  const selecionarMarca = (marca) => {
    setForm((prev) => ({
      ...prev,
      nome_marca: marca.nome,
    }));

    setSugestoesMarca([]);
  };

  return {
    form,
    setForm,
    modal,
    setModal,
    erroMsg,
    nomeProduto,
    isSubmitting,
    sugestoesModelo,
    sugestoesCategoria,
    sugestoesMarca,
    selecionarModelo,
    selecionarCategoria,
    selecionarMarca,
    handleChange,
    handleSubmit,
    dropdownRef,
  };
}
