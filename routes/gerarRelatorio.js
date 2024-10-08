const pool = require('../config/db'); 

const gerarRelatorio = async (req, res) => {
    const { MotorID, parametro } = req.body;

    // Validações básicas
    if (!MotorID || !parametro) {
        return res.status(400).send('MotorID e parâmetro são obrigatórios.');
    }

    let selectQuery = '';
    let ultimaLeituraVibracao = null; // Inicializa a variável para a última leitura de vibração
    if (parametro === 'completo') {
        selectQuery = 'Temperatura, Frequencia, Corrente, Vibracao, Pressao';
    } else {
        const parametrosPermitidos = ['Temperatura', 'Frequencia', 'Corrente', 'Vibracao', 'Pressao'];
        if (!parametrosPermitidos.includes(parametro)) {
            return res.status(400).send('Parâmetro inválido.');
        }
        selectQuery = parametro;
    }

    const query = `SELECT ${selectQuery}, ColetaID FROM dados_sensores_motores WHERE MotorID = $1`;
    console.log('Query:', query, 'Params:', [MotorID]);

    let client;
    try {
        client = await pool.connect();
        const result = await client.query(query, [MotorID]);
        console.log('Resultado da consulta:', result.rows);

        const rows = result.rows;

        if (rows.length === 0) {
            return res.send('Nenhum dado encontrado para este motor.');
        }

        // Se o parâmetro for "Vibracao", busque a última leitura
        if (parametro === 'Vibracao') {
            // Buscando a última leitura de vibração pelo ColetaID
            const ultimaVibracaoQuery = `
                SELECT Vibracao, ColetaID 
                FROM dados_sensores_motores 
                WHERE MotorID = $1 
                ORDER BY ColetaID DESC 
                LIMIT 1`;
            const ultimaVibracaoResult = await client.query(ultimaVibracaoQuery, [MotorID]);
            if (ultimaVibracaoResult.rows.length > 0) {
                ultimaLeituraVibracao = ultimaVibracaoResult.rows[0].vibracao;
            } else {
                ultimaLeituraVibracao = 'Nenhuma leitura de vibração encontrada.';
            }
        }

        const calcularRelatorio = (dados, parametro, MotorID) => {
            // Verifica se o parâmetro "Vibracao" está presente e contém "ok"
            if (parametro === 'Vibracao') {
                dados.forEach(row => {
                    if (row[parametro.toLowerCase()] === 'ok') {
                        row[parametro.toLowerCase()] = null; // Define como null para ignorar no cálculo
                    }
                });
            }

            // Para parâmetros que não sejam "Vibracao", verifica se existem dados válidos
            if (parametro !== 'Vibracao') {
                const valores = dados.map(row => row[parametro.toLowerCase()]).filter(val => val !== null && val !== undefined);
                const total = valores.length;

                if (total === 0) {
                    return `Nenhum dado válido encontrado para o parâmetro ${parametro}.`;
                }

                const totalSomado = valores.reduce((acc, val) => acc + parseFloat(val), 0);
                const media = totalSomado / total;
                const maximo = Math.max(...valores);
                const minimo = Math.min(...valores);
                const desvioPadrao = Math.sqrt(valores.map(val => (val - media) ** 2).reduce((acc, val) => acc + val, 0) / total) || 0;

                let mensagensErros = [];

                // Condições de verificação
                const condicoes = {
                    'Temperatura': { limite: [20, 90], unidade: '°C' },
                    'Frequencia': { limite: [50, 60], unidade: 'Hz' },
                    'Corrente': { limite: [0, 100], unidade: 'A' },
                    'Pressao': { limite: [1, 10], unidade: 'bar' }
                };

                if (media < condicoes[parametro].limite[0] || media > condicoes[parametro].limite[1]) {
                    mensagensErros.push(`A média de ${parametro} (${media.toFixed(2)}${condicoes[parametro].unidade}) está fora do intervalo normal (${condicoes[parametro].limite[0]}${condicoes[parametro].unidade} - ${condicoes[parametro].limite[1]}${condicoes[parametro].unidade}).`);
                }

                if (desvioPadrao > 0.5) {
                    mensagensErros.push(`Os dados apresentam irregularidades, com desvio padrão de ${desvioPadrao.toFixed(2)}.`);
                }

                const mensagensErrosTexto = mensagensErros.length > 0 ? mensagensErros.join('\n') : 'Todos os valores estão dentro dos limites normais.';

                return `
Relatório do Motor ${MotorID} para o parâmetro ${parametro}:

Número de leituras: ${total}
Valor máximo: ${maximo.toFixed(3)}
Valor mínimo: ${minimo.toFixed(3)}
Média: ${media.toFixed(2)}
Desvio Padrão: ${desvioPadrao.toFixed(2)}

Mensagens de verificação de condições:

${mensagensErrosTexto}\n`;
            } else {
                // Para "Vibracao", apenas retornar a última leitura
                return `Última leitura de vibração do motor: ${ultimaLeituraVibracao}`;
            }
        };

        const gerarRelatorioCompleto = (dados, MotorID) => {
            let relatorioCompleto = '';
            const parametros = ['Temperatura', 'Frequencia', 'Corrente', 'Vibracao', 'Pressao'];
            
            parametros.forEach(param => {
                const relatorio = calcularRelatorio(dados, param, MotorID);
                relatorioCompleto += relatorio + '\n';
            });

            return relatorioCompleto;
        };

        let relatorioFinal = '';
        if (parametro === 'completo') {
            relatorioFinal = gerarRelatorioCompleto(rows, MotorID);
        } else {
            relatorioFinal = calcularRelatorio(rows, parametro, MotorID);
        }

        res.json({ relatorio: relatorioFinal });

    } catch (err) {
        console.error('Erro ao buscar dados no banco de dados:', err);
        res.status(500).send('Erro ao buscar os dados.');
    } finally {
        if (client) {
            client.release();
        }
    }
};

module.exports = {
    gerarRelatorio
};
