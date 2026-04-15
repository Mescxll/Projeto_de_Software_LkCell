const Database = require('better-sqlite3');
const db = new Database('./dev.db', { verbose: console.log });

const cadastrarFuncionario = async (req, res) => {
    try {
        const { nome, data_nascimento } = req.body;

        const stmt = db.prepare(`
            INSERT INTO Funcionario (nome, data_nascimento) 
            VALUES (?, ?)
        `);
        const result = stmt.run(nome, data_nascimento);

        return res.status(201).json({
            mensagem: 'Funcionário cadastrado com sucesso!',
            idGerado: result.lastInsertRowid
        });

    } catch (error) {
        console.error('Erro no SQL:', error);
        return res.status(500).json({ erro: 'Erro interno no servidor ao salvar.' });
    }
};

const buscarFuncionario = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id || isNaN(id)) {
            return res.status(400).json({
                erro: 'ID inválido. Certifique-se de enviar um número válido.'
            });
        }

        const stmt = db.prepare(`
            SELECT id_funcionario, nome, data_nascimento
            FROM Funcionario
            WHERE id_funcionario = ?
        `);
        
        const funcionario = stmt.get(id);

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

        if (!id || isNaN(id)) {
            return res.status(400).json({
                erro: 'ID inválido. Certifique-se de enviar um número válido.'
            });
        }

        // Verificar se funcionário existe
        const stmtVerifica = db.prepare('SELECT id_funcionario FROM Funcionario WHERE id_funcionario = ?');
        const funcionarioExistente = stmtVerifica.get(id);

        if (!funcionarioExistente) {
            return res.status(404).json({ erro: 'Funcionário não encontrado.' });
        }

        // Preparar campos para atualizar
        const campos = [];
        const valores = [];

        if (nome !== undefined) {
            campos.push('nome = ?');
            valores.push(nome);
        }

        if (data_nascimento !== undefined) {
            campos.push('data_nascimento = ?');
            valores.push(data_nascimento);
        }

        if (campos.length === 0) {
            return res.status(400).json({ erro: 'Nenhum campo para atualizar.' });
        }

        valores.push(id);

        const stmt = db.prepare(`
            UPDATE Funcionario
            SET ${campos.join(', ')}
            WHERE id_funcionario = ?
        `);
        
        stmt.run(...valores);

        return res.status(200).json({
            mensagem: 'Funcionário atualizado com sucesso!'
        });

    } catch (error) {
        console.error('Erro ao atualizar funcionário:', error);
        return res.status(500).json({ erro: 'Erro interno no servidor.' });
    }
};

const deletarFuncionario = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id || isNaN(id)) {
            return res.status(400).json({
                erro: 'ID inválido. Certifique-se de enviar um número válido.'
            });
        }

        // Verificar se funcionário existe
        const stmtVerifica = db.prepare('SELECT id_funcionario FROM Funcionario WHERE id_funcionario = ?');
        const funcionarioExistente = stmtVerifica.get(id);

        if (!funcionarioExistente) {
            return res.status(404).json({ erro: 'Funcionário não encontrado.' });
        }

        const stmt = db.prepare('DELETE FROM Funcionario WHERE id_funcionario = ?');
        stmt.run(id);

        return res.status(200).json({
            mensagem: 'Funcionário removido com sucesso!'
        });

    } catch (error) {
        console.error('Erro ao deletar funcionário:', error);
        return res.status(500).json({ erro: 'Erro interno no servidor.' });
    }
};

module.exports = {
    cadastrarFuncionario,
    buscarFuncionario,
    atualizarFuncionario,
    deletarFuncionario
};
