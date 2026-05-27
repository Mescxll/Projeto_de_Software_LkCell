// Validar Cadastro Funcionário
const validarCadastrarFuncionario = (req, res, next) => {
  const { nome, data_nascimento } = req.body;

  // Trava do Nome
  if (!nome || typeof nome !== "string" || nome.trim().length === 0) {
    return res.status(400).json({
      erro: "O nome do Funcionário é obrigatório e deve ser um texto válido.",
    });
  }

  // Trava da Data de Nascimento 
  if (data_nascimento) {
    // Validar formato exato (YYYY-MM-DD)
    const regexData = /^\d{4}-\d{2}-\d{2}$/;
    if (!regexData.test(data_nascimento)) {
      return res.status(400).json({
        erro: "Data de nascimento deve estar no formato YYYY-MM-DD.",
      });
    }

    // Validação do meio-dia pra evitar o pulo de fuso horário
    const data = new Date(`${data_nascimento}T12:00:00Z`);
    
    if (isNaN(data.getTime())) {
      return res.status(400).json({ erro: "Data de nascimento inválida." });
    }

    // Validação de Menores de idade
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
      return res.status(400).json({
        erro: "O funcionário deve ter pelo menos 18 anos para ser cadastrado.",
      });
    }
  }

  next();
};

module.exports = validarCadastrarFuncionario;