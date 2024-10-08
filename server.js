const http = require('http');
const app = require('./app');
const criandoTabelaUsuario = require('./config_init/createTable_users');
const criandoTabelasMotores = require('./config_init/createTables_sensores');
const PORTA = 3000;

criandoTabelaUsuario();
criandoTabelasMotores();

const server = http.createServer(app);

server.keepAliveTimeout = 30000;
server.headersTimeout = 10000;

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});

app.timeout = 0;
