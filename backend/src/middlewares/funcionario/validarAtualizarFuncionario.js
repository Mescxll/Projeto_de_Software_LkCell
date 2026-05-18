// Validação de Atualização de Funcionário
const validarAtualizarFuncionario = (req, res, next) => {
  const { id } = req.params;
  const { nome, data_nascimento } = req.body;

  // Trava da URL
  if (!id || isNaN(id)) {
    return res.status(400).json({ erro: "O ID do funcionário é obrigatório e deve ser um número." });
  }

  // 2. Trava de valores nulos
  if (nome === undefined && data_nascimento === undefined) {
    return res.status(400).json({ erro: "Nenhum dado válido foi enviado para atualização." });
  }

  // Validação do Nome 
  if (nome !== undefined && (typeof nome !== "string" || nome.trim().length === 0)) {
    return res.status(400).json({ erro: "O nome deve ser um texto válido." });
  }

  // Validação da Data e Idade (se ela existir)
  if (data_nascimento) {
    const regexData = /^\d{4}-\d{2}-\d{2}$/;
    if (!regexData.test(data_nascimento)) {
      return res.status(400).json({ erro: "Data de nascimento deve estar no formato YYYY-MM-DD." });
    }

    // Blindagem do fuso horário pra validação!
    const data = new Date(`${data_nascimento}T12:00:00Z`);
    if (isNaN(data.getTime())) {
      return res.status(400).json({ erro: "Data de nascimento inválida." });
    }

    const hoje = new Date();
    let idade = hoje.getFullYear() - data.getFullYear();
    const mesAtual = hoje.getMonth();
    const diaAtual = hoje.getDate();
    const mesNascimento = data.getMonth();
    const diaNascimento = data.getDate();

    if (mesAtual < mesNascimento || (mesAtual === mesNascimento && diaAtual < diaNascimento)) {
      idade--;
    }

    if (idade < 18) {
      return res.status(400).json({ erro: "O funcionário deve ter pelo menos 18 anos." });
    }
  }

  next();
};

module.exports = validarAtualizarFuncionario;