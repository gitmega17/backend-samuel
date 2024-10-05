const express = require('express');
const app = express();
const pool = require('./config/db');
const g_routes = require('./routes_general/g_routes');
const middleware = require('./middleware_auth');

app.use(express.json());

app.use('/', g_routes);

app.use('/inserir_dados_motores', middleware);
app.use('/colentando_dados_motores', middleware);

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Algo deu errado capturado pelo middleware!');
});

process.on('SIGTERM', () => {
    pool.end(() => {
        console.log('Pool de Conexões fechado Termino do processo');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    pool.end(() => {
        console.log('Pool de Conexões fechado Termino do processo efetuado pelo terminal');
        process.exit(0);
    });
});
module.exports = app;