// Lógica da Tela de Atualizar Compra
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export function useAtualizarCompra(id) {
  const router = useRouter();
  const [compra, setCompra] = useState(null);
  const [fornecedores, setFornecedores] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [localizacoes, setLocalizacoes] = useState([]);
  const [itens, setItens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erroMsg, setErroMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modal, setModal] = useState(null);
  const [modalCancelar, setModalCancelar] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [modalSucessoCancelamento, setModalSucessoCancelamento] =
    useState(false);

  const [form, setForm] = useState({
    fk_fornecedor_id_fornecedor: "",
    prazo_entrega: "",
  });

  const [itemForm, setItemForm] = useState({
    fk_produto_id_produto: "",
    quantidade: "",
    preco_compra: "",
    fk_localizacao_id: "",
  });

  // Busca compra, fornecedores, produtos e localizações ao abrir
  useEffect(() => {
    const buscarDados = async () => {
      try {
        const [resCompra, resFornecedores, resProdutos, resLocalizacoes] =
          await Promise.all([
            fetch(`http://localhost:3000/api/compras/${id}`),
            fetch("http://localhost:3000/api/fornecedores"),
            fetch("http://localhost:3000/api/produtos"),
            fetch("http://localhost:3000/api/localizacoes"),
          ]);

        if (!resCompra.ok) {
          setErroMsg("Compra não encontrada.");
          setModal("erro");
          setLoading(false);
          return;
        }

        const dataCompra = await resCompra.json();

        // Lê localizações aqui, dentro do mesmo escopo, para usar no map abaixo
        const localizacoesData = resLocalizacoes.ok
          ? await resLocalizacoes.json()
          : [];

        // fk_localizacao_id já vem direto do item (parte da PK composta de itenscompra)
        // Não precisa mais buscar no estoque — elimina a causa do key duplicado
        const itensComLocalizacao = dataCompra.itenscompra.map((item) => {
          const loc = localizacoesData.find(
            (l) => l.id_localizacao === item.fk_localizacao_id,
          );
          return {
            ...item,
            localizacaoNome: loc?.localizacao ?? "—",
          };
        });

        setCompra({ ...dataCompra, itenscompra: itensComLocalizacao });
        setItens(itensComLocalizacao);

        setForm({
          fk_fornecedor_id_fornecedor:
            dataCompra.fk_fornecedor_id_fornecedor || "",
          prazo_entrega: dataCompra.prazo_entrega
            ? (() => {
                const dataUTC = new Date(dataCompra.prazo_entrega);
                if (Number.isNaN(dataUTC.getTime())) return "";
                const ano = dataUTC.getUTCFullYear();
                const mes = String(dataUTC.getUTCMonth() + 1).padStart(2, "0");
                const dia = String(dataUTC.getUTCDate()).padStart(2, "0");
                return `${ano}-${mes}-${dia}`;
              })()
            : "",
        });

        if (resFornecedores.ok) {
          const data = await resFornecedores.json();
          setFornecedores(Array.isArray(data) ? data : []);
        }

        if (resProdutos.ok) {
          const data = await resProdutos.json();
          setProdutos(Array.isArray(data) ? data : []);
        }

        // Reaproveita o dado já lido acima
        setLocalizacoes(
          Array.isArray(localizacoesData) ? localizacoesData : [],
        );
      } catch (err) {
        console.error("Erro ao buscar dados:", err);
        setErroMsg("Erro ao carregar dados do sistema.");
        setModal("erro");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      buscarDados();
    }
  }, [id]);

  // Converte formato brasileiro (1.234,56 ou 1234,56) para float
  const parseBRL = (str) =>
    Number(String(str).replace(/\./g, "").replace(",", "."));

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleChangeItem = (e) => {
    const { name, value } = e.target;

    if (name === "quantidade") {
      setItemForm((prev) => ({ ...prev, [name]: value.replace(/\D/g, "") }));
    } else if (name === "preco_compra") {
      setItemForm((prev) => ({
        ...prev,
        [name]: value.replace(/[^0-9.,]/g, ""),
      }));
    } else {
      setItemForm((prev) => {
        const updated = { ...prev, [name]: value };

        if (name === "fk_produto_id_produto") {
          const produtoSelecionado = produtos.find(
            (p) => p.id_produto === parseInt(value),
          );
          updated.preco_compra = produtoSelecionado?.preco_compra
            ? Number(produtoSelecionado.preco_compra).toLocaleString("pt-BR", {
                minimumFractionDigits: 2,
              })
            : "";
        }

        return updated;
      });
    }
  };

  const handleAdicionarItem = () => {
    if (
      !itemForm.fk_produto_id_produto ||
      !itemForm.quantidade ||
      !itemForm.preco_compra ||
      !itemForm.fk_localizacao_id
    ) {
      setErroMsg(
        "Preencha produto, quantidade, preço de compra e localização.",
      );
      setModal("erro");
      return;
    }

    const qty = parseInt(itemForm.quantidade);
    if (qty <= 0 || !Number.isInteger(qty)) {
      setErroMsg("A quantidade deve ser um número inteiro maior que zero.");
      setModal("erro");
      return;
    }

    const preco = parseBRL(itemForm.preco_compra);
    if (isNaN(preco) || preco <= 0) {
      setErroMsg("O preço de compra deve ser maior que zero.");
      setModal("erro");
      return;
    }

    // Bloqueia produto + localização duplicados
    const jaExiste = itens.find(
      (i) =>
        i.fk_produto_id_produto === parseInt(itemForm.fk_produto_id_produto) &&
        String(i.fk_localizacao_id) === String(itemForm.fk_localizacao_id),
    );
    if (jaExiste) {
      setErroMsg(
        "Este produto já foi adicionado nesta localização. Ajuste a quantidade na tabela.",
      );
      setModal("erro");
      return;
    }

    const localizacaoSelecionada = localizacoes.find(
      (l) => String(l.id_localizacao) === String(itemForm.fk_localizacao_id),
    );

    setItens((prev) => [
      ...prev,
      {
        fk_produto_id_produto: parseInt(itemForm.fk_produto_id_produto),
        quantidade: qty,
        preco_compra: preco,
        fk_localizacao_id: parseInt(itemForm.fk_localizacao_id),
        localizacaoNome: localizacaoSelecionada?.localizacao ?? "—",
        // Guarda referência do produto para exibir na tabela
        produto: produtos.find(
          (p) => p.id_produto === parseInt(itemForm.fk_produto_id_produto),
        ),
      },
    ]);

    setItemForm({
      fk_produto_id_produto: "",
      quantidade: "",
      preco_compra: "",
      fk_localizacao_id: "",
    });
  };

  const handleRemoverItem = (produtoId, localizacaoId) => {
    setItens((prev) =>
      prev.filter(
        (i) =>
          !(
            i.fk_produto_id_produto === produtoId &&
            String(i.fk_localizacao_id) === String(localizacaoId)
          ),
      ),
    );
  };

  const handleChangeQuantidade = (produtoId, localizacaoId, valor) => {
    setItens((prev) =>
      prev.map((item) =>
        item.fk_produto_id_produto === produtoId &&
        String(item.fk_localizacao_id) === String(localizacaoId)
          ? { ...item, quantidade: valor === "" ? "" : Number(valor) }
          : item,
      ),
    );
  };

  const handleSubmit = async () => {
    if (!form.fk_fornecedor_id_fornecedor) {
      setErroMsg("Selecione um fornecedor.");
      setModal("erro");
      return;
    }

    if (itens.length === 0) {
      setErroMsg("A compra deve ter pelo menos um produto.");
      setModal("erro");
      return;
    }

    const itemInvalido = itens.find(
      (i) => !i.quantidade || Number(i.quantidade) <= 0,
    );
    if (itemInvalido) {
      setErroMsg(
        `Quantidade inválida para o produto "${
          itemInvalido.produto?.descricao ||
          itemInvalido.produto?.nome ||
          "desconhecido"
        }".`,
      );
      setModal("erro");
      return;
    }

    setIsSubmitting(true);

    const body = {
      fk_fornecedor_id_fornecedor: parseInt(form.fk_fornecedor_id_fornecedor),
      prazo_entrega: form.prazo_entrega || null,
      itens: itens.map((item) => ({
        fk_produto_id_produto: item.fk_produto_id_produto,
        quantidade: Number(item.quantidade),
        preco_compra: Number(item.preco_compra),
        fk_localizacao_id: item.fk_localizacao_id ?? null,
      })),
    };

    try {
      const itensInvalidos = itens.filter((i) => !i.fk_produto_id_produto);
      console.log("itens sem produto_id:", itensInvalidos);
      const res = await fetch(`http://localhost:3000/api/compras/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        const dataAtualizada = await res.json();
        setCompra(dataAtualizada.compra);
        setModal("sucesso");
        setTimeout(() => {
          router.push("/compra/gerenciar");
        }, 1500);
      } else {
        const data = await res.json();
        setErroMsg(data.erro || "Erro ao atualizar compra.");
        setModal("erro");
      }
    } catch {
      setErroMsg("Não foi possível conectar ao servidor.");
      setModal("erro");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelarCompra = async () => {
    setModalCancelar(false);
    setIsCancelling(true);

    try {
      const res = await fetch(`http://localhost:3000/api/compras/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setCompra((prev) =>
          prev ? { ...prev, status_compra: "CANCELADA" } : prev,
        );
        setModalSucessoCancelamento(true);
      } else {
        const data = await res.json();
        setErroMsg(data.erro || "Erro ao cancelar compra.");
        setModal("erro");
      }
    } catch {
      setErroMsg("Não foi possível conectar ao servidor.");
      setModal("erro");
    } finally {
      setIsCancelling(false);
    }
  };

  const formatarPreco = (valor) =>
    Number(valor).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });

  const formatarData = (data) => {
    if (!data) return "-";
    try {
      return new Date(data).toLocaleString("pt-BR", {
        timeZone: "America/Sao_Paulo",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
    } catch {
      return new Date(data).toLocaleString("pt-BR");
    }
  };

  return {
    compra,
    fornecedores,
    produtos,
    localizacoes,
    itens,
    itemForm,
    loading,
    erroMsg,
    isSubmitting,
    modal,
    setModal,
    modalCancelar,
    setModalCancelar,
    isCancelling,
    modalSucessoCancelamento,
    setModalSucessoCancelamento,
    form,
    setForm,
    handleChange,
    handleChangeItem,
    handleAdicionarItem,
    handleRemoverItem,
    handleChangeQuantidade,
    handleSubmit,
    handleCancelarCompra,
    formatarPreco,
    formatarData,
  };
}
