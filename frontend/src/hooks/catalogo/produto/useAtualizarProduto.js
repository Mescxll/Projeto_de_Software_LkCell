// Lógica da Tela de Atualizar Produtos
import { useState, useEffect } from "react";

export function useAtualizarProduto(id) {
  const [loading, setLoading] = useState(true);
  const [loadingDados, setLoadingDados] = useState(true);
  const [modal, setModal] = useState(null);
  const [erroMsg, setErroMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState({
    descricao: "",
    fk_categoria_id: "",
    fk_marca_id: "",
    fk_modelo_id: "",
    preco_compra: "",
    preco_custo: "",
    preco_venda: "",
    margem_lucro: "",
  });

  // Código é o único campo verdadeiramente travado — não muda após o cadastro
  const [codigoProduto, setCodigoProduto] = useState("");

  // Dados de apoio para os selects — mesmo padrão do cadastro
  const [categorias, setCategorias] = useState([]);
  const [marcas, setMarcas] = useState([]);
  const [modelos, setModelos] = useState([]); // filtrados pela marca escolhida

  const formatarPrecoBrasil = (valor) => {
    if (valor === null || valor === undefined) return "";
    const numero = Number(String(valor).replace(/\./g, "").replace(",", "."));
    if (!Number.isFinite(numero)) return "";
    return numero.toFixed(2).replace(".", ",");
  };

  const converterPrecoBrasil = (valor) => {
    if (!valor) return null;
    const numero = Number(String(valor).replace(/\./g, "").replace(",", "."));
    return Number.isFinite(numero) ? numero : null;
  };

  // Busca categorias e marcas (dados de apoio dos selects)
  useEffect(() => {
    const buscarDadosApoio = async () => {
      try {
        const [resCategorias, resMarcas] = await Promise.all([
          fetch("http://localhost:3000/api/categorias"),
          fetch("http://localhost:3000/api/marcas"),
        ]);

        const dataCategorias = resCategorias.ok
          ? await resCategorias.json()
          : [];
        const dataMarcas = resMarcas.ok ? await resMarcas.json() : [];

        setCategorias(Array.isArray(dataCategorias) ? dataCategorias : []);
        setMarcas(Array.isArray(dataMarcas) ? dataMarcas : []);
      } catch (err) {
        console.error("Erro ao buscar dados do catálogo:", err);
      } finally {
        setLoadingDados(false);
      }
    };

    buscarDadosApoio();
  }, []);

  // Busca o produto em si
  useEffect(() => {
    if (!id) return;

    fetch(`http://localhost:3000/api/produtos/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setCodigoProduto(data.codigo_produto || "");       

        const precoCusto = formatarPrecoBrasil(data.preco_custo);
        const precoVenda = formatarPrecoBrasil(data.preco_venda);

        let margem = "";
        const custo = converterPrecoBrasil(precoCusto);
        const venda = converterPrecoBrasil(precoVenda);
        if (custo && venda && custo > 0 && venda > 0) {
          margem = (((venda - custo) / custo) * 100)
            .toFixed(2)
            .replace(".", ",");
        }

        setForm({
          descricao: data.descricao || "",
          fk_categoria_id: data.categoria?.id_categoria
            ? String(data.categoria.id_categoria)
            : "",
          fk_marca_id: data.modelo?.marca?.id_marca
            ? String(data.modelo.marca.id_marca)
            : "",
          fk_modelo_id: data.modelo?.id_modelo
            ? String(data.modelo.id_modelo)
            : "",
          preco_compra: formatarPrecoBrasil(data.preco_compra),
          preco_custo: precoCusto,
          preco_venda: precoVenda,
          margem_lucro: margem,
        });

        setLoading(false);
      })
      .catch((err) => {
        console.error("Erro ao buscar produto:", err);
        setLoading(false);
      });
  }, [id]);

  // Busca os modelos da marca selecionada — dispara sempre que fk_marca_id muda,
  // inclusive no carregamento inicial do produto.
  useEffect(() => {
    if (!form.fk_marca_id) {
      setModelos([]);
      return;
    }

    fetch(`http://localhost:3000/api/modelos?marca_id=${form.fk_marca_id}`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setModelos(Array.isArray(data) ? data : []))
      .catch((err) => console.error("Erro ao buscar modelos:", err));
  }, [form.fk_marca_id]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (["preco_compra", "preco_custo", "preco_venda"].includes(name)) {
      const somenteNumeros = value.replace(/[^\d,]/g, "");
      const novoForm = { ...form, [name]: somenteNumeros };

      const custo = converterPrecoBrasil(
        name === "preco_custo" ? somenteNumeros : form.preco_custo,
      );
      const venda = converterPrecoBrasil(
        name === "preco_venda" ? somenteNumeros : form.preco_venda,
      );

      if (custo && venda && custo > 0 && venda > 0) {
        novoForm.margem_lucro = (((venda - custo) / custo) * 100)
          .toFixed(2)
          .replace(".", ",");
      } else {
        novoForm.margem_lucro = "";
      }

      setForm(novoForm);
      return;
    }

    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelecionarCategoria = (val) => {
    setForm((prev) => ({ ...prev, fk_categoria_id: val }));
  };

  // Trocar a marca limpa o modelo escolhido — mesma regra do cadastro
  const handleSelecionarMarca = (val) => {
    setForm((prev) => ({ ...prev, fk_marca_id: val, fk_modelo_id: "" }));
  };

  const handleSelecionarModelo = (val) => {
    setForm((prev) => ({ ...prev, fk_modelo_id: val }));
  };

  const handleSalvar = async () => {
    if (
      !form.descricao.trim() ||
      !form.fk_categoria_id ||
      !form.preco_venda?.trim()
    ) {
      setErroMsg(
        "Preencha todos os campos obrigatórios: Descrição, Categoria e Preço de Venda.",
      );
      setModal("erro");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`http://localhost:3000/api/produtos/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          descricao: form.descricao,
          fk_categoria_id: parseInt(form.fk_categoria_id),
          fk_modelo_id: form.fk_modelo_id ? parseInt(form.fk_modelo_id) : null,
          preco_compra: converterPrecoBrasil(form.preco_compra),
          preco_custo: converterPrecoBrasil(form.preco_custo),
          preco_venda: converterPrecoBrasil(form.preco_venda),
        }),
      });

      if (res.ok) {
        setModal("sucesso");
      } else {
        const data = await res.json();
        setErroMsg(data.erro || "Erro ao atualizar produto.");
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
    loading,
    loadingDados,
    modal,
    setModal,
    erroMsg,
    isSubmitting,
    form,
    codigoProduto,
    categorias,
    marcas,
    modelos,
    handleChange,
    handleSelecionarCategoria,
    handleSelecionarMarca,
    handleSelecionarModelo,
    handleSalvar,
  };
}
