const express = require('express');
const router = express.Router();
const g_routes_cadastro = require('../routes/cadastro');
const g_routes_login = require('../routes/login');
const g_routes_post = require('../routes/post');
const g_routes_gerarRelatorio = require('../routes/gerarRelatorio');
const g_routes_get = require('../routes/get');
const authMiddleware = require('../middleware_auth');


router.post('/cadastro', g_routes_cadastro.cadastro_usuario);
router.post('/login', g_routes_login.login_user);

router.post('/inserir_dados_motores', authMiddleware, g_routes_post.inserirDadosMotores);
router.post('/gerar_relatorio', g_routes_gerarRelatorio.gerarRelatorio);

router.get('/coletando_dados_motores', authMiddleware, g_routes_get.coletarDadosMotores);
router.get('/coletando_dados_motores/:coletaID', authMiddleware, g_routes_get.coletarDadosMotores);


module.exports = router;