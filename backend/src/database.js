// database.js
//
// Este arquivo é responsável por criar a conexão com o PostgreSQL.
// Todos os "modelos" (modeloLivro, modeloUsuario, modeloReserva)
// importam o "pool" exportado aqui para executar suas consultas SQL.
//
// Um "Pool" é um conjunto de conexões com o banco que o driver
// gerencia para a gente - não precisamos abrir/fechar conexão manual
// a cada consulta, só usar pool.query(...).

const { Pool, types } = require("pg");

// Por padrão, o driver do PostgreSQL converte colunas do tipo DATE
// em objetos "Date" do JavaScript. Quando isso vira JSON na resposta
// da API, o formato fica cheio de hora e fuso horário
// (ex: "2026-08-23T00:00:00.000Z"), o que é confuso para quem está
// aprendendo. Aqui pedimos para o driver manter a data exatamente
// como o banco devolve, no formato simples "AAAA-MM-DD".
types.setTypeParser(types.builtins.DATE, (valor) => valor);

// As informações de conexão vêm de variáveis de ambiente
// (DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD). No Docker elas
// são definidas pelo docker-compose.yml (.env.example / .env da raiz);
// rodando sem Docker, vêm do arquivo backend/.env.
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

module.exports = pool;
