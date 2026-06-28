// Lógica do Modal de Transferir Estoque
import { useState, useEffect } from "react";

export function useTransferirEstoque(produtoInicial, onSuccess) {
  const [produtos, setProdutos] = useState([]);
  const [localizacoes, setLocalizacoes] = useState([]);
  const [loadingDados, setLoadingDados] = useState(true);
  const [saldoOrigem, setSaldoOrigem] = useState(null);
  const [loadingSaldo, setLoadingSaldo] = useState(false);

  const [modal, setModal] = useState(null);
  const [erroMsg, setErroMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState({
    fk_produto_id: produtoInicial?.id_produto ?? "",
    fk_localizacao_origem_id: "",
    fk_localizacao_destino_id: "",
    quantidade: "",
  });

  // Busca produtos e localizações ao abrir
  useEffect(() => {
    const buscarDados = async () => {
      try {
        const [resProdutos, resLocalizacoes] = await Promise.all([
          fetch("http://localhost:3000/api/produtos"),
          fetch("http://localhost:3000/api/localizacoes"),
        ]);

        if (resProdutos.ok) {
          const data = await resProdutos.json();
          setProdutos(Array.isArray(data) ? data : []);
        }

        if (resLocalizacoes.ok) {
          const data = await resLocalizacoes.json();
          setLocalizacoes(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error("Erro ao buscar dados:", err);
        setErroMsg("Erro ao carregar dados do sistema.");
        setModal("erro");
      } finally {
        setLoadingDados(false);
      }
    };

    buscarDados();
  }, []);

  // Busca o saldo da localização de origem sempre que produto ou origem mudam
  useEffect(() => {
    const buscarSaldo = async () => {
      if (!form.fk_produto_id || !form.fk_localizacao_origem_id) {
        setSaldoOrigem(null);
        return;
      }

      setLoadingSaldo(true);
      try {
        const res = await fetch(
          `http://localhost:3000/api/estoque/produto/${form.fk_produto_id}`,
        );
        if (res.ok) {
          const data = await res.json();
          const localizacaoEncontrada = Array.isArray(data)
            ? data.find(
                (l) =>
                  String(l.id_localizacao) ===
                  String(form.fk_localizacao_origem_id),
              )
            : null;
          setSaldoOrigem(localizacaoEncontrada?.estoque_atual ?? 0);
        } else {
          setSaldoOrigem(null);
        }
      } catch {
        setSaldoOrigem(null);
      } finally {
        setLoadingSaldo(false);
      }
    };

    buscarSaldo();
  }, [form.fk_produto_id, form.fk_localizacao_origem_id]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "quantidade") {
      setForm((prev) => ({ ...prev, [name]: value.replace(/\D/g, "") }));
      return;
    }

    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    const {
      fk_produto_id,
      fk_localizacao_origem_id,
      fk_localizacao_destino_id,
      quantidade,
    } = form;

    if (
      !fk_produto_id ||
      !fk_localizacao_origem_id ||
      !fk_localizacao_destino_id ||
      !quantidade
    ) {
      setErroMsg("Preencha produto, origem, destino e quantidade.");
      setModal("erro");
      return;
    }

    if (
      String(fk_localizacao_origem_id) === String(fk_localizacao_destino_id)
    ) {
      setErroMsg(
        "A localização de origem deve ser diferente da localização de destino.",
      );
      setModal("erro");
      return;
    }

    const qty = parseInt(quantidade);
    if (isNaN(qty) || qty <= 0) {
      setErroMsg("A quantidade deve ser um número inteiro maior que zero.");
      setModal("erro");
      return;
    }

    if (saldoOrigem !== null && qty > saldoOrigem) {
      setErroMsg(
        `Estoque insuficiente na localização de origem. Disponível: ${saldoOrigem}, solicitado: ${qty}.`,
      );
      setModal("erro");
      return;
    }

    setIsSubmitting(true);

    const body = {
      fk_produto_id: parseInt(fk_produto_id),
      fk_localizacao_origem_id: parseInt(fk_localizacao_origem_id),
      fk_localizacao_destino_id: parseInt(fk_localizacao_destino_id),
      quantidade: qty,
    };

    try {
      const res = await fetch(
        "http://localhost:3000/api/estoque/transferencia",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        },
      );

      if (res.ok) {
        setModal("sucesso");
        onSuccess?.();
        setForm({
          fk_produto_id: "",
          fk_localizacao_origem_id: "",
          fk_localizacao_destino_id: "",
          quantidade: "",
        });
      } else {
        const data = await res.json();
        setErroMsg(data.erro || "Erro ao transferir estoque.");
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
    produtos,
    localizacoes,
    loadingDados,
    saldoOrigem,
    loadingSaldo,
    form,
    modal,
    setModal,
    erroMsg,
    isSubmitting,
    handleChange,
    handleSubmit,
  };
}