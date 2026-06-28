// Validação de Atualização de Cliente
const validarAtualizarCliente = (req, res, next) => {
  const { uuid } = req.params;
  const {
    nome,
    logradouro,
    cidade,
    uf,
    numero,
    cep,
    bairro,
    telefone,
    telefone_secundario,
    email,
  } = req.body;

  // Trava da URL
  if (!uuid) {
    return res.status(400).json({ erro: "O UUID do cliente é obrigatório na URL." });
  }

  // Trava para valores vazios
  if (
    nome === undefined &&
    logradouro === undefined &&
    cidade === undefined &&
    uf === undefined &&
    numero === undefined &&
    cep === undefined &&
    bairro === undefined &&
    telefone === undefined &&
    telefone_secundario === undefined &&
    email === undefined
  ) {
    return res.status(400).json({ erro: "Nenhum dado válido foi enviado para atualização." });
  }

  // Trava (UF precisa ter 2 letras quando for informada)
  if (uf !== undefined && uf.trim() !== "" && uf.trim().length !== 2) {
    return res.status(400).json({ erro: "A UF (Estado) deve conter exatamente 2 letras (Ex: BA, SP)." });
  }

  next();
};

module.exports = validarAtualizarCliente;