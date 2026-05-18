// Validar Cadastro Fornecedor
const validarCadastrarFornecedor = (req, res, next) => {
  const { cnpj, razao_social, politica_preco } = req.body;

  // Verificação de Valores Obrigatórios
  if (!cnpj || !razao_social || politica_preco === undefined) {
    return res.status(400).json({
      erro: "Preencha os campos obrigatórios: CNPJ, Razão Social e Política de Preço.",
    });
  }

  //  Verificação do tamanho do CNPJ 
  const cnpjLimpo = cnpj.replace(/\D/g, "");
  if (cnpjLimpo.length !== 14) {
    return res.status(400).json({ 
      erro: "O CNPJ precisa ter exatamente 14 dígitos válidos." 
    });
  }

  // Passa entrada no controller
  next();
};

module.exports = validarCadastrarFornecedor;