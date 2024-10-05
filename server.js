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

app.listen(PORTA, () => {
    console.log(`Servidor conectado e rodando em http://localhost:${PORTA}`);
});

app.timeout = 0;
