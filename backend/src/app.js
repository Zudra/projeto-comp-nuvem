// app.js
//
// Aqui é onde o Express é configurado: middlewares globais, as
// rotas da aplicação, e o tratamento de erros.

const express = require("express");
const cors = require("cors");
const app = express();

// Middlewares globais (rodam em toda requisição, antes das rotas)
app.use(cors()); // permite que o front-end (outra origem/porta) acesse essa API
app.use(express.json()); // permite ler JSON enviado no corpo (body) das requisições

// Rotas: cada arquivo cuida de um "recurso" da aplicação
const livroRoutes = require("./rotas/rotasLivro");
const usuarioRoutes = require("./rotas/rotasUsuario");
const reservaRoutes = require("./rotas/rotasReservas");

app.use("/livros", livroRoutes);
app.use("/usuarios", usuarioRoutes);
app.use("/reservas", reservaRoutes);

// Rota raiz, só para confirmar que a API está no ar
app.get("/", (req, res) => {
  res.json({ mensagem: "Bem-vindo à API da Biblioteca" });
});

// Middleware de erro: captura qualquer erro não tratado dentro dos
// controladores (inclusive erros de banco de dados). O Express 5
// encaminha automaticamente para cá os erros lançados dentro de
// funções "async" (não precisa de try/catch em toda rota).
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ erro: "Erro interno do servidor" });
});

module.exports = app;
