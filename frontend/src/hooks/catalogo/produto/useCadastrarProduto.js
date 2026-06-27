// Lógica da Tela de Cadastrar Produtos
import { useState, useEffect } from "react";

export function useCadastrarProduto() {
  const [modal, setModal] = useState(null);
  const [erroMsg, setErroMsg] = useState("");
  const [nomeProduto, setNomeProduto] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Dados de apoio para os selects — agora SOMENTE seleção,
  // sem criação automática de categoria/marca/modelo.
  const [categorias, setCategorias] = useState([]);
  const [marcas, setMarcas] = useState([]);
  const [modelos, setModelos] = useState([]); // já filtrados pela marca escolhida
  const [loadingDados, setLoadingDados] = useState(true);

  const [form, setForm] = useState({
    codigo_produto: "",
    descricao: "",
    fk_categoria_id: "",
    fk_marca_id: "",
    fk_modelo_id: "",
    estoque_minimo: "",
    estoque_ideal: "",
    estoque_atual: "",
    preco_compra: "",
    preco_custo: "",
    preco_venda: "",
    margem_lucro: "",
  });

  // ---------------------------------------------------------------------
  // Compatibilidade
  // ---------------------------------------------------------------------
  // "especificas" | "todas" | "universal"
  const [modoCompat, setModoCompat] = useState("especificas");
  // Lista local — nada é enviado à API até o produto ser criado
  const [compatibilidades, setCompatibilidades] = useState([]);

  // Formulário de adicionar uma entrada de compatibilidade
  const [compatForm, setCompatForm] = useState({
    fk_marca_id: "",
    fk_modelo_id: "",
    observacao: "",
  });
  const [modelosCompat, setModelosCompat] = useState([]); // modelos filtrados p/ o form de compat

  useEffect(() => {
    const buscarDados = async () => {
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

    buscarDados();
  }, []);

  // Busca os modelos da marca selecionada no produto (não confundir com
  // modelosCompat, que é para o formulário de compatibilidade)
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

  // Busca os modelos da marca selecionada no formulário de compatibilidade
  useEffect(() => {
    if (!compatForm.fk_marca_id) {
      setModelosCompat([]);
      return;
    }

    fetch(
      `http://localhost:3000/api/modelos?marca_id=${compatForm.fk_marca_id}`,
    )
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setModelosCompat(Array.isArray(data) ? data : []))
      .catch((err) => console.error("Erro ao buscar modelos:", err));
  }, [compatForm.fk_marca_id]);

  const formatarPrecoBrasil = (valor) => {
    const somenteNumeros = valor.replace(/[^\d,]/g, "");
    const partes = somenteNumeros.split(",");
    if (partes.length <= 1) return somenteNumeros;
    return `${partes[0]},${partes.slice(1).join("")}`;
  };

  const converterPrecoBrasil = (valor) => {
    if (!valor) return null;
    const numero = Number(valor.replace(/\./g, "").replace(",", "."));
    return Number.isFinite(numero) ? numero : null;
  };

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

    if (["estoque_atual", "estoque_minimo", "estoque_ideal"].includes(name)) {
      const somenteNumeros = value.replace(/\D/g, "");
      setForm((prev) => ({ ...prev, [name]: somenteNumeros }));
      return;
    }

    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Marca do produto — ao trocar, limpa o modelo já escolhido
  const handleSelecionarMarca = (val) => {
    setForm((prev) => ({ ...prev, fk_marca_id: val, fk_modelo_id: "" }));
  };

  const handleSelecionarModelo = (val) => {
    setForm((prev) => ({ ...prev, fk_modelo_id: val }));
  };

  const handleSelecionarCategoria = (val) => {
    setForm((prev) => ({ ...prev, fk_categoria_id: val }));
  };

  // ---------------------------------------------------------------------
  // Compatibilidade — handlers
  // ---------------------------------------------------------------------

  // Trocar o modo descarta a lista local — nada foi persistido ainda,
  // e as duas listas (INCLUSAO/EXCLUSAO) não podem coexistir.
  const handleTrocarModoCompat = (novoModo) => {
    setModoCompat(novoModo);
    setCompatibilidades([]);
    setCompatForm({ fk_marca_id: "", fk_modelo_id: "", observacao: "" });
  };

  const handleChangeCompatForm = (campo, valor) => {
    if (campo === "fk_marca_id") {
      // Trocar a marca no formulário de compat limpa o modelo escolhido
      setCompatForm((prev) => ({
        ...prev,
        fk_marca_id: valor,
        fk_modelo_id: "",
      }));
      return;
    }
    setCompatForm((prev) => ({ ...prev, [campo]: valor }));
  };

  const handleAdicionarCompatibilidade = () => {
    if (!compatForm.fk_marca_id) {
      setErroMsg("Selecione uma marca para adicionar a compatibilidade.");
      setModal("erro");
      return;
    }

    const marcaId = parseInt(compatForm.fk_marca_id);
    const modeloId = compatForm.fk_modelo_id
      ? parseInt(compatForm.fk_modelo_id)
      : null;

    // Bloqueia duplicata antes de chegar no backend
    const jaExiste = compatibilidades.some(
      (c) => c.fk_marca_id === marcaId && c.fk_modelo_id === modeloId,
    );
    if (jaExiste) {
      setErroMsg("Esta combinação de marca/modelo já foi adicionada.");
      setModal("erro");
      return;
    }

    const marcaSelecionada = marcas.find((m) => m.id_marca === marcaId);
    const modeloSelecionado = modeloId
      ? modelosCompat.find((m) => m.id_modelo === modeloId)
      : null;

    setCompatibilidades((prev) => [
      ...prev,
      {
        fk_marca_id: marcaId,
        fk_modelo_id: modeloId,
        observacao: compatForm.observacao?.trim() || "",
        marcaNome: marcaSelecionada?.nome ?? "—",
        modeloNome: modeloSelecionado?.nome ?? "(todos os modelos)",
      },
    ]);

    setCompatForm({ fk_marca_id: "", fk_modelo_id: "", observacao: "" });
  };

  const handleRemoverCompatibilidade = (fk_marca_id, fk_modelo_id) => {
    setCompatibilidades((prev) =>
      prev.filter(
        (c) =>
          !(c.fk_marca_id === fk_marca_id && c.fk_modelo_id === fk_modelo_id),
      ),
    );
  };

  // ---------------------------------------------------------------------
  // Submit — cria o produto e, em seguida, envia cada compatibilidade
  // ---------------------------------------------------------------------
  const handleSubmit = async () => {
    if (
      !form.codigo_produto.trim() ||
      !form.descricao.trim() ||
      !form.fk_categoria_id ||
      !form.preco_venda?.trim()
    ) {
      setErroMsg(
        "Preencha todos os campos obrigatórios: Código, Descrição, Categoria e Preço de Venda.",
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

      const resProduto = await fetch("http://localhost:3000/api/produtos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          codigo_produto: form.codigo_produto.trim(),
          descricao: form.descricao.trim(),
          fk_categoria_id: parseInt(form.fk_categoria_id),
          ...(form.fk_modelo_id && {
            fk_modelo_id: parseInt(form.fk_modelo_id),
          }),
          compativel_todas_marcas:
            modoCompat === "todas" || modoCompat === "universal",
          estoque_minimo: form.estoque_minimo,
          estoque_ideal: form.estoque_ideal,
          estoque_atual: form.estoque_atual,
          preco_compra: precoCompra,
          preco_custo: precoCusto,
          preco_venda: precoVenda,
          margem_lucro: margemLucro,
        }),
      });

      const dataProduto = await resProduto.json();

      if (!resProduto.ok) {
        setErroMsg(dataProduto.erro || "Erro ao cadastrar produto.");
        setModal("erro");
        setIsSubmitting(false);
        return;
      }

      const idProduto = dataProduto.produto.id_produto;
      const tipo = modoCompat === "todas" ? "EXCLUSAO" : "INCLUSAO";

      // Produto criado — agora envia cada compatibilidade em sequência.
      // Se uma falhar, o produto já existe; avisamos e direcionamos
      // o usuário para a tela de Atualizar (ver especificação, seção 6.1).
      const falhas = [];
      for (const c of compatibilidades) {
        try {
          const resCompat = await fetch(
            `http://localhost:3000/api/produtos/${idProduto}/compatibilidades`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                fk_marca_id: c.fk_marca_id,
                fk_modelo_id: c.fk_modelo_id,
                tipo,
                observacao: c.observacao || undefined,
              }),
            },
          );
          if (!resCompat.ok) {
            falhas.push(
              `${c.marcaNome} ${c.modeloNome !== "(todos os modelos)" ? c.modeloNome : ""}`.trim(),
            );
          }
        } catch {
          falhas.push(
            `${c.marcaNome} ${c.modeloNome !== "(todos os modelos)" ? c.modeloNome : ""}`.trim(),
          );
        }
      }

      setNomeProduto(form.descricao.trim());

      if (falhas.length > 0) {
        setErroMsg(
          `Produto cadastrado, mas as seguintes compatibilidades não foram salvas: ${falhas.join(
            ", ",
          )}. Acesse "Atualizar Produto" para adicioná-las novamente.`,
        );
        setModal("erro-parcial");
      } else {
        setModal("sucesso");
      }

      // Reseta o formulário independentemente do resultado das
      // compatibilidades, já que o produto em si foi criado com sucesso.
      setForm({
        codigo_produto: "",
        descricao: "",
        fk_categoria_id: "",
        fk_marca_id: "",
        fk_modelo_id: "",
        estoque_minimo: "",
        estoque_ideal: "",
        estoque_atual: "",
        preco_compra: "",
        preco_custo: "",
        preco_venda: "",
        margem_lucro: "",
      });
      setModoCompat("especificas");
      setCompatibilidades([]);
      setCompatForm({ fk_marca_id: "", fk_modelo_id: "", observacao: "" });
    } catch {
      setErroMsg("Não foi possível conectar ao servidor.");
      setModal("erro");
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    form,
    modal,
    setModal,
    erroMsg,
    nomeProduto,
    isSubmitting,
    loadingDados,
    categorias,
    marcas,
    modelos,
    handleChange,
    handleSelecionarCategoria,
    handleSelecionarMarca,
    handleSelecionarModelo,
    handleSubmit,

    // Compatibilidade
    modoCompat,
    handleTrocarModoCompat,
    compatibilidades,
    compatForm,
    modelosCompat,
    handleChangeCompatForm,
    handleAdicionarCompatibilidade,
    handleRemoverCompatibilidade,
  };
}
