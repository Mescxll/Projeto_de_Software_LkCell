const Database = require('better-sqlite3');
const db = new Database('./dev.db', { verbose: console.log });

const cadastrarCliente = async (req, res) => {
    try {
        const {
            nome, tipo_cliente, telefone, logadouro, cidade, uf, numero, cep, bairro,
            cpf, cnpj, razao_social, nome_fantasia
        } = req.body;

        const insertTransaction = db.transaction(() => {
            const stmtCliente = db.prepare(`
                INSERT INTO Cliente (nome, tipo_cliente, logadouro, cidade, uf, numero, cep, bairro) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `);
            const resultCliente = stmtCliente.run(nome, tipo_cliente, logadouro, cidade, uf, numero, cep, bairro);
            const clienteId = resultCliente.lastInsertRowid;

            if (telefone) {
                const stmtTelefone = db.prepare('INSERT INTO Telefone (numero, clienteId) VALUES (?, ?)');
                stmtTelefone.run(telefone, clienteId);
            }

            if (tipo_cliente === 'FISICA') {
                const stmtPF = db.prepare('INSERT INTO PessoaFisica (cpf, clienteId) VALUES (?, ?)');
                stmtPF.run(cpf, clienteId);
            } else if (tipo_cliente === 'JURIDICA') {
                const stmtPJ = db.prepare('INSERT INTO PessoaJuridica (cnpj, razao_social, nome_fantasia, clienteId) VALUES (?, ?, ?, ?)');
                stmtPJ.run(cnpj, razao_social, nome_fantasia, clienteId);
            }

            return clienteId;
        });

        const novoId = insertTransaction();

        return res.status(201).json({
            mensagem: 'Cliente cadastrado com sucesso!',
            idGerado: novoId
        });

    } catch (error) {
        console.error('Erro no SQL:', error);
        
        if (error.code === 'SQLITE_CONSTRAINT_UNIQUE' || error.code === 'SQLITE_CONSTRAINT_PRIMARYKEY') {
            return res.status(409).json({ erro: 'Documento (CPF/CNPJ) já cadastrado.' });
        }

        return res.status(500).json({ erro: 'Erro interno no servidor ao salvar.' });
    }
};

const buscarCliente = async (req, res) => {
    try {
        const { documento } = req.params;
        const documentoLimpo = documento.replace(/\D/g, '');

        if (!documentoLimpo) {
            return res.status(400).json({
                erro: 'Documento inválido. Certifique-se de enviar apenas números.'
            });
        }

        const stmtCliente = db.prepare(`
            SELECT c.*, 
                   pf.cpf, 
                   pj.cnpj, pj.razao_social, pj.nome_fantasia
            FROM Cliente c
            LEFT JOIN PessoaFisica pf ON c.id_cliente = pf.clienteId
            LEFT JOIN PessoaJuridica pj ON c.id_cliente = pj.clienteId
            WHERE pf.cpf = ? OR pj.cnpj = ?
        `);
        
        const cliente = stmtCliente.get(documentoLimpo, documentoLimpo);

        if (!cliente) {
            return res.status(404).json({ erro: 'Cliente não encontrado na base de dados.' });
        }

        const stmtTelefones = db.prepare('SELECT numero FROM Telefone WHERE clienteId = ?');
        const telefones = stmtTelefones.all(cliente.id_cliente);

        const resposta = {
            ...cliente,
            telefones: telefones.map(t => t.numero)
        };

        return res.status(200).json(resposta);

    } catch (error) {
        console.error('Erro ao buscar cliente:', error);
        return res.status(500).json({ erro: 'Erro interno no servidor.' });
    }
};

const atualizarCliente = async (req, res) => {
    try {
        const { documento } = req.params;
        const { nome, logadouro, cidade, uf, numero, cep, bairro } = req.body;
        const documentoLimpo = documento.replace(/\D/g, '');

        if (!documentoLimpo) {
            return res.status(400).json({ erro: 'Documento inválido.' });
        }

        const stmtFindId = db.prepare(`
            SELECT clienteId FROM PessoaFisica WHERE cpf = ?
            UNION
            SELECT clienteId FROM PessoaJuridica WHERE cnpj = ?
        `);
        const row = stmtFindId.get(documentoLimpo, documentoLimpo);

        if (!row) {
            return res.status(404).json({ erro: 'Cliente não encontrado na base de dados.' });
        }

        const clienteId = row.clienteId;

        const stmtUpdate = db.prepare(`
            UPDATE Cliente 
            SET nome = COALESCE(?, nome),
                logadouro = COALESCE(?, logadouro),
                cidade = COALESCE(?, cidade),
                uf = COALESCE(?, uf),
                numero = COALESCE(?, numero),
                cep = COALESCE(?, cep),
                bairro = COALESCE(?, bairro)
            WHERE id_cliente = ?
        `);
        
        stmtUpdate.run(
            nome ?? null, 
            logadouro ?? null, 
            cidade ?? null, 
            uf ?? null, 
            numero ?? null, 
            cep ?? null, 
            bairro ?? null, 
            clienteId
        );

        const stmtClienteAtualizado = db.prepare('SELECT * FROM Cliente WHERE id_cliente = ?');
        const clienteAtualizado = stmtClienteAtualizado.get(clienteId);

        return res.status(200).json({
            mensagem: 'Cliente atualizado com sucesso!',
            cliente: clienteAtualizado
        });

    } catch (error) {
        console.error('Erro ao atualizar cliente:', error);
        return res.status(500).json({ erro: 'Erro interno no servidor.' });
    }
};

const deletarCliente = async (req, res) => {
    try {
        const { documento } = req.params;
        const documentoLimpo = documento.replace(/\D/g, '');

        if (!documentoLimpo) {
            return res.status(400).json({ erro: 'Documento inválido. Certifique-se de enviar apenas números.' });
        }

        const stmtFindId = db.prepare(`
            SELECT clienteId FROM PessoaFisica WHERE cpf = ?
            UNION
            SELECT clienteId FROM PessoaJuridica WHERE cnpj = ?
        `);
        const row = stmtFindId.get(documentoLimpo, documentoLimpo);

        if (!row) {
            return res.status(404).json({ erro: 'Cliente não encontrado na base de dados.' });
        }

        const clienteId = row.clienteId;

        const deleteTransaction = db.transaction(() => {
            db.prepare('DELETE FROM Telefone WHERE clienteId = ?').run(clienteId);
            db.prepare('DELETE FROM PessoaFisica WHERE clienteId = ?').run(clienteId);
            db.prepare('DELETE FROM PessoaJuridica WHERE clienteId = ?').run(clienteId);
            db.prepare('DELETE FROM Cliente WHERE id_cliente = ?').run(clienteId);
        });

        deleteTransaction();

        return res.status(200).json({
            mensagem: 'Cliente deletado com sucesso!'
        });

    } catch (error) {
        console.error('Erro ao deletar cliente:', error);
        return res.status(500).json({ erro: 'Erro interno no servidor ao deletar.' });
    }
};

module.exports = {
    cadastrarCliente,
    buscarCliente,
    atualizarCliente,
    deletarCliente
};