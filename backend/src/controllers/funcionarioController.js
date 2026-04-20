const prisma = require('../lib/prisma');

const cadastrarFuncionario = async (req, res) => {
    try {
        const { nome, data_nascimento } = req.body;
       
        const novoFuncionario = await prisma.funcionario.create({
            data: {
                nome,
                // Convertendo para objeto Date
                data_aniversario: data_nascimento ? new Date(data_nascimento) : null
            }
        });

        return res.status(201).json({
            mensagem: 'Funcionário cadastrado com sucesso!',
            funcionario: novoFuncionario
        });

    } catch (error) {
        console.error('Erro Prisma:', error);
        return res.status(500).json({ erro: 'Erro interno no servidor ao salvar.' });
    }
};

const buscarFuncionario = async (req, res) => {
    try {
        const { id } = req.params;

        const funcionario = await prisma.funcionario.findUnique({
            where: { id_funcionario: parseInt(id) }
        });

        if (!funcionario) {
            return res.status(404).json({ erro: 'Funcionário não encontrado na base de dados.' });
        }

        return res.status(200).json(funcionario);

    } catch (error) {
        console.error('Erro ao buscar funcionário:', error);
        return res.status(500).json({ erro: 'Erro interno no servidor.' });
    }
};

const atualizarFuncionario = async (req, res) => {
    try {
        const { id } = req.params;
        const { nome, data_nascimento } = req.body;

        const funcionarioAtualizado = await prisma.funcionario.update({
            where: { id_funcionario: parseInt(id) },
            data: {
                nome,
                data_aniversario: data_nascimento ? new Date(data_nascimento) : undefined
            }
        });

        return res.status(200).json({
            mensagem: 'Funcionário atualizado com sucesso!',
            funcionario: funcionarioAtualizado
        });

    } catch (error) {
        console.error('Erro ao atualizar:', error);
        if (error.code === 'P2025') {
            return res.status(404).json({ erro: 'Funcionário não encontrado.' });
        }
        return res.status(500).json({ erro: 'Erro interno no servidor.' });
    }
};

const deletarFuncionario = async (req, res) => {
    try {
        const { id } = req.params;

        await prisma.funcionario.delete({
            where: { id_funcionario: parseInt(id) }
        });

        return res.status(200).json({
            mensagem: 'Funcionário removido com sucesso!'
        });

    } catch (error) {
        console.error('Erro ao deletar:', error);
        if (error.code === 'P2025') {
            return res.status(404).json({ erro: 'Funcionário não encontrado.' });
        }
        return res.status(500).json({ erro: 'Erro interno no servidor.' });
    }
};

module.exports = {
    cadastrarFuncionario,
    buscarFuncionario,
    atualizarFuncionario,
    deletarFuncionario
};