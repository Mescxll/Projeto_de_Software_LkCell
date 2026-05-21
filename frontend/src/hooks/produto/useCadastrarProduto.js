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
      // Bloqueia caracteres inválidos (só permite números, vírgula e ponto)
      if (value !== "" && !/^[\d.,]*$/.test(value)) return;

      const novoForm = { ...form, [name]: value };

      // Atualiza os valores conforme qual campo está sendo editado
      const custoRaw = name === "preco_custo" ? value : form.preco_custo;
      const vendaRaw = name === "preco_venda" ? value : form.preco_venda;

      // Converte vírgula para ponto para parseFloat
      const custoStr = custoRaw?.toString().replace(",", ".") || "";
      const vendaStr = vendaRaw?.toString().replace(",", ".") || "";

      const custo = parseFloat(custoStr) || 0;
      const venda = parseFloat(vendaStr) || 0;

      // Verifica se os números estão completos (não terminam com ponto)
      const custoValido = custoStr && !custoStr.endsWith(".");
      const vendaValida = vendaStr && !vendaStr.endsWith(".");

      // Calcula margem apenas se ambos os valores são válidos e maiores que zero
      if (custo > 0 && venda > 0 && custoValido && vendaValida) {
        const margem = (((venda - custo) / custo) * 100).toFixed(2);
        novoForm.margem_lucro = margem.replace(".", ",");
      } else {
        novoForm.margem_lucro = "";
      }

      setForm(novoForm);
      return;
    }

    // Campos de estoque: bloqueia negativo
    if (["estoque_atual", "estoque_minimo", "estoque_ideal"].includes(name)) {
      if (value !== "" && parseInt(value) < 0) return;
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
      !form.preco_venda
    ) {
      setErroMsg("Preencha todos os campos obrigatórios.");
      setModal("erro");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("http://localhost:3000/api/produtos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...form,
          preco_compra: form.preco_compra?.toString().replace(",", "."),
          preco_custo: form.preco_custo?.toString().replace(",", "."),
          preco_venda: form.preco_venda?.toString().replace(",", "."),
          margem_lucro: form.margem_lucro?.toString().replace(",", "."),
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
