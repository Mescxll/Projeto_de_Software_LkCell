// controllers/estoqueController.js
const prisma = require("../lib/prisma");

/**
 * Busca o saldo atual de um produto, agrupado por localização.
 * Mesma lógica que existia em produtoController.buscarEstoquePorLocalizacao —
 * centralizada aqui pois é uma operação de "estoque", não de "produto".
 *
 * GET /estoque/produto/:id
 */
const buscarSaldoPorProduto = async (req, res) => {
  try {
    const produtoId = parseInt(req.params.id);

    const produtoExiste = await prisma.produto.findUnique({
      where: { id_produto: produtoId },
    });

    if (!produtoExiste) {
      return res.status(404).json({ erro: "Produto não encontrado." });
    }

    const registros = await prisma.estoque.findMany({
      where: { fk_produto_id: produtoId },
      orderBy: { data_hora: "desc" },
      include: { localizacao: true },
    });

    const mapaLocalizacoes = new Map();
    for (const reg of registros) {
      const chave = reg.fk_localizacao_id ?? "sem_localizacao";
      if (!mapaLocalizacoes.has(chave)) {
        mapaLocalizacoes.set(chave, {
          id_localizacao: reg.fk_localizacao_id,
          localizacao: reg.localizacao?.localizacao ?? "Sem localização",
          estoque_atual: reg.estoque_atual,
          estoque_minimo: reg.estoque_minimo,
          estoque_ideal: reg.estoque_ideal,
        });
      }
    }

    const resultado = Array.from(mapaLocalizacoes.values())
      .filter((l) => l.estoque_atual > 0)
      .sort((a, b) =>
        (a.localizacao ?? "").localeCompare(b.localizacao ?? "", "pt-BR"),
      );

    return res.status(200).json(resultado);
  } catch (error) {
    console.error("Erro ao buscar saldo por produto:", error);
    return res
      .status(500)
      .json({ erro: "Erro interno no servidor ao buscar saldo do produto." });
  }
};

/**
 * Histórico completo de movimentos de um produto.
 * Aceita filtros opcionais por localização e tipo de movimento.
 *
 * GET /estoque/produto/:id/historico?fk_localizacao_id=&tipo_movimento=
 */
const buscarHistoricoPorProduto = async (req, res) => {
  try {
    const produtoId = parseInt(req.params.id);
    const { fk_localizacao_id, tipo_movimento } = req.query;

    const produtoExiste = await prisma.produto.findUnique({
      where: { id_produto: produtoId },
    });

    if (!produtoExiste) {
      return res.status(404).json({ erro: "Produto não encontrado." });
    }

    const where = { fk_produto_id: produtoId };

    if (fk_localizacao_id !== undefined) {
      where.fk_localizacao_id =
        fk_localizacao_id === "null" ? null : parseInt(fk_localizacao_id);
    }

    if (tipo_movimento) {
      where.tipo_movimento = tipo_movimento;
    }

    const historico = await prisma.estoque.findMany({
      where,
      orderBy: { data_hora: "desc" },
      include: {
        localizacao: true,
        venda: { select: { id_venda: true } },
        compra: { select: { id_compra: true } },
      },
    });

    return res.status(200).json(historico);
  } catch (error) {
    console.error("Erro ao buscar histórico de estoque:", error);
    return res
      .status(500)
      .json({ erro: "Erro interno no servidor ao buscar histórico de estoque." });
  }
};

/**
 * Lista produtos com saldo abaixo (ou igual) ao mínimo, por localização.
 * Compara o último registro de cada combinação produto+localização
 * com o estoque_minimo vigente naquele mesmo registro.
 *
 * GET /estoque/alertas
 */
const buscarAlertasEstoqueBaixo = async (req, res) => {
  try {
    // Busca todos os registros e mantém só o mais recente por
    // combinação produto+localização. Feito em memória pois o Prisma
    // não suporta "distinct + último por grupo" de forma nativa elegante.
    const registros = await prisma.estoque.findMany({
      orderBy: { data_hora: "desc" },
      include: {
        produto: {
          select: { id_produto: true, nome: true, codigo_produto: true },
        },
        localizacao: true,
      },
    });

    const mapaUltimos = new Map();
    for (const reg of registros) {
      const chave = `${reg.fk_produto_id}-${reg.fk_localizacao_id ?? "null"}`;
      if (!mapaUltimos.has(chave)) {
        mapaUltimos.set(chave, reg);
      }
    }

    const alertas = Array.from(mapaUltimos.values())
      .filter(
        (reg) =>
          reg.estoque_minimo !== null &&
          reg.estoque_atual <= reg.estoque_minimo,
      )
      .map((reg) => ({
        fk_produto_id: reg.fk_produto_id,
        produto: reg.produto?.nome ?? reg.produto?.codigo_produto,
        codigo_produto: reg.produto?.codigo_produto,
        id_localizacao: reg.fk_localizacao_id,
        localizacao: reg.localizacao?.localizacao ?? "Sem localização",
        estoque_atual: reg.estoque_atual,
        estoque_minimo: reg.estoque_minimo,
        estoque_ideal: reg.estoque_ideal,
      }))
      .sort((a, b) => a.estoque_atual - b.estoque_atual);

    return res.status(200).json(alertas);
  } catch (error) {
    console.error("Erro ao buscar alertas de estoque baixo:", error);
    return res
      .status(500)
      .json({ erro: "Erro interno no servidor ao buscar alertas de estoque." });
  }
};

/**
 * Ajusta estoque_minimo e/ou estoque_ideal de um produto.
 * Os valores são únicos por produto (não variam por localização), mas
 * como esses campos vivem em cada registro de estoque (por desenho do
 * schema, para preservar histórico), o ajuste precisa "espalhar" o novo
 * valor para todas as localizações onde o produto tem movimento — criando
 * um novo registro AJUSTE (quantidade 0) em cada uma, sem alterar saldo.
 *
 * PATCH /estoque/parametros/:produtoId
 * body: { estoque_minimo?, estoque_ideal? }
 */
const ajustarParametros = async (req, res) => {
  try {
    const produtoId = parseInt(req.params.produtoId);
    const { estoque_minimo, estoque_ideal } = req.body;

    if (estoque_minimo === undefined && estoque_ideal === undefined) {
      return res.status(400).json({
        erro: "Informe ao menos um de: estoque_minimo, estoque_ideal.",
      });
    }

    const produtoExiste = await prisma.produto.findUnique({
      where: { id_produto: produtoId },
    });

    if (!produtoExiste) {
      return res.status(404).json({ erro: "Produto não encontrado." });
    }

    const novoMinimo =
      estoque_minimo === undefined
        ? undefined
        : estoque_minimo === null
          ? null
          : parseInt(estoque_minimo);
    const novoIdeal =
      estoque_ideal === undefined
        ? undefined
        : estoque_ideal === null
          ? null
          : parseInt(estoque_ideal);

    const resultado = await prisma.$transaction(async (tx) => {
      // Todas as combinações produto+localização já movimentadas
      const registros = await tx.estoque.findMany({
        where: { fk_produto_id: produtoId },
        orderBy: { data_hora: "desc" },
      });

      const ultimosPorLocalizacao = new Map();
      for (const reg of registros) {
        const chave = reg.fk_localizacao_id ?? "null";
        if (!ultimosPorLocalizacao.has(chave)) {
          ultimosPorLocalizacao.set(chave, reg);
        }
      }

      if (ultimosPorLocalizacao.size === 0) {
        throw new Error("SEM_ESTOQUE");
      }

      const novosRegistros = [];
      for (const ultimo of ultimosPorLocalizacao.values()) {
        const registro = await tx.estoque.create({
          data: {
            fk_produto_id: produtoId,
            fk_localizacao_id: ultimo.fk_localizacao_id,
            tipo_movimento: "AJUSTE",
            quantidade: 0,
            estoque_atual: ultimo.estoque_atual,
            estoque_minimo:
              novoMinimo === undefined ? ultimo.estoque_minimo : novoMinimo,
            estoque_ideal:
              novoIdeal === undefined ? ultimo.estoque_ideal : novoIdeal,
            observacao: "Ajuste de parâmetros de estoque (mínimo/ideal)",
          },
          include: { localizacao: true },
        });
        novosRegistros.push(registro);
      }

      return novosRegistros;
    });

    return res.status(200).json({
      mensagem: "Parâmetros de estoque atualizados com sucesso!",
      registros: resultado,
    });
  } catch (error) {
    if (error.message === "SEM_ESTOQUE") {
      return res.status(409).json({
        erro: "Produto ainda não possui nenhum registro de estoque para ajustar.",
      });
    }

    console.error("Erro ao ajustar parâmetros de estoque:", error);
    return res
      .status(500)
      .json({ erro: "Erro interno no servidor ao ajustar parâmetros de estoque." });
  }
};

/**
 * Transfere quantidade de um produto entre duas localizações.
 * Gera dois registros AJUSTE (saída na origem, entrada no destino),
 * com observações linkadas entre si. Saldo pode chegar a zero na origem.
 *
 * POST /estoque/transferencia
 * body: { fk_produto_id, fk_localizacao_origem_id, fk_localizacao_destino_id, quantidade }
 */
const transferirEstoque = async (req, res) => {
  try {
    const {
      fk_produto_id,
      fk_localizacao_origem_id,
      fk_localizacao_destino_id,
      quantidade,
    } = req.body;

    const produtoId = parseInt(fk_produto_id);
    const origemId = parseInt(fk_localizacao_origem_id);
    const destinoId = parseInt(fk_localizacao_destino_id);
    const qtd = parseInt(quantidade);

    if (!produtoId || !origemId || !destinoId || !qtd) {
      return res.status(400).json({
        erro:
          "Informe fk_produto_id, fk_localizacao_origem_id, fk_localizacao_destino_id e quantidade.",
      });
    }

    if (origemId === destinoId) {
      return res.status(400).json({
        erro: "A localização de origem deve ser diferente da localização de destino.",
      });
    }

    if (qtd <= 0) {
      return res.status(400).json({
        erro: "A quantidade a transferir deve ser maior que zero.",
      });
    }

    const [produto, origem, destino] = await Promise.all([
      prisma.produto.findUnique({ where: { id_produto: produtoId } }),
      prisma.localizacao.findUnique({ where: { id_localizacao: origemId } }),
      prisma.localizacao.findUnique({ where: { id_localizacao: destinoId } }),
    ]);

    if (!produto) {
      return res.status(404).json({ erro: "Produto não encontrado." });
    }
    if (!origem) {
      return res.status(404).json({ erro: "Localização de origem não encontrada." });
    }
    if (!destino) {
      return res.status(404).json({ erro: "Localização de destino não encontrada." });
    }

    const ultimoOrigem = await prisma.estoque.findFirst({
      where: { fk_produto_id: produtoId, fk_localizacao_id: origemId },
      orderBy: { data_hora: "desc" },
    });

    const saldoOrigem = ultimoOrigem?.estoque_atual ?? 0;

    if (qtd > saldoOrigem) {
      return res.status(409).json({
        erro: `Estoque insuficiente na localização de origem. Disponível: ${saldoOrigem}, solicitado: ${qtd}.`,
      });
    }

    const resultado = await prisma.$transaction(async (tx) => {
      const ultimoDestino = await tx.estoque.findFirst({
        where: { fk_produto_id: produtoId, fk_localizacao_id: destinoId },
        orderBy: { data_hora: "desc" },
      });

      const saidaOrigem = await tx.estoque.create({
        data: {
          fk_produto_id: produtoId,
          fk_localizacao_id: origemId,
          tipo_movimento: "AJUSTE",
          quantidade: qtd,
          estoque_atual: saldoOrigem - qtd,
          estoque_minimo: ultimoOrigem?.estoque_minimo ?? null,
          estoque_ideal: ultimoOrigem?.estoque_ideal ?? null,
          observacao: `Transferência para ${destino.localizacao}`,
        },
        include: { localizacao: true },
      });

      const entradaDestino = await tx.estoque.create({
        data: {
          fk_produto_id: produtoId,
          fk_localizacao_id: destinoId,
          tipo_movimento: "AJUSTE",
          quantidade: qtd,
          estoque_atual: (ultimoDestino?.estoque_atual ?? 0) + qtd,
          estoque_minimo: ultimoDestino?.estoque_minimo ?? ultimoOrigem?.estoque_minimo ?? null,
          estoque_ideal: ultimoDestino?.estoque_ideal ?? ultimoOrigem?.estoque_ideal ?? null,
          observacao: `Transferência de ${origem.localizacao}`,
        },
        include: { localizacao: true },
      });

      return { saidaOrigem, entradaDestino };
    });

    return res.status(201).json({
      mensagem: `Transferência de ${qtd} unidade(s) de "${origem.localizacao}" para "${destino.localizacao}" realizada com sucesso!`,
      transferencia: resultado,
    });
  } catch (error) {
    console.error("Erro ao transferir estoque:", error);
    return res
      .status(500)
      .json({ erro: "Erro interno no servidor ao transferir estoque." });
  }
};

module.exports = {
  buscarSaldoPorProduto,
  buscarHistoricoPorProduto,
  buscarAlertasEstoqueBaixo,
  ajustarParametros,
  transferirEstoque,
};