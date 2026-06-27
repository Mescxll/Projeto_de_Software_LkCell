// Lógica da Seção de Compatibilidade — usada dentro de Atualizar Produto.
// Diferente do Cadastro, aqui o produto já existe, então cada ação
// (adicionar, remover, trocar modo) chama a API imediatamente — não há
// estado "pendente de salvar".
import { useState, useEffect } from "react";

export function useCompatibilidadeProduto(produtoId) {
  const [carregando, setCarregando] = useState(true);
  // "especificas" | "todas" | "universal"
  const [modoCompat, setModoCompat] = useState("especificas");
  const [compatibilidades, setCompatibilidades] = useState([]);

  const [marcas, setMarcas] = useState([]);
  const [modelosCompat, setModelosCompat] = useState([]);

  const [compatForm, setCompatForm] = useState({
    fk_marca_id: "",
    fk_modelo_id: "",
    observacao: "",
  });

  const [isSalvandoEntrada, setIsSalvandoEntrada] = useState(false);
  const [isTrocandoModo, setIsTrocandoModo] = useState(false);
  const [idRemovendo, setIdRemovendo] = useState(null);

  const [modalConfirmarModo, setModalConfirmarModo] = useState(null);

  const [erroMsg, setErroMsg] = useState("");
  const [modalErro, setModalErro] = useState(false);

  // Carrega compatibilidades atuais do produto + marcas para o formulário
  useEffect(() => {
    if (!produtoId) return;

    const carregar = async () => {
      try {
        const [resCompat, resMarcas] = await Promise.all([
          fetch(
            `http://localhost:3000/api/produtos/${produtoId}/compatibilidades`,
          ),
          fetch("http://localhost:3000/api/marcas"),
        ]);

        const dataCompat = resCompat.ok ? await resCompat.json() : null;
        const dataMarcas = resMarcas.ok ? await resMarcas.json() : [];

        if (dataCompat) {
          const lista = dataCompat.compatibilidades ?? [];
          setCompatibilidades(lista);
          setModoCompat(
            derivarModo(dataCompat.compativel_todas_marcas === true, lista),
          );
        }
        setMarcas(Array.isArray(dataMarcas) ? dataMarcas : []);
      } catch (err) {
        console.error("Erro ao carregar compatibilidades:", err);
      } finally {
        setCarregando(false);
      }
    };

    carregar();
  }, [produtoId]);

  // Busca modelos da marca escolhida no formulário de adicionar entrada
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

  const handleChangeCompatForm = (campo, valor) => {
    if (campo === "fk_marca_id") {
      setCompatForm((prev) => ({
        ...prev,
        fk_marca_id: valor,
        fk_modelo_id: "",
      }));
      return;
    }
    setCompatForm((prev) => ({ ...prev, [campo]: valor }));
  };

  const confirmarTrocaModoComValor = async (novoValor, modoAlvo) => {
    setIsTrocandoModo(true);
    try {
      const res = await fetch(
        `http://localhost:3000/api/produtos/${produtoId}/compatibilidades/todas-marcas`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ compativel_todas_marcas: novoValor }),
        },
      );

      const data = await res.json();

      if (res.ok) {
        const lista = data.produto.compatibilidades ?? [];
        setCompatibilidades(lista);
        // Usa o modo alvo explícito em vez de derivar do banco
        setModoCompat(modoAlvo);
        setCompatForm({ fk_marca_id: "", fk_modelo_id: "", observacao: "" });
      } else {
        setErroMsg(data.erro || "Erro ao trocar o modo de compatibilidade.");
        setModalErro(true);
      }
    } catch {
      setErroMsg("Não foi possível conectar ao servidor.");
      setModalErro(true);
    } finally {
      setIsTrocandoModo(false);
      setModalConfirmarModo(null);
    }
  };

  const derivarModo = (todasMarcas, listaCompat) => {
    if (!todasMarcas) return "especificas";
    if (listaCompat.length === 0) return "universal";
    return "todas";
  };

  const confirmarTrocaModo = async () => {
    if (modalConfirmarModo === null) return;
    await confirmarTrocaModoComValor(
      modalConfirmarModo !== "especificas",
      modalConfirmarModo,
    );
  };

  const solicitarTrocaModo = (novoModo) => {
    if (novoModo === modoCompat) return;

    if (compatibilidades.length === 0) {
      confirmarTrocaModoComValor(novoModo !== "especificas", novoModo);
      return;
    }

    setModalConfirmarModo(novoModo);
  };

  const cancelarTrocaModo = () => setModalConfirmarModo(null);

  const handleAdicionarCompatibilidade = async () => {
    if (!compatForm.fk_marca_id) {
      setErroMsg("Selecione uma marca para adicionar a compatibilidade.");
      setModalErro(true);
      return;
    }

    setIsSalvandoEntrada(true);
    try {
      const res = await fetch(
        `http://localhost:3000/api/produtos/${produtoId}/compatibilidades`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fk_marca_id: parseInt(compatForm.fk_marca_id),
            fk_modelo_id: compatForm.fk_modelo_id
              ? parseInt(compatForm.fk_modelo_id)
              : null,
            tipo: modoCompat === "todas" ? "EXCLUSAO" : "INCLUSAO",
            observacao: compatForm.observacao?.trim() || undefined,
          }),
        },
      );

      const data = await res.json();

      if (res.ok) {
        setCompatibilidades((prev) => [...prev, data.compatibilidade]);
        setCompatForm({ fk_marca_id: "", fk_modelo_id: "", observacao: "" });
      } else {
        setErroMsg(data.erro || "Erro ao adicionar compatibilidade.");
        setModalErro(true);
      }
    } catch {
      setErroMsg("Não foi possível conectar ao servidor.");
      setModalErro(true);
    } finally {
      setIsSalvandoEntrada(false);
    }
  };

  const handleRemoverCompatibilidade = async (idCompatibilidade) => {
    setIdRemovendo(idCompatibilidade);
    try {
      const res = await fetch(
        `http://localhost:3000/api/produtos/${produtoId}/compatibilidades/${idCompatibilidade}`,
        { method: "DELETE" },
      );

      if (res.ok) {
        setCompatibilidades((prev) =>
          prev.filter((c) => c.id_compatibilidade !== idCompatibilidade),
        );
      } else {
        const data = await res.json();
        setErroMsg(data.erro || "Erro ao remover compatibilidade.");
        setModalErro(true);
      }
    } catch {
      setErroMsg("Não foi possível conectar ao servidor.");
      setModalErro(true);
    } finally {
      setIdRemovendo(null);
    }
  };

  return {
    carregando,
    modoCompat,
    compatibilidades,
    marcas,
    modelosCompat,
    compatForm,
    handleChangeCompatForm,
    solicitarTrocaModo,
    cancelarTrocaModo,
    confirmarTrocaModo,
    modalConfirmarModo,
    isTrocandoModo,
    handleAdicionarCompatibilidade,
    handleRemoverCompatibilidade,
    isSalvandoEntrada,
    idRemovendo,
    erroMsg,
    modalErro,
    setModalErro,
  };
}
