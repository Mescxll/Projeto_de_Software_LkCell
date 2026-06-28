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
 * Movimentações gerais de estoque, cruzando todos os produtos.
 * Aceita filtros opcionais por período, tipo de movimento, produto e
 * localização, com paginação (20 itens por página por padrão).
 *
 * GET /estoque/movimentacoes?data_inicio=&data_fim=&tipo_movimento=&fk_produto_id=&fk_localizacao_id=&pagina=&por_pagina=
 */
const buscarMovimentacoesGerais = async (req, res) => {
  try {
    const {
      data_inicio,
      data_fim,
      tipo_movimento,
      fk_produto_id,
      fk_localizacao_id,
      pagina,
      por_pagina,
    } = req.query;

    const paginaAtual = pagina ? parseInt(pagina) : 1;
    const itensPorPagina = por_pagina ? parseInt(por_pagina) : 20;

    const where = {};

    if (data_inicio || data_fim) {
      where.data_hora = {};
      if (data_inicio) where.data_hora.gte = new Date(data_inicio);
      if (data_fim) {
        const fim = new Date(data_fim);
        fim.setHours(23, 59, 59, 999);
        where.data_hora.lte = fim;
      }
    }

    if (tipo_movimento) {
      where.tipo_movimento = tipo_movimento;
    }

    if (fk_produto_id) {
      where.fk_produto_id = parseInt(fk_produto_id);
    }

    if (fk_localizacao_id !== undefined) {
      where.fk_localizacao_id =
        fk_localizacao_id === "null" ? null : parseInt(fk_localizacao_id);
    }

    const [total, movimentacoes] = await prisma.$transaction([
      prisma.estoque.count({ where }),
      prisma.estoque.findMany({
        where,
        orderBy: { data_hora: "desc" },
        skip: (paginaAtual - 1) * itensPorPagina,
        take: itensPorPagina,
        include: {
          produto: {
            select: { id_produto: true, nome: true, codigo_produto: true },
          },
          localizacao: true,
          venda: { select: { id_venda: true } },
          compra: { select: { id_compra: true } },
        },
      }),
    ]);

    return res.status(200).json({
      movimentacoes,
      paginacao: {
        pagina: paginaAtual,
        por_pagina: itensPorPagina,
        total,
        total_paginas: Math.ceil(total / itensPorPagina),
      },
    });
  } catch (error) {
    console.error("Erro ao buscar movimentações gerais de estoque:", error);
    return res
      .status(500)
      .json({ erro: "Erro interno no servidor ao buscar movimentações de estoque." });
  }
};

// Ordem de gravidade usada para definir o status agregado do produto:
// se qualquer localização estiver pior, o produto herda o pior status.
const GRAVIDADE_STATUS = { abaixo_minimo: 2, acima_ideal: 1, normal: 0 };

const calcularStatusLocalizacao = (estoqueAtual, estoqueMinimo, estoqueIdeal) => {
  if (estoqueMinimo !== null && estoqueAtual <= estoqueMinimo) {
    return "abaixo_minimo";
  }
  if (estoqueIdeal !== null && estoqueAtual > estoqueIdeal) {
    return "acima_ideal";
  }
  return "normal";
};

/**
 * Visão geral de estoque: um item por produto, com as localizações
 * aninhadas. O status de cada localização é calculado individualmente
 * (saldo daquela localização vs. mínimo/ideal do produto); o status do
 * produto (linha principal) é o "pior caso" entre suas localizações.
 *
 * Aceita ?status=abaixo_minimo para retornar apenas produtos que têm
 * ao menos uma localização naquela condição (o produto retornado vem
 * com todas as suas localizações, não só as problemáticas).
 *
 * GET /estoque?status=abaixo_minimo
 */
const buscarVisaoGeralEstoque = async (req, res) => {
  try {
    const { status } = req.query;

    // Busca todos os registros e mantém só o mais recente por
    // combinação produto+localização. Feito em memória pois o Prisma
    // não suporta "distinct + último por grupo" de forma nativa elegante.
    const registros = await prisma.estoque.findMany({
      orderBy: { data_hora: "desc" },
      include: {
        produto: {
          select: {
            id_produto: true,
            nome: true,
            codigo_produto: true,
            categoria: { select: { nome: true } },
          },
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

    // Agrupa os últimos registros por produto
    const mapaProdutos = new Map();
    for (const reg of mapaUltimos.values()) {
      if (!mapaProdutos.has(reg.fk_produto_id)) {
        mapaProdutos.set(reg.fk_produto_id, {
          id_produto: reg.fk_produto_id,
          nome: reg.produto?.nome,
          codigo_produto: reg.produto?.codigo_produto,
          categoria: reg.produto?.categoria?.nome ?? null,
          estoque_minimo: reg.estoque_minimo,
          estoque_ideal: reg.estoque_ideal,
          localizacoes: [],
        });
      }

      const statusLocalizacao = calcularStatusLocalizacao(
        reg.estoque_atual,
        reg.estoque_minimo,
        reg.estoque_ideal,
      );

      mapaProdutos.get(reg.fk_produto_id).localizacoes.push({
        id_localizacao: reg.fk_localizacao_id,
        localizacao: reg.localizacao?.localizacao ?? "Sem localização",
        estoque_atual: reg.estoque_atual,
        status: statusLocalizacao,
      });
    }

    let resultado = Array.from(mapaProdutos.values()).map((produto) => {
      const saldo_total = produto.localizacoes.reduce(
        (soma, loc) => soma + loc.estoque_atual,
        0,
      );

      const statusProduto = produto.localizacoes.reduce(
        (pior, loc) =>
          GRAVIDADE_STATUS[loc.status] > GRAVIDADE_STATUS[pior]
            ? loc.status
            : pior,
        "normal",
      );

      return {
        ...produto,
        saldo_total,
        status: statusProduto,
      };
    });

    if (status) {
      resultado = resultado.filter((produto) =>
        produto.localizacoes.some((loc) => loc.status === status),
      );
    }

    resultado.sort((a, b) =>
      (a.nome ?? a.codigo_produto ?? "").localeCompare(
        b.nome ?? b.codigo_produto ?? "",
        "pt-BR",
      ),
    );

    return res.status(200).json(resultado);
  } catch (error) {
    console.error("Erro ao buscar visão geral de estoque:", error);
    return res
      .status(500)
      .json({ erro: "Erro interno no servidor ao buscar visão geral de estoque." });
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
  buscarVisaoGeralEstoque,
  buscarMovimentacoesGerais,
  ajustarParametros,
  transferirEstoque,
};