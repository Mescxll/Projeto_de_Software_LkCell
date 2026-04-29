const validarCadastroFuncionario = (req, res, next) => {
  const { nome, data_nascimento } = req.body;

  if (!nome) {
    return res.status(400).json({
      erro: "O nome do Funcionário é o obrigatório!.",
    });
  }

  if (typeof nome !== "string" || nome.trim().length === 0) {
    return res.status(400).json({
      erro: "Nome deve ser uma string não vazia.",
    });
  }

  if (!data_nascimento) {
    return next();
  }

  // Validar formato de data (YYYY-MM-DD)
  const regexData = /^\d{4}-\d{2}-\d{2}$/;
  if (!regexData.test(data_nascimento)) {
    return res.status(400).json({
      erro: "Data de nascimento deve estar no formato YYYY-MM-DD.",
    });
  }

  // Validar se é uma data válida
  const data = new Date(data_nascimento);
  if (isNaN(data.getTime())) {
    return res.status(400).json({
      erro: "Data de nascimento inválida.",
    });
  }

  // Validação de Menores de idade
  const hoje = new Date();
  let idade = hoje.getFullYear() - data.getFullYear();
  const mesAtual = hoje.getMonth();
  const diaAtual = hoje.getDate();
  const mesNascimento = data.getMonth();
  const diaNascimento = data.getDate();

  if (
    mesAtual < mesNascimento ||
    (mesAtual === mesNascimento && diaAtual < diaNascimento)
  ) {
    idade--;
  }

  if (idade < 18) {
    return res.status(400).json({
      erro: "O funcionário deve ter pelo menos 18 anos para ser cadastrado.",
    });
  }

  next();
};

module.exports = validarCadastroFuncionario;
