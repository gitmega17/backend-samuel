const pool = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const login_user = async (req, res) => {
    console.log('Dados login recebido', req.body);

    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).send('Verifique se o usuário e a senha estão corretos');
    }

    const client = await pool.connect();
    try{
        const result = await client.query('SELECT * FROM usuarios WHERE username = $1', [username]);
        
        if (result.rows.length === 0) {
            return res.status(404).send('Usuário não encontrado.');
        }

        const usuario = result.rows[0];

        const senha_correta= await bcrypt.compare(password, usuario.password);
        if (!senha_correta) {
            return res.status(401).send('Senha incorreta.');
        } 
        
        const token = jwt.sign(
            {id: usuario.id, username: usuario.username},
            'ChaveSecreta',
            {expiresIn: '2h'}
        );

        console.log('Login realizado com sucesso para o usuário', username);
        res.status(200).json({message:'Login realizado com Sucesso.', token });
    } catch (err) {
        console.error('Erro ao efetuar login', err);
        res.status(500).send('Erro ao relizar login.');
    } finally {
        client.release();
    }
};

module.exports = {
    login_user
};