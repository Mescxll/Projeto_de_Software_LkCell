// Lógica da Tela de Atualizar Produtos
import { useState, useEffect, useRef } from "react";

export function useAtualizarProduto(id) {
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [erroMsg, setErroMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    descricao: "",
    nome_categoria: "",
    estoque_atual: "",
    estoque_minimo: "",
    estoque_ideal: "",
    preco_compra: "",
    preco_custo: "",
    preco_venda: "",
    margem_lucro: "",
  });
  const [infoSomenteLeitura, setInfoSomenteLeitura] = useState({
    codigo_produto: "",
    nome_marca: "",
    nome_modelo: "",
  });

  const dropdownRef = useRef(null);
  const [sugestoesCategoria, setSugestoesCategoria] = useState([]);

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

  useEffect(() => {
    if (!id) return;
    fetch(`http://localhost:3000/api/produtos/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setInfoSomenteLeitura({
          codigo_produto: data.codigo_produto || "",
          nome_marca: data.modelo?.marca?.nome || "",
          nome_modelo: data.modelo?.nome || "",
        });

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
          nome_categoria: data.categoria?.nome || "",
          estoque_atual: data.estoque_atual?.toString() || "",
          estoque_minimo: data.estoque_minimo?.toString() || "",
          estoque_ideal: data.estoque_ideal?.toString() || "",
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

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setSugestoesCategoria([]);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

    if (["estoque_atual", "estoque_minimo", "estoque_ideal"].includes(name)) {
      setForm((prev) => ({ ...prev, [name]: value.replace(/\D/g, "") }));
      return;
    }

    setForm((prev) => ({ ...prev, [name]: value }));

    if (name === "nome_categoria") buscarCategorias(value);
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
    } catch (err) {
      console.error(err);
    }
  };

  const selecionarCategoria = (categoria) => {
    setForm((prev) => ({ ...prev, nome_categoria: categoria.nome }));
    setSugestoesCategoria([]);
  };

  const handleSalvar = async () => {
    if (
      !form.descricao.trim() ||
      !form.nome_categoria.trim() ||
      !form.estoque_atual ||
      !form.preco_venda
    ) {
      setErroMsg(
        "Preencha todos os campos obrigatórios: Descrição, Categoria, Estoque Atual e Preço Venda.",
      );
      setModal("erro");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`http://localhost:3000/api/produtos/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          descricao: form.descricao,
          nome_categoria: form.nome_categoria,
          estoque_atual: form.estoque_atual,
          estoque_minimo: form.estoque_minimo || null,
          estoque_ideal: form.estoque_ideal || null,
          preco_compra: converterPrecoBrasil(form.preco_compra),
          preco_custo: converterPrecoBrasil(form.preco_custo),
          preco_venda: converterPrecoBrasil(form.preco_venda),
        }),
      });

      if (res.ok) setModal("sucesso");
      else {
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
    modal,
    setModal,
    erroMsg,
    isSubmitting,
    form,
    infoSomenteLeitura,
    dropdownRef,
    sugestoesCategoria,
    selecionarCategoria,
    handleChange,
    handleSalvar,
  };
}
