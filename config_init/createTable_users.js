const pool = require('../config/db');

const criandoTabelaUsuario = async () => {
    const client = await pool.connect();
    try {
        await client.query(
            `
            CREATE TABLE IF NOT EXISTS usuarios (
                id SERIAL PRIMARY KEY,
                username TEXT NOT NULL UNIQUE,
                password TEXT NOT NULL  
            );
            `
        );
        console.log('Tabela de Usuários criada com sucesso');
    } catch (err){
        console.error('Erro ao criar tabela de usuários ou tabela já existente :', err);
    } finally {
        client.release();
    }
};

module.exports = criandoTabelaUsuario;