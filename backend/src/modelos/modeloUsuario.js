// modeloUsuario.js
//
// "Modelo" de Usuário: só cuida de conversar com o banco de dados
// (tabela "usuarios"). Nenhuma regra de negócio aqui - isso fica
// no controlador.

const pool = require("../database");

// Busca todos os usuários cadastrados
async function listar() {
  const resultado = await pool.query("SELECT * FROM usuarios ORDER BY id");
  return resultado.rows;
}

// Busca um usuário pelo id. Retorna undefined se não existir.
async function buscarPorId(id) {
  const resultado = await pool.query(
    "SELECT * FROM usuarios WHERE id = $1",
    [id],
  );
  return resultado.rows[0];
}

// Busca um usuário pelo e-mail. Usado pelo controlador para checar
// se o e-mail já está em uso antes de criar/atualizar um usuário.
async function buscarPorEmail(email) {
  const resultado = await pool.query(
    "SELECT * FROM usuarios WHERE email = $1",
    [email],
  );
  return resultado.rows[0];
}

// Cria um novo usuário no banco.
async function criar(dados) {
  const resultado = await pool.query(
    "INSERT INTO usuarios (nome, email) VALUES ($1, $2) RETURNING *",
    [dados.nome, dados.email],
  );
  return resultado.rows[0];
}

// Atualiza nome e/ou email de um usuário existente.
// COALESCE mantém o valor antigo caso o novo não seja informado
// (veja o mesmo comentário em modeloLivro.js).
async function atualizar(id, dados) {
  const resultado = await pool.query(
    `UPDATE usuarios
     SET nome  = COALESCE($1, nome),
         email = COALESCE($2, email)
     WHERE id = $3
     RETURNING *`,
    [dados.nome, dados.email, id],
  );
  return resultado.rows[0]; // undefined se o id não existir
}

// Remove um usuário do banco.
// Retorna true se apagou, false se não existia usuário com esse id.
async function deletar(id) {
  const resultado = await pool.query("DELETE FROM usuarios WHERE id = $1", [
    id,
  ]);
  return resultado.rowCount > 0;
}

module.exports = {
  listar,
  buscarPorId,
  buscarPorEmail,
  criar,
  atualizar,
  deletar,
};
