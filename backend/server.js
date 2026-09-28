// server.js
//
// Ponto de partida da aplicação. É este arquivo que é executado com
// "npm start" (ou "npm run dev"). Ele carrega as variáveis de
// ambiente do .env, pega o app do Express (configurado em src/app.js)
// e coloca o servidor para escutar requisições.

require("dotenv").config();
const app = require("./src/app");

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
