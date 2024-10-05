const pool = require('../config/db');
const bcrypt = require('bcrypt');

const cadastro_usuario = async (req, res) => {
    console.log('Dados do Cadastro recebido com sucesso', req.body);

    const cadastro_usuario = req.body;

    if(!cadastro_usuario || !cadastro_usuario.username || !cadastro_usuario.password) {
        return res.status(400).send('Dados de cadastro não recebidos');
    }

    const {username, password} = cadastro_usuario;

    const client = await pool.connect();
    try{
        await client.query('BEGIN');
        console.log('Conectando ao Banco de  Dados challenge_reply_db para inserir dados challenge_reply_db');

        const usuario_existe = await client.query('SELECT id FROM usuarios WHERE username = $1', [username]);

        if (usuario_existe.rows.length > 0) {
            await client.query('ROLLBACK');
            return res.status(409).send('Usuário já cadastrado');
        }

        const hashPassword = await bcrypt.hash(password, 10);

        await client.query (
            'INSERT INTO usuarios (username, password) VALUES ($1, $2)',
            [username, hashPassword]
        );

        await client.query('COMMIT');
        console.log('Dados do usuario cadastrado com sucesso no banco de dados challenge_reply_db');
        res.status(200).send('Dados dos usuario cadastrado com sucesso.');
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Erro ao cadastrar usário no banco de Dados challenge_reply_db.', err);
        res.status(500).send('Erro ao cadastrar usário no banco de Dados challenge_reply_db.');
    } finally {
        client.release()
        console.log('Conexão com Banco de Dados challenge_reply_db liberada');
    }
};

module.exports = {
    cadastro_usuario
};